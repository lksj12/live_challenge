import { requestJson } from './authApi';
import type {
    CreateOrderItem,
    CreateOrderResponse,
    MyOrdersResponse,
} from '../types/order';

function createAuthorizationHeader(
    token: string,
): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
    };
}

export function createOrder(
    token: string,
    items: CreateOrderItem[],
): Promise<CreateOrderResponse> {
    return requestJson<CreateOrderResponse>(
        '/api/orders',
        {
            method: 'POST',
            headers:
                createAuthorizationHeader(token),
            body: JSON.stringify({
                items,
            }),
        },
    );
}

export function fetchMyOrders(
    token: string,
): Promise<MyOrdersResponse> {
    return requestJson<MyOrdersResponse>(
        '/api/orders',
        {
            method: 'GET',
            headers:
                createAuthorizationHeader(token),
        },
    );
}
