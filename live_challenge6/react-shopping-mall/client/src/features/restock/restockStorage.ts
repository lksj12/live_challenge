function getRestockStorageKey(
    userId: number,
): string {
    return `shopping_mall_restock_user_${userId}`;
}

function isValidProductId(
    value: unknown,
): value is number {
    return (
        typeof value === 'number'
        && Number.isInteger(value)
        && value > 0
    );
}

export function loadRestockSubscriptions(
    userId: number,
): number[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const storageKey = getRestockStorageKey(userId);
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
        return [];
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (!Array.isArray(parsedValue)) {
            localStorage.removeItem(storageKey);
            return [];
        }

        return Array.from(
            new Set(parsedValue.filter(isValidProductId)),
        );
    } catch {
        localStorage.removeItem(storageKey);
        return [];
    }
}

export function saveRestockSubscriptions(
    userId: number,
    productIds: number[],
): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(
        getRestockStorageKey(userId),
        JSON.stringify(Array.from(new Set(productIds))),
    );
}

export function hasRestockSubscription(
    userId: number,
    productId: number,
): boolean {
    return loadRestockSubscriptions(userId).includes(
        productId,
    );
}

export function addRestockSubscription(
    userId: number,
    productId: number,
): void {
    const subscriptions =
        loadRestockSubscriptions(userId);

    if (subscriptions.includes(productId)) {
        return;
    }

    saveRestockSubscriptions(
        userId,
        [...subscriptions, productId],
    );
}

export function removeRestockSubscription(
    userId: number,
    productId: number,
): void {
    const subscriptions =
        loadRestockSubscriptions(userId);

    saveRestockSubscriptions(
        userId,
        subscriptions.filter(
            (savedProductId) =>
                savedProductId !== productId,
        ),
    );
}
