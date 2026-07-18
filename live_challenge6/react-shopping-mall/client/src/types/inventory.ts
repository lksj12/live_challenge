export interface InventoryItem {
    productId: number;
    stock: number;
    updatedAt: string;
}

export interface InventoryListResponse {
    success: true;
    inventory: InventoryItem[];
}

export interface UpdateInventoryResponse {
    success: true;
    message: string;
    inventory: InventoryItem;
}
