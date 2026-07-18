import {
    createAsyncThunk,
    createSlice,
} from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import { loadProducts } from '../../services/productApi';
import type {
    Product,
    ProductDataSource,
    ProductLoadResult,
} from '../../types/product';

export type ProductStatus =
    | 'idle'
    | 'loading'
    | 'succeeded'
    | 'failed';

interface ProductState {
    items: Product[];
    status: ProductStatus;
    source: ProductDataSource | null;
    warning: string | null;
    error: string | null;
}

const initialState: ProductState = {
    items: [],
    status: 'idle',
    source: null,
    warning: null,
    error: null,
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return '상품을 불러오는 중 알 수 없는 오류가 발생했습니다.';
}

export const loadProductCatalog = createAsyncThunk<
    ProductLoadResult,
    void,
    {
        rejectValue: string;
    }
>(
    'products/loadProductCatalog',
    async (_, { rejectWithValue }) => {
        try {
            return await loadProducts();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadProductCatalog.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(
                loadProductCatalog.fulfilled,
                (state, action) => {
                    state.items = action.payload.products;
                    state.source = action.payload.source;
                    state.warning = action.payload.warning;
                    state.status = 'succeeded';
                    state.error = null;
                },
            )
            .addCase(
                loadProductCatalog.rejected,
                (state, action) => {
                    state.status = 'failed';
                    state.error =
                        action.payload
                        ?? '상품 목록을 불러오지 못했습니다.';
                },
            );
    },
});

export const selectProducts = (state: RootState) =>
    state.products.items;

export const selectProductStatus = (state: RootState) =>
    state.products.status;

export const selectProductSource = (state: RootState) =>
    state.products.source;

export const selectProductWarning = (state: RootState) =>
    state.products.warning;

export const selectProductError = (state: RootState) =>
    state.products.error;

export default productSlice.reducer;
