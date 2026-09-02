import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';
import {
  INGREDIENT_TYPE_BUN,
  INGREDIENT_TYPE_MAIN,
  INGREDIENT_TYPE_SAUCE
} from '../../utils/constants';

const INGREDIENTS_LOAD_ERROR = 'Не удалось загрузить ингредиенты';

export type TIngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

export const ingredientsInitialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null
};

export const fetchIngredients = createAsyncThunk<TIngredient[]>(
  'ingredients/fetchIngredients',
  async () => getIngredientsApi()
);

const selectItems = (state: TIngredientsState) => state.items;

const createSelectByType = (type: string) =>
  createSelector([selectItems], (items) =>
    items.filter((ingredient) => ingredient.type === type)
  );

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: ingredientsInitialState,
  reducers: {},
  selectors: {
    selectIngredients: selectItems,
    selectIngredientsLoading: (state) => state.isLoading,
    selectIngredientsError: (state) => state.error,
    selectBuns: createSelectByType(INGREDIENT_TYPE_BUN),
    selectMains: createSelectByType(INGREDIENT_TYPE_MAIN),
    selectSauces: createSelectByType(INGREDIENT_TYPE_SAUCE),
    selectIngredientById: (state, id: string) =>
      state.items.find((ingredient) => ingredient._id === id)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? INGREDIENTS_LOAD_ERROR;
      });
  }
});

export const {
  selectIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
  selectBuns,
  selectMains,
  selectSauces,
  selectIngredientById
} = ingredientsSlice.selectors;

export const ingredientsReducer = ingredientsSlice.reducer;
