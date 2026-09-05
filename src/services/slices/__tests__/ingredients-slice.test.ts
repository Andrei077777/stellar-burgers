import {
  fetchIngredients,
  ingredientsInitialState,
  ingredientsReducer,
  selectBuns,
  selectIngredientById,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
  selectMains,
  selectSauces,
  TIngredientsState
} from '../ingredients-slice';
import {
  mockAnotherBun,
  mockBun,
  mockIngredients,
  mockMain,
  mockSauce
} from './fixtures';

const REQUEST_ID = 'test-request-id';
const INGREDIENTS_LOAD_ERROR = 'Не удалось загрузить ингредиенты';

describe('Редьюсер слайса ingredients', () => {
  test('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(ingredientsInitialState);
  });

  test('не изменяет текущее состояние при неизвестном экшене', () => {
    const currentState: TIngredientsState = {
      items: mockIngredients,
      isLoading: false,
      error: null
    };

    const state = ingredientsReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toBe(currentState);
  });

  describe('обработка асинхронного экшена fetchIngredients', () => {
    test('pending: включает флаг загрузки и сбрасывает предыдущую ошибку', () => {
      const previousState: TIngredientsState = {
        ...ingredientsInitialState,
        error: 'Старая ошибка'
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.pending(REQUEST_ID)
      );

      expect(state).toEqual({
        items: [],
        isLoading: true,
        error: null
      });
    });

    test('fulfilled: сохраняет полученные ингредиенты и выключает флаг загрузки', () => {
      const previousState: TIngredientsState = {
        ...ingredientsInitialState,
        isLoading: true
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.fulfilled(mockIngredients, REQUEST_ID)
      );

      expect(state).toEqual({
        items: mockIngredients,
        isLoading: false,
        error: null
      });
    });

    test('rejected: записывает сообщение ошибки и выключает флаг загрузки', () => {
      const previousState: TIngredientsState = {
        ...ingredientsInitialState,
        isLoading: true
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.rejected(new Error('Сервер недоступен'), REQUEST_ID)
      );

      expect(state).toEqual({
        items: [],
        isLoading: false,
        error: 'Сервер недоступен'
      });
    });

    test('rejected: подставляет текст ошибки по умолчанию, если у ошибки нет сообщения', () => {
      const state = ingredientsReducer(undefined, {
        type: fetchIngredients.rejected.type,
        error: {}
      });

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(INGREDIENTS_LOAD_ERROR);
    });

    test('rejected: не затирает ранее загруженные ингредиенты', () => {
      const previousState: TIngredientsState = {
        items: mockIngredients,
        isLoading: true,
        error: null
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.rejected(new Error('Сервер недоступен'), REQUEST_ID)
      );

      expect(state.items).toEqual(mockIngredients);
    });
  });
});

describe('Селекторы слайса ingredients', () => {
  const rootState = {
    ingredients: {
      items: mockIngredients,
      isLoading: true,
      error: 'Ошибка'
    }
  };

  test('selectIngredients возвращает весь список ингредиентов', () => {
    expect(selectIngredients(rootState)).toEqual(mockIngredients);
  });

  test('selectIngredientsLoading и selectIngredientsError возвращают флаг загрузки и ошибку', () => {
    expect(selectIngredientsLoading(rootState)).toBe(true);
    expect(selectIngredientsError(rootState)).toBe('Ошибка');
  });

  test('selectBuns, selectMains и selectSauces фильтруют ингредиенты по типу', () => {
    expect(selectBuns(rootState)).toEqual([mockBun, mockAnotherBun]);
    expect(selectMains(rootState)).toEqual([mockMain]);
    expect(selectSauces(rootState)).toEqual([mockSauce]);
  });

  test('selectIngredientById находит ингредиент по id', () => {
    expect(selectIngredientById(rootState, mockMain._id)).toEqual(mockMain);
    expect(selectIngredientById(rootState, 'unknown-id')).toBeUndefined();
  });
});
