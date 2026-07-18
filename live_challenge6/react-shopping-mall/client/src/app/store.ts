import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import productReducer from '../features/products/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        inventory: inventoryReducer,
        products: productReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
