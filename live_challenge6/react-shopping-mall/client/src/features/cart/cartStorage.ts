import type { CartItem } from '../../types/cart';

const legacyCartStorageKey = 'shopping_mall_cart';
const guestCartStorageKey = 'shopping_mall_cart_guest';
const maximumQuantity = 99;

function getCartStorageKey(
    userId: number | null,
): string {
    if (userId === null) {
        return guestCartStorageKey;
    }

    return `shopping_mall_cart_user_${userId}`;
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isCartItem(value: unknown): value is CartItem {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.productId === 'number'
        && Number.isInteger(value.productId)
        && value.productId > 0
        && typeof value.title === 'string'
        && typeof value.price === 'number'
        && Number.isFinite(value.price)
        && value.price >= 0
        && typeof value.image === 'string'
        && typeof value.category === 'string'
        && typeof value.quantity === 'number'
        && Number.isInteger(value.quantity)
        && value.quantity >= 1
        && value.quantity <= maximumQuantity
    );
}

function readCartItems(
    storageKey: string,
): CartItem[] | null {
    const storedValue = localStorage.getItem(storageKey);

    if (storedValue === null) {
        return null;
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (!Array.isArray(parsedValue)) {
            localStorage.removeItem(storageKey);
            return [];
        }

        return parsedValue.filter(isCartItem);
    } catch {
        localStorage.removeItem(storageKey);
        return [];
    }
}

export function loadCartItems(
    userId: number | null,
): CartItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const storageKey = getCartStorageKey(userId);
    const storedItems = readCartItems(storageKey);

    if (storedItems !== null) {
        return storedItems;
    }

    const legacyItems = readCartItems(legacyCartStorageKey);

    if (legacyItems !== null) {
        saveCartItems(userId, legacyItems);
        localStorage.removeItem(legacyCartStorageKey);

        return legacyItems;
    }

    return [];
}

export function saveCartItems(
    userId: number | null,
    items: CartItem[],
): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            getCartStorageKey(userId),
            JSON.stringify(items),
        );
    } catch (error) {
        console.error(
            '장바구니 저장에 실패했습니다.',
            error,
        );
    }
}

export function removeCartItems(
    userId: number | null,
): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem(getCartStorageKey(userId));
}

export function mergeCartItems(
    savedItems: CartItem[],
    incomingItems: CartItem[],
): CartItem[] {
    const mergedItems = savedItems.map((item) => ({
        ...item,
    }));

    for (const incomingItem of incomingItems) {
        const existingItem = mergedItems.find(
            (item) =>
                item.productId === incomingItem.productId,
        );

        if (existingItem) {
            existingItem.quantity = Math.min(
                existingItem.quantity
                    + incomingItem.quantity,
                maximumQuantity,
            );
            continue;
        }

        mergedItems.push({
            ...incomingItem,
        });
    }

    return mergedItems;
}
