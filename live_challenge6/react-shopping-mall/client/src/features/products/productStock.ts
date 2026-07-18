export const lowStockThreshold = 10;

export function isProductSoldOut(
    stock: number,
): boolean {
    return stock === 0;
}

export function isProductLowStock(
    stock: number,
): boolean {
    return (
        stock > 0
        && stock <= lowStockThreshold
    );
}
