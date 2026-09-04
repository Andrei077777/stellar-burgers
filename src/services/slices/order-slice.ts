import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';

const ORDER_CREATE_ERROR = 'Не удалось оформить заказ';
const ORDER_NOT_FOUND_ERROR = 'Заказ не найден';

export type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderError: string | null;
  currentOrder: TOrder | null;
  isCurrentOrderLoading: boolean;
  currentOrderError: string | null;
};

export const orderInitialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  orderError: null,
  currentOrder: null,
  isCurrentOrderLoading: false,
  currentOrderError: null
};

export const createOrder = createAsyncThunk<TOrder, string[]>(
  'order/createOrder',
  async (ingredientIds) => {
    const { order } = await orderBurgerApi(ingredientIds);
    return { ...order, ingredients: ingredientIds };
  }
);

export const fetchOrderByNumber = createAsyncThunk<TOrder, number>(
  'order/fetchOrderByNumber',
  async (orderNumber) => {
    const { orders } = await getOrderByNumberApi(orderNumber);
    const order = orders[0];
    if (!order) {
      throw new Error(ORDER_NOT_FOUND_ERROR);
    }
    return order;
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState: orderInitialState,
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
      state.orderError = null;
    }
  },
  selectors: {
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
    selectOrderError: (state) => state.orderError,
    selectCurrentOrderLoading: (state) => state.isCurrentOrderLoading,
    selectCurrentOrderError: (state) => state.currentOrderError
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.orderError = action.error.message ?? ORDER_CREATE_ERROR;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isCurrentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isCurrentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isCurrentOrderLoading = false;
        state.currentOrderError = action.error.message ?? ORDER_NOT_FOUND_ERROR;
      });
  }
});

export const { clearOrderModalData } = orderSlice.actions;

export const {
  selectOrderRequest,
  selectOrderModalData,
  selectOrderError,
  selectCurrentOrderLoading,
  selectCurrentOrderError
} = orderSlice.selectors;

export const orderReducer = orderSlice.reducer;
