import type {
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type {
    InventoryItem,
    UpdateProductStockRequestBody,
} from '../types/inventory';

interface InventoryRow {
    product_id: number;
    stock: number;
    updated_at: string;
}

function toInventoryItem(
    row: InventoryRow,
): InventoryItem {
    return {
        productId: row.product_id,
        stock: row.stock,
        updatedAt: row.updated_at,
    };
}

function parseProductId(
    value: string | string[] | undefined,
): number | null {
    const normalizedValue = Array.isArray(value)
        ? value[0]
        : value;

    if (!normalizedValue) {
        return null;
    }

    const productId = Number(normalizedValue);

    if (
        !Number.isInteger(productId)
        || productId <= 0
    ) {
        return null;
    }

    return productId;
}

export function listProductInventory(
    _request: Request,
    response: Response,
): void {
    const inventoryRows = db
        .prepare(`
            SELECT
                product_id,
                stock,
                updated_at
            FROM product_inventory
            ORDER BY product_id
        `)
        .all() as InventoryRow[];

    response.status(200).json({
        success: true,
        inventory:
            inventoryRows.map(toInventoryItem),
    });
}

export function updateProductStock(
    request: Request,
    response: Response,
): void {
    const productId = parseProductId(
        request.params.productId,
    );

    const body =
        request.body as Partial<UpdateProductStockRequestBody>;

    if (productId === null) {
        response.status(400).json({
            success: false,
            message: '올바른 상품 ID가 필요합니다.',
        });
        return;
    }

    if (
        typeof body.stock !== 'number'
        || !Number.isInteger(body.stock)
        || body.stock < 0
        || body.stock > 99999
    ) {
        response.status(400).json({
            success: false,
            message:
                '재고 수량은 0 이상 99,999 이하의 정수여야 합니다.',
        });
        return;
    }

    db.prepare(`
        INSERT INTO product_inventory (
            product_id,
            stock,
            updated_at
        )
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(product_id)
        DO UPDATE SET
            stock = excluded.stock,
            updated_at = CURRENT_TIMESTAMP
    `).run(
        productId,
        body.stock,
    );

    const updatedRow = db
        .prepare(`
            SELECT
                product_id,
                stock,
                updated_at
            FROM product_inventory
            WHERE product_id = ?
        `)
        .get(productId) as InventoryRow | undefined;

    if (!updatedRow) {
        response.status(500).json({
            success: false,
            message:
                '변경된 재고 정보를 불러오지 못했습니다.',
        });
        return;
    }

    response.status(200).json({
        success: true,
        message: '상품 재고가 변경되었습니다.',
        inventory: toInventoryItem(updatedRow),
    });
}
