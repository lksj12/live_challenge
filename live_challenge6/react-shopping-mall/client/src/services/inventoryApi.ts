import {
    requestJson,
} from './authApi';
import type {
    InventoryListResponse,
    UpdateInventoryResponse,
} from '../types/inventory';

export function fetchProductInventory(): Promise<
    InventoryListResponse
> {
    return requestJson<InventoryListResponse>(
        '/api/inventory',
        {
            method: 'GET',
        },
    );
}

export function updateProductInventory(
    token: string,
    productId: number,
    stock: number,
): Promise<UpdateInventoryResponse> {
    return requestJson<UpdateInventoryResponse>(
        `/api/admin/products/${productId}/stock`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                stock,
            }),
        },
    );
}
