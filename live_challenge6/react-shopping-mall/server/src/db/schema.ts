import bcrypt from 'bcryptjs';

import { db } from './database';

interface UserIdRow {
    id: number;
}

interface CountRow {
    count: number;
}

interface SeedUser {
    email: string;
    password: string;
    nickname: string;
    role: 'user' | 'admin';
}

const initialProductStock: Record<number, number> = {
    1: 8,
    2: 0,
    3: 24,
    4: 3,
    5: 15,
    6: 0,
    7: 7,
    8: 19,
    9: 2,
    10: 12,
    11: 0,
    12: 5,
    13: 18,
    14: 9,
    15: 20,
    16: 4,
    17: 14,
    18: 0,
    19: 6,
    20: 11,
    1001: 0,
    1002: 4,
    1003: 18,
    1004: 7,
};

function getRequiredEnvironmentValue(
    name: string,
): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `${name} 환경변수가 필요합니다.`,
        );
    }

    return value;
}

function getOptionalEnvironmentValue(
    name: string,
    fallback: string,
): string {
    const value = process.env[name]?.trim();

    return value || fallback;
}

function ensureSeedUser(
    user: SeedUser,
): number {
    const normalizedEmail =
        user.email.trim().toLowerCase();

    const existingUser = db
        .prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `)
        .get(normalizedEmail) as UserIdRow | undefined;

    if (existingUser) {
        db.prepare(`
            UPDATE users
            SET
                nickname = ?,
                role = ?
            WHERE id = ?
        `).run(
            user.nickname,
            user.role,
            existingUser.id,
        );

        return existingUser.id;
    }

    const passwordHash =
        bcrypt.hashSync(user.password, 12);

    const result = db
        .prepare(`
            INSERT INTO users (
                email,
                password_hash,
                nickname,
                role,
                must_change_password
            )
            VALUES (?, ?, ?, ?, 0)
        `)
        .run(
            normalizedEmail,
            passwordHash,
            user.nickname,
            user.role,
        );

    return Number(result.lastInsertRowid);
}

function seedProductInventory(): void {
    const insertInventory = db.prepare(`
        INSERT OR IGNORE INTO product_inventory (
            product_id,
            stock
        )
        VALUES (?, ?)
    `);

    const seed = db.transaction(() => {
        Object.entries(initialProductStock)
            .forEach(([productId, stock]) => {
                insertInventory.run(
                    Number(productId),
                    stock,
                );
            });
    });

    seed();
}

function seedTestOrders(
    testUserId: number,
): void {
    const orderCount = db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM orders
            WHERE user_id = ?
        `)
        .get(testUserId) as CountRow;

    if (orderCount.count > 0) {
        return;
    }

    const insertOrder = db.prepare(`
        INSERT INTO orders (
            user_id,
            total_amount,
            payment_status,
            created_at
        )
        VALUES (?, ?, 'paid', ?)
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seed = db.transaction(() => {
        const shippingOrder = insertOrder.run(
            testUserId,
            109.95,
            '2026-07-14 10:30:00',
        );

        insertOrderItem.run(
            shippingOrder.lastInsertRowid,
            1,
            'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
            109.95,
            'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
            "men's clothing",
            1,
            'shipping',
        );

        const deliveredOrder = insertOrder.run(
            testUserId,
            45.6,
            '2026-07-08 15:20:00',
        );

        insertOrderItem.run(
            deliveredOrder.lastInsertRowid,
            2,
            'Mens Casual Premium Slim Fit T-Shirts',
            22.8,
            'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
            "men's clothing",
            2,
            'delivered',
        );
    });

    seed();
}

export function initializeDatabase(): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            nickname TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
            must_change_password INTEGER NOT NULL DEFAULT 0
                CHECK (must_change_password IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL
                CHECK (total_amount >= 0),
            payment_status TEXT NOT NULL DEFAULT 'paid'
                CHECK (
                    payment_status IN (
                        'paid',
                        'cancelled'
                    )
                ),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            price REAL NOT NULL
                CHECK (price >= 0),
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL
                CHECK (quantity >= 1),
            shipping_status TEXT NOT NULL DEFAULT 'preparing'
                CHECK (
                    shipping_status IN (
                        'preparing',
                        'shipping',
                        'delivered'
                    )
                ),
            FOREIGN KEY (order_id)
                REFERENCES orders(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS product_inventory (
            product_id INTEGER PRIMARY KEY,
            stock INTEGER NOT NULL DEFAULT 0
                CHECK (stock >= 0),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_orders_user_id
        ON orders(user_id);

        CREATE INDEX IF NOT EXISTS idx_order_items_order_id
        ON order_items(order_id);
    `);

    ensureSeedUser({
        email: getRequiredEnvironmentValue(
            'ADMIN_EMAIL',
        ),
        password: getRequiredEnvironmentValue(
            'ADMIN_PASSWORD',
        ),
        nickname: getOptionalEnvironmentValue(
            'ADMIN_NICKNAME',
            '관리자',
        ),
        role: 'admin',
    });

    const testUserId = ensureSeedUser({
        email: getRequiredEnvironmentValue(
            'TEST_USER_EMAIL',
        ),
        password: getRequiredEnvironmentValue(
            'TEST_USER_PASSWORD',
        ),
        nickname: getOptionalEnvironmentValue(
            'TEST_USER_NICKNAME',
            '테스트 사용자',
        ),
        role: 'user',
    });

    seedProductInventory();
    seedTestOrders(testUserId);
}
