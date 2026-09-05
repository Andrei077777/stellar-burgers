import { v4 as uuidv4 } from 'uuid';
import {
  addIngredient,
  burgerConstructorInitialState,
  burgerConstructorReducer,
  clearConstructor,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient,
  selectConstructorItems,
  TBurgerConstructorState
} from '../burger-constructor-slice';
import {
  mockAnotherBun,
  mockBun,
  mockMain,
  mockSauce,
  toConstructorIngredient
} from './fixtures';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-uuid')
}));

const mockedUuidv4 = jest.mocked(uuidv4);

const bunInConstructor = toConstructorIngredient(mockBun, 'bun-id');
const firstMain = toConstructorIngredient(mockMain, 'main-id-1');
const secondMain = toConstructorIngredient(mockMain, 'main-id-2');
const sauce = toConstructorIngredient(mockSauce, 'sauce-id');

const createFilledState = (): TBurgerConstructorState => ({
  bun: bunInConstructor,
  ingredients: [firstMain, sauce, secondMain]
});

describe('Редьюсер слайса burgerConstructor', () => {
  test('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    const state = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(burgerConstructorInitialState);
  });

  test('не изменяет текущее состояние при неизвестном экшене', () => {
    const currentState = createFilledState();

    const state = burgerConstructorReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toBe(currentState);
  });

  describe('экшен addIngredient', () => {
    test('генерирует уникальный id для добавляемого ингредиента', () => {
      mockedUuidv4.mockReturnValueOnce('unique-id');

      const action = addIngredient(mockMain);

      expect(mockedUuidv4).toHaveBeenCalledTimes(1);
      expect(action.payload).toEqual({ ...mockMain, id: 'unique-id' });
    });

    test('добавляет булку в поле bun, не затрагивая начинки', () => {
      const state = burgerConstructorReducer(
        burgerConstructorInitialState,
        addIngredient(mockBun)
      );

      expect(state).toEqual({
        bun: { ...mockBun, id: 'generated-uuid' },
        ingredients: []
      });
    });

    test('заменяет ранее выбранную булку новой', () => {
      const previousState: TBurgerConstructorState = {
        bun: bunInConstructor,
        ingredients: [firstMain]
      };

      const state = burgerConstructorReducer(
        previousState,
        addIngredient(mockAnotherBun)
      );

      expect(state.bun).toEqual({ ...mockAnotherBun, id: 'generated-uuid' });
      expect(state.ingredients).toEqual([firstMain]);
    });

    test('добавляет начинку в конец списка ingredients, не затрагивая булку', () => {
      const previousState: TBurgerConstructorState = {
        bun: bunInConstructor,
        ingredients: [sauce]
      };

      const state = burgerConstructorReducer(
        previousState,
        addIngredient(mockMain)
      );

      expect(state.bun).toEqual(bunInConstructor);
      expect(state.ingredients).toEqual([
        sauce,
        { ...mockMain, id: 'generated-uuid' }
      ]);
    });

    test('добавляет соус в конец списка ingredients', () => {
      const previousState: TBurgerConstructorState = {
        bun: null,
        ingredients: [firstMain]
      };

      const state = burgerConstructorReducer(
        previousState,
        addIngredient(mockSauce)
      );

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([
        firstMain,
        { ...mockSauce, id: 'generated-uuid' }
      ]);
    });

    test('не мутирует исходное состояние', () => {
      const previousState = createFilledState();
      const previousStateSnapshot = createFilledState();

      burgerConstructorReducer(previousState, addIngredient(mockSauce));

      expect(previousState).toEqual(previousStateSnapshot);
    });
  });

  describe('экшен removeIngredient', () => {
    test('удаляет из списка только ингредиент с указанным id', () => {
      const state = burgerConstructorReducer(
        createFilledState(),
        removeIngredient(firstMain.id)
      );

      expect(state.bun).toEqual(bunInConstructor);
      expect(state.ingredients).toEqual([sauce, secondMain]);
    });

    test('не изменяет список, если ингредиента с таким id нет', () => {
      const previousState = createFilledState();

      const state = burgerConstructorReducer(
        previousState,
        removeIngredient('unknown-id')
      );

      expect(state).toEqual(previousState);
    });
  });

  describe('экшен moveIngredientUp', () => {
    test('меняет местами ингредиент с предыдущим', () => {
      const state = burgerConstructorReducer(
        createFilledState(),
        moveIngredientUp(1)
      );

      expect(state.ingredients).toEqual([sauce, firstMain, secondMain]);
    });

    test('не изменяет порядок, если ингредиент уже первый', () => {
      const previousState = createFilledState();

      const state = burgerConstructorReducer(
        previousState,
        moveIngredientUp(0)
      );

      expect(state.ingredients).toEqual(previousState.ingredients);
    });

    test('не изменяет порядок при индексе за пределами списка', () => {
      const previousState = createFilledState();

      const state = burgerConstructorReducer(
        previousState,
        moveIngredientUp(previousState.ingredients.length)
      );

      expect(state.ingredients).toEqual(previousState.ingredients);
    });
  });

  describe('экшен moveIngredientDown', () => {
    test('меняет местами ингредиент со следующим', () => {
      const state = burgerConstructorReducer(
        createFilledState(),
        moveIngredientDown(1)
      );

      expect(state.ingredients).toEqual([firstMain, secondMain, sauce]);
    });

    test('не изменяет порядок, если ингредиент уже последний', () => {
      const previousState = createFilledState();

      const state = burgerConstructorReducer(
        previousState,
        moveIngredientDown(previousState.ingredients.length - 1)
      );

      expect(state.ingredients).toEqual(previousState.ingredients);
    });

    test('не изменяет порядок при отрицательном индексе', () => {
      const previousState = createFilledState();

      const state = burgerConstructorReducer(
        previousState,
        moveIngredientDown(-1)
      );

      expect(state.ingredients).toEqual(previousState.ingredients);
    });
  });

  describe('экшен clearConstructor', () => {
    test('очищает булку и список начинок', () => {
      const state = burgerConstructorReducer(
        createFilledState(),
        clearConstructor()
      );

      expect(state).toEqual(burgerConstructorInitialState);
    });
  });
});

describe('Селекторы слайса burgerConstructor', () => {
  test('selectConstructorItems возвращает состояние конструктора', () => {
    const constructorState = createFilledState();

    expect(
      selectConstructorItems({ burgerConstructor: constructorState })
    ).toBe(constructorState);
  });
});
