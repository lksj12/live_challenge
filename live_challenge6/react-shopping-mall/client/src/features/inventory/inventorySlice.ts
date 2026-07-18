import {
    createAsyncThunk,
    createSlice,
} from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import {
    fetchProductInventory,
} from '../../services/inventoryApi';
import type {
    InventoryItem,
} from '../../types/inventory';

export type InventoryStatus =
    | 'idle'
    | 'loading'
    | 'succeeded'
    | 'failed';

interface InventoryState {
    stockByProductId: Record<number, number>;
    status: InventoryStatus;
    error: string | null;
}

const initialState: InventoryState = {
    stockByProductId: {},
    status: 'idle',
    error: null,
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return '상품 재고를 불러오지 못했습니다.';
}

export const loadProductInventory = createAsyncThunk<
    InventoryItem[],
    void,
    {
        rejectValue: string;
    }
>(
    'inventory/loadProductInventory',
    async (_, { rejectWithValue }) => {
        try {
            const response =
                await fetchProductInventory();

            return response.inventory;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                loadProductInventory.pending,
                (state) => {
                    state.status = 'loading';
                    state.error = null;
                },
            )
            .addCase(
                loadProductInventory.fulfilled,
                (state, action) => {
                    state.stockByProductId =
                        action.payload.reduce<
                            Record<number, number>
                        >(
                            (stockMap, item) => {
                                stockMap[item.productId] =
                                    item.stock;

                                return stockMap;
                            },
                            {},
                        );

                    state.status = 'succeeded';
                    state.error = null;
                },
            )
            .addCase(
                loadProductInventory.rejected,
                (state, action) => {
                    state.status = 'failed';
                    state.error =
                        action.payload
                        ?? '상품 재고를 불러오지 못했습니다.';
                },
            );
    },
});

export const selectProductStockMap = (
    state: RootState,
) => state.inventory.stockByProductId;

export const selectInventoryStatus = (
    state: RootState,
) => state.inventory.status;

export const selectInventoryError = (
    state: RootState,
) => state.inventory.error;

export default inventorySlice.reducer;
