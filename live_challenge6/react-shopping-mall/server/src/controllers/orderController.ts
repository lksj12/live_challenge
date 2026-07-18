import type {
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type {
    CreateOrderItemRequest,
    CreateOrderRequestBody,
    ShippingStatus,
} from '../types/order';
import type {
    AccessTokenPayload,
} from '../utils/token';

interface OrderRow {
    id: number;
    total_amount: number;
    payment_status: 'paid' | 'cancelled';
    created_at: string;
}

interface OrderItemRow {
    id: number;
    order_id: number;
    product_id: number;
    title: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    shipping_status: ShippingStatus;
}

interface InventoryRow {
    product_id: number;
    stock: number;
}

class InventoryConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InventoryConflictError';
    }
}

function getAuth(
    response: Response,
): AccessTokenPayload | null {
    const auth = response.locals.auth as
        | AccessTokenPayload
        | undefined;

    return auth ?? null;
}

function isValidOrderItem(
    value: unknown,
): value is CreateOrderItemRequest {
    if (
        typeof value !== 'object'
        || value === null
    ) {
        return false;
    }

    const item =
        value as Partial<CreateOrderItemRequest>;

    return (
        typeof item.productId === 'number'
        && Number.isInteger(item.productId)
        && item.productId > 0

        && typeof item.title === 'string'
        && item.title.trim().length > 0
        && item.title.trim().length <= 300

        && typeof item.price === 'number'
        && Number.isFinite(item.price)
        && item.price >= 0

        && typeof item.image === 'string'
        && item.image.length <= 2000

        && typeof item.category === 'string'
        && item.category.length <= 100

        && typeof item.quantity === 'number'
        && Number.isInteger(item.quantity)
        && item.quantity >= 1
        && item.quantity <= 99
    );
}

function hasDuplicateProductIds(
    items: CreateOrderItemRequest[],
): boolean {
    const productIds = new Set<number>();

    for (const item of items) {
        if (productIds.has(item.productId)) {
            return true;
        }

        productIds.add(item.productId);
    }

    return false;
}

function buildOrderResponse(
    order: OrderRow,
    items: OrderItemRow[],
) {
    return {
        id: order.id,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        items: items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
            shippingStatus: item.shipping_status,
        })),
    };
}

