export interface InventoryItem {
    productId: number;
    stock: number;
    updatedAt: string;
}

export interface UpdateProductStockRequestBody {
    stock: number;
}
