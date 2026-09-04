import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TFeedInfo, TOrdersData } from '@utils-types';

const FEED_LOAD_ERROR = 'Не удалось загрузить ленту заказов';

export type TFeedState = TOrdersData & {
  isLoading: boolean;
  error: string | null;
};

export const feedInitialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

export const fetchFeeds = createAsyncThunk<TOrdersData>(
  'feed/fetchFeeds',
  async () => {
    const { orders, total, totalToday } = await getFeedsApi();
    return { orders, total, totalToday };
  }
);

const selectTotal = (state: TFeedState) => state.total;
const selectTotalToday = (state: TFeedState) => state.totalToday;

export const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {},
  selectors: {
    selectFeedOrders: (state) => state.orders,
    selectFeedLoading: (state) => state.isLoading,
    selectFeedError: (state) => state.error,
    selectFeedInfo: createSelector(
      [selectTotal, selectTotalToday],
      (total, totalToday): TFeedInfo => ({ total, totalToday })
    )
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? FEED_LOAD_ERROR;
      });
  }
});

export const {
  selectFeedOrders,
  selectFeedLoading,
  selectFeedError,
  selectFeedInfo
} = feedSlice.selectors;

export const feedReducer = feedSlice.reducer;
