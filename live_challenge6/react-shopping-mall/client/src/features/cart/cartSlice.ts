import {
    createSelector,
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import type { CartItem } from '../../types/cart';
import type { Product } from '../../types/product';

const maximumQuantity = 99;

interface CartNotification {
    id: number;
    productTitle: string;
    quantity: number;
}

interface ReplaceCartItemsPayload {
    ownerId: number | null;
    items: CartItem[];
}

interface CartState {
    ownerId: number | null;
    items: CartItem[];
    initialized: boolean;
    notification: CartNotification | null;
    notificationSequence: number;
}

const initialState: CartState = {
    ownerId: null,
    items: [],
    initialized: false,
    notification: null,
    notificationSequence: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        replaceCartItems(
            state,
            action: PayloadAction<ReplaceCartItemsPayload>,
        ) {
            state.ownerId = action.payload.ownerId;
            state.items = action.payload.items;
            state.initialized = true;
            state.notification = null;
        },
        addToCart(
            state,
            action: PayloadAction<Product>,
        ) {
            const product = action.payload;

            const existingItem = state.items.find(
                (item) => item.productId === product.id,
            );

            let currentQuantity = 1;

            if (existingItem) {
                existingItem.quantity = Math.min(
                    existingItem.quantity + 1,
                    maximumQuantity,
                );

                currentQuantity = existingItem.quantity;
            } else {
                state.items.push({
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: 1,
                });
            }

            state.notificationSequence += 1;

            state.notification = {
                id: state.notificationSequence,
                productTitle: product.title,
                quantity: currentQuantity,
            };
        },
        increaseCartItemQuantity(
            state,
            action: PayloadAction<number>,
        ) {
            const item = state.items.find(
                (cartItem) =>
                    cartItem.productId === action.payload,
            );

            if (!item) {
                return;
            }

            item.quantity = Math.min(
                item.quantity + 1,
                maximumQuantity,
            );
        },
        decreaseCartItemQuantity(
            state,
            action: PayloadAction<number>,
        ) {
            const item = state.items.find(
                (cartItem) =>
                    cartItem.productId === action.payload,
            );

            if (!item || item.quantity <= 1) {
                return;
            }

            item.quantity -= 1;
        },
        removeCartItem(
            state,
            action: PayloadAction<number>,
        ) {
            state.items = state.items.filter(
                (item) =>
                    item.productId !== action.payload,
            );
        },
        clearCart(state) {
            state.items = [];
            state.notification = null;
        },
        dismissCartNotification(state) {
            state.notification = null;
        },
    },
});

export const {
    addToCart,
    clearCart,
    decreaseCartItemQuantity,
    dismissCartNotification,
    increaseCartItemQuantity,
    removeCartItem,
    replaceCartItems,
} = cartSlice.actions;

export const selectCartOwnerId = (state: RootState) =>
    state.cart.ownerId;

export const selectCartItems = (state: RootState) =>
    state.cart.items;

export const selectCartInitialized = (state: RootState) =>
    state.cart.initialized;

export const selectCartNotification = (state: RootState) =>
    state.cart.notification;

export const selectCartItemCount = createSelector(
    [selectCartItems],
    (items) =>
        items.reduce(
            (total, item) => total + item.quantity,
            0,
        ),
);

export const selectCartSubtotal = createSelector(
    [selectCartItems],
    (items) =>
        items.reduce(
            (total, item) =>
                total + item.price * item.quantity,
            0,
        ),
);

export const selectIsCartEmpty = createSelector(
    [selectCartItems],
    (items) => items.length === 0,
);

export default cartSlice.reducer;
