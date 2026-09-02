import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  TConstructorIngredient,
  TConstructorItems,
  TIngredient
} from '@utils-types';
import { INGREDIENT_TYPE_BUN } from '../../utils/constants';

export type TBurgerConstructorState = TConstructorItems;

export const burgerConstructorInitialState: TBurgerConstructorState = {
  bun: null,
  ingredients: []
};

const swapIngredients = (
  ingredients: TConstructorIngredient[],
  fromIndex: number,
  toIndex: number
) => {
  const isFromInRange = fromIndex >= 0 && fromIndex < ingredients.length;
  const isToInRange = toIndex >= 0 && toIndex < ingredients.length;
  if (!isFromInRange || !isToInRange) return;
  [ingredients[fromIndex], ingredients[toIndex]] = [
    ingredients[toIndex],
    ingredients[fromIndex]
  ];
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState: burgerConstructorInitialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === INGREDIENT_TYPE_BUN) {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: uuidv4() }
      })
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },
    moveIngredientUp: (state, action: PayloadAction<number>) => {
      swapIngredients(state.ingredients, action.payload, action.payload - 1);
    },
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      swapIngredients(state.ingredients, action.payload, action.payload + 1);
    },
    clearConstructor: () => burgerConstructorInitialState
  },
  selectors: {
    selectConstructorItems: (state) => state
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  clearConstructor
} = burgerConstructorSlice.actions;

export const { selectConstructorItems } = burgerConstructorSlice.selectors;

export const burgerConstructorReducer = burgerConstructorSlice.reducer;
