import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import { logoutUser } from './user-slice';

const USER_ORDERS_LOAD_ERROR = 'Не удалось загрузить историю заказов';

export type TUserOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
};

export const userOrdersInitialState: TUserOrdersState = {
  orders: [],
  isLoading: false,
  error: null
};

export const fetchUserOrders = createAsyncThunk<TOrder[]>(
  'userOrders/fetchUserOrders',
  async () => getOrdersApi()
);

export const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState: userOrdersInitialState,
  reducers: {},
  selectors: {
    selectUserOrders: (state) => state.orders,
    selectUserOrdersLoading: (state) => state.isLoading,
    selectUserOrdersError: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? USER_ORDERS_LOAD_ERROR;
      })
      .addMatcher(
        isAnyOf(logoutUser.fulfilled, logoutUser.rejected),
        () => userOrdersInitialState
      );
  }
});

export const {
  selectUserOrders,
  selectUserOrdersLoading,
  selectUserOrdersError
} = userOrdersSlice.selectors;

export const userOrdersReducer = userOrdersSlice.reducer;