export function createOrder(
    request: Request,
    response: Response,
): void {
    const auth = getAuth(response);

    const body =
        request.body as Partial<CreateOrderRequestBody>;

    if (!auth) {
        response.status(401).json({
            success: false,
            message:
                '결제를 진행하려면 로그인이 필요합니다.',
        });
        return;
    }

    if (
        !Array.isArray(body.items)
        || body.items.length === 0
        || body.items.length > 50
        || !body.items.every(isValidOrderItem)
    ) {
        response.status(400).json({
            success: false,
            message:
                '올바른 주문 상품 정보가 필요합니다.',
        });
        return;
    }

    const items = body.items;

    if (hasDuplicateProductIds(items)) {
        response.status(400).json({
            success: false,
            message:
                '같은 상품이 주문 목록에 중복되어 있습니다.',
        });
        return;
    }

    const totalAmount = Number(
        items
            .reduce(
                (total, item) => {
                    return (
                        total
                        + item.price * item.quantity
                    );
                },
                0,
            )
            .toFixed(2),
    );

    const selectInventory = db.prepare(`
        SELECT
            product_id,
            stock
        FROM product_inventory
        WHERE product_id = ?
    `);

    const decreaseInventory = db.prepare(`
        UPDATE product_inventory
        SET
            stock = stock - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            product_id = ?
            AND stock >= ?
    `);

    const insertOrder = db.prepare(`
        INSERT INTO orders (
            user_id,
            total_amount,
            payment_status
        )
        VALUES (?, ?, 'paid')
    `);

    const insertOrderItem = db.prepare(`
        INSERT INTO order_items (
            order_id,
            product_id,
            title,
            price,
            image,
            category,
            quantity,
            shipping_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'preparing')
    `);

    const createOrderTransaction =
        db.transaction(() => {
            /*
             * 먼저 현재 재고를 검사한다.
             */
            for (const item of items) {
                const inventory =
                    selectInventory.get(
                        item.productId,
                    ) as InventoryRow | undefined;

                if (!inventory) {
                    throw new InventoryConflictError(
                        `${item.title} 상품의 재고 정보를 찾을 수 없습니다.`,
                    );
                }

                if (inventory.stock === 0) {
                    throw new InventoryConflictError(
                        `${item.title} 상품은 현재 품절입니다.`,
                    );
                }

                if (
                    inventory.stock
                    < item.quantity
                ) {
                    throw new InventoryConflictError(
                        `${item.title} 상품의 재고가 부족합니다. 현재 ${inventory.stock}개까지 구매할 수 있습니다.`,
                    );
                }
            }

            /*
             * 조건부 UPDATE를 사용하여 재고를 차감한다.
             * 결제 사이에 재고가 변경된 경우에도
             * stock >= quantity 조건이 결제를 차단한다.
             */
            for (const item of items) {
                const updateResult =
                    decreaseInventory.run(
                        item.quantity,
                        item.productId,
                        item.quantity,
                    );

                if (updateResult.changes !== 1) {
                    const currentInventory =
                        selectInventory.get(
                            item.productId,
                        ) as InventoryRow | undefined;

                    const currentStock =
                        currentInventory?.stock ?? 0;

                    throw new InventoryConflictError(
                        `${item.title} 상품의 재고가 변경되었습니다. 현재 ${currentStock}개까지 구매할 수 있습니다.`,
                    );
                }
            }

            const orderResult =
                insertOrder.run(
                    auth.userId,
                    totalAmount,
                );

            const orderId =
                Number(
                    orderResult.lastInsertRowid,
                );

            for (const item of items) {
                insertOrderItem.run(
                    orderId,
                    item.productId,
                    item.title.trim(),
                    item.price,
                    item.image,
                    item.category.trim(),
                    item.quantity,
                );
            }

            return orderId;
        });

    try {
        const orderId =
            createOrderTransaction();

        const order = db
            .prepare(`
                SELECT
                    id,
                    total_amount,
                    payment_status,
                    created_at
                FROM orders
                WHERE id = ?
            `)
            .get(orderId) as OrderRow | undefined;

        if (!order) {
            throw new Error(
                '생성된 주문을 찾을 수 없습니다.',
            );
        }

        const orderItems = db
            .prepare(`
                SELECT
                    id,
                    order_id,
                    product_id,
                    title,
                    price,
                    image,
                    category,
                    quantity,
                    shipping_status
                FROM order_items
                WHERE order_id = ?
                ORDER BY id ASC
            `)
            .all(orderId) as OrderItemRow[];

        response.status(201).json({
            success: true,
            message: '결제되었습니다.',
            order: buildOrderResponse(
                order,
                orderItems,
            ),
        });
    } catch (error) {
        if (
            error
            instanceof InventoryConflictError
        ) {
            response.status(409).json({
                success: false,
                message: error.message,
            });
            return;
        }

        console.error(
            '주문 생성 오류:',
            error,
        );

        response.status(500).json({
            success: false,
            message:
                '결제 처리 중 오류가 발생했습니다.',
        });
    }
}

export function getMyOrders(
    _request: Request,
    response: Response,
): void {
    const auth = getAuth(response);

    if (!auth) {
        response.status(401).json({
            success: false,
            message:
                '구매 내역을 보려면 로그인이 필요합니다.',
        });
        return;
    }

    const orders = db
        .prepare(`
            SELECT
                id,
                total_amount,
                payment_status,
                created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY id DESC
        `)
        .all(auth.userId) as OrderRow[];

    const selectItems = db.prepare(`
        SELECT
            id,
            order_id,
            product_id,
            title,
            price,
            image,
            category,
            quantity,
            shipping_status
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
    `);

    response.status(200).json({
        success: true,
        orders: orders.map((order) => {
            const items =
                selectItems.all(
                    order.id,
                ) as OrderItemRow[];

            return buildOrderResponse(
                order,
                items,
            );
        }),
    });
}
