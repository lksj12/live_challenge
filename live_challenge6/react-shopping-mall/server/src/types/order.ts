export type PaymentStatus =
    | 'paid'
    | 'cancelled';

export type ShippingStatus =
    | 'preparing'
    | 'shipping'
    | 'delivered';

export interface CreateOrderItemRequest {
    productId: number;
    title: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
}

export interface CreateOrderRequestBody {
    items: CreateOrderItemRequest[];
}
