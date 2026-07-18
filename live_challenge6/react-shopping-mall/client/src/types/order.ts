import type { CartItem } from './cart';

export type PaymentStatus =
    | 'paid'
    | 'cancelled';

export type ShippingStatus =
    | 'preparing'
    | 'shipping'
    | 'delivered';

export interface CreateOrderItem {
    productId: number;
    title: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
}

export interface OrderItem {
    id: number;
    productId: number;
    title: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    shippingStatus: ShippingStatus;
}

export interface Order {
    id: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    createdAt: string;
    items: OrderItem[];
}

export interface CreateOrderResponse {
    success: true;
    message: string;
    order: Order;
}

export interface MyOrdersResponse {
    success: true;
    orders: Order[];
}

export function convertCartItemsToOrderItems(
    cartItems: CartItem[],
): CreateOrderItem[] {
    return cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: item.quantity,
    }));
}
