import { expect, Page, test as base } from '@playwright/test';
import { join } from 'path';

const HARS_DIR = join(__dirname, 'hars');
const INGREDIENTS_HAR = join(HARS_DIR, 'ingredients.har');
const USER_HAR = join(HARS_DIR, 'user.har');
const ORDER_HAR = join(HARS_DIR, 'order.har');

const API_URL_PATTERNS = {
  any: '**/api/**',
  ingredients: '**/api/ingredients',
  user: '**/api/auth/user',
  orders: '**/api/orders'
};

const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const ACCESS_TOKEN = 'Bearer test-access-token';
const REFRESH_TOKEN = 'test-refresh-token';

const USER_NAME = 'Test User';
const ORDER_NUMBER = '12345';

type TIngredientData = {
  id: string;
  name: string;
  price: number;
  calories: number;
  proteins: number;
  fat: number;
  carbohydrates: number;
};

const BUN: TIngredientData = {
  id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  price: 1255,
  calories: 420,
  proteins: 80,
  fat: 24,
  carbohydrates: 53
};
const ANOTHER_BUN: TIngredientData = {
  id: '643d69a5c3f7b9001cfa093d',
  name: 'Флюоресцентная булка R2-D3',
  price: 988,
  calories: 643,
  proteins: 44,
  fat: 26,
  carbohydrates: 85
};
const MAIN: TIngredientData = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  price: 424,
  calories: 4242,
  proteins: 420,
  fat: 142,
  carbohydrates: 242
};
const SAUCE: TIngredientData = {
  id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  price: 90,
  calories: 30,
  proteins: 30,
  fat: 20,
  carbohydrates: 40
};
const BUN_COUNT_IN_BURGER = 2;

const PAGE_TITLE = 'Соберите бургер';
const BUNS_CATEGORY_TITLE = 'Булки';
const ADD_BUTTON_TEXT = 'Добавить';
const ORDER_BUTTON_TEXT = 'Оформить заказ';
const NO_BUN_TEXT = 'Выберите булки';
const NO_FILLING_TEXT = 'Выберите начинку';
const TOP_BUN_SUFFIX = '(верх)';
const BOTTOM_BUN_SUFFIX = '(низ)';
const INGREDIENT_DETAILS_TITLE = 'Детали ингредиента';
const ORDER_ID_TEXT = 'идентификатор заказа';
const NUTRITION_LABELS = {
  calories: 'Калории, ккал',
  proteins: 'Белки, г',
  fat: 'Жиры, г',
  carbohydrates: 'Углеводы, г'
} as const;

const routeApiFromHar = (page: Page, harFile: string, url: string) =>
  page.routeFromHAR(harFile, { url, update: false, notFound: 'abort' });

const createConstructorPage = (page: Page) => {
  const ingredientsSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: BUNS_CATEGORY_TITLE, exact: true })
  });
  const constructorSection = page.locator('section').filter({
    has: page.getByRole('button', { name: ORDER_BUTTON_TEXT })
  });
  const orderButton = constructorSection.getByRole('button', {
    name: ORDER_BUTTON_TEXT
  });

  // ModalUI рендерит в портал #modals два элемента: окно и оверлей.
  const modal = page.locator('#modals > div').first();
  const modalOverlay = page.locator('#modals > div').last();
  const modalCloseButton = modal.getByRole('button');

  const getModalNutritionValue = (label: string, value: number) =>
    modal
      .getByRole('listitem')
      .filter({ hasText: label })
      .getByText(String(value), { exact: true });

  const getIngredientCard = (name: string) =>
    ingredientsSection.getByRole('listitem').filter({ hasText: name });

  const getIngredientCounter = (name: string) =>
    getIngredientCard(name).locator('.counter__num');

  const getConstructorElement = (text: string) =>
    constructorSection.locator('.constructor-element').filter({
      hasText: text
    });

  const addIngredient = (name: string) =>
    getIngredientCard(name)
      .getByRole('button', { name: ADD_BUTTON_TEXT })
      .click();

  const openIngredientDetails = (name: string) =>
    getIngredientCard(name).getByRole('link').click();

  const goto = async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: PAGE_TITLE })).toBeVisible();
    await expect(getIngredientCard(BUN.name)).toBeVisible();
  };

  return {
    ingredientsSection,
    constructorSection,
    orderButton,
    modal,
    modalOverlay,
    modalCloseButton,
    getModalNutritionValue,
    getIngredientCard,
    getIngredientCounter,
    getConstructorElement,
    addIngredient,
    openIngredientDetails,
    goto
  };
};

type TConstructorPage = ReturnType<typeof createConstructorPage>;

const test = base.extend<{ constructorPage: TConstructorPage }>({
  constructorPage: async ({ page }, use) => {
    // Любой запрос к бэкенду, для которого нет HAR-мока, прерывается,
    // чтобы тесты никогда не ходили на реальный сервер.
    await page.route(API_URL_PATTERNS.any, (route) => route.abort());
    await routeApiFromHar(page, INGREDIENTS_HAR, API_URL_PATTERNS.ingredients);
    await use(createConstructorPage(page));
  }
});

const expectConstructorToBeEmpty = async ({
  constructorSection,
  getConstructorElement
}: TConstructorPage) => {
  await expect(constructorSection.getByText(NO_BUN_TEXT)).toHaveCount(2);
  await expect(constructorSection.getByText(NO_FILLING_TEXT)).toBeVisible();
  await expect(getConstructorElement(BUN.name)).toHaveCount(0);
  await expect(getConstructorElement(MAIN.name)).toHaveCount(0);
  await expect(getConstructorElement(SAUCE.name)).toHaveCount(0);
  await expect(
    constructorSection.getByText('0', { exact: true })
  ).toBeVisible();
};

const expectModalToBeClosed = async ({
  modal,
  modalOverlay
}: TConstructorPage) => {
  await expect(modal).toBeHidden();
  await expect(modalOverlay).toBeHidden();
};

const expectIngredientDetails = async (
  { modal, getModalNutritionValue }: TConstructorPage,
  ingredient: TIngredientData
) => {
  await expect(
    modal.getByRole('heading', { name: INGREDIENT_DETAILS_TITLE })
  ).toBeVisible();
  await expect(
    modal.getByRole('heading', { name: ingredient.name })
  ).toBeVisible();
  await expect(
    getModalNutritionValue(NUTRITION_LABELS.calories, ingredient.calories)
  ).toBeVisible();
  await expect(
    getModalNutritionValue(NUTRITION_LABELS.proteins, ingredient.proteins)
  ).toBeVisible();
  await expect(
    getModalNutritionValue(NUTRITION_LABELS.fat, ingredient.fat)
  ).toBeVisible();
  await expect(
    getModalNutritionValue(
      NUTRITION_LABELS.carbohydrates,
      ingredient.carbohydrates
    )
  ).toBeVisible();
};

test.describe('Страница конструктора бургера', () => {
  test.describe('Добавление ингредиентов в конструктор', () => {
    test.beforeEach(async ({ constructorPage }) => {
      await constructorPage.goto();
    });

    test('изначально конструктор пуст', async ({ constructorPage }) => {
      await expectConstructorToBeEmpty(constructorPage);
    });

    test('добавляет булку сверху и снизу конструктора', async ({
      constructorPage
    }) => {
      const { constructorSection, addIngredient, getConstructorElement } =
        constructorPage;

      await addIngredient(BUN.name);

      await expect(
        getConstructorElement(`${BUN.name} ${TOP_BUN_SUFFIX}`)
      ).toBeVisible();
      await expect(
        getConstructorElement(`${BUN.name} ${BOTTOM_BUN_SUFFIX}`)
      ).toBeVisible();
      await expect(constructorSection.getByText(NO_BUN_TEXT)).toHaveCount(0);
      await expect(constructorSection.getByText(NO_FILLING_TEXT)).toBeVisible();
    });

    test('заменяет выбранную булку при добавлении другой булки', async ({
      constructorPage
    }) => {
      const { addIngredient, getConstructorElement } = constructorPage;

      await addIngredient(BUN.name);
      await addIngredient(ANOTHER_BUN.name);

      await expect(
        getConstructorElement(`${ANOTHER_BUN.name} ${TOP_BUN_SUFFIX}`)
      ).toBeVisible();
      await expect(
        getConstructorElement(`${ANOTHER_BUN.name} ${BOTTOM_BUN_SUFFIX}`)
      ).toBeVisible();
      await expect(getConstructorElement(BUN.name)).toHaveCount(0);
    });

    test('добавляет начинку и соус в список ингредиентов конструктора', async ({
      constructorPage
    }) => {
      const { constructorSection, addIngredient, getConstructorElement } =
        constructorPage;

      await addIngredient(MAIN.name);
      await addIngredient(SAUCE.name);

      await expect(getConstructorElement(MAIN.name)).toBeVisible();
      await expect(getConstructorElement(SAUCE.name)).toBeVisible();
      await expect(constructorSection.getByText(NO_FILLING_TEXT)).toHaveCount(
        0
      );
      await expect(constructorSection.getByText(NO_BUN_TEXT)).toHaveCount(2);
    });

    test('показывает счётчик добавленных ингредиентов на карточках', async ({
      constructorPage
    }) => {
      const { addIngredient, getIngredientCounter } = constructorPage;

      await expect(getIngredientCounter(BUN.name)).toHaveCount(0);

      await addIngredient(BUN.name);
      await addIngredient(MAIN.name);
      await addIngredient(MAIN.name);

      await expect(getIngredientCounter(BUN.name)).toHaveText(
        String(BUN_COUNT_IN_BURGER)
      );
      await expect(getIngredientCounter(MAIN.name)).toHaveText('2');
      await expect(getIngredientCounter(SAUCE.name)).toHaveCount(0);
    });

    test('пересчитывает итоговую стоимость бургера', async ({
      constructorPage
    }) => {
      const { constructorSection, addIngredient } = constructorPage;
      const totalPrice =
        BUN.price * BUN_COUNT_IN_BURGER + MAIN.price + SAUCE.price;

      await addIngredient(BUN.name);
      await addIngredient(MAIN.name);
      await addIngredient(SAUCE.name);

      await expect(
        constructorSection.getByText(String(totalPrice), { exact: true })
      ).toBeVisible();
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test.beforeEach(async ({ constructorPage }) => {
      await constructorPage.goto();
    });

    test('открывается по клику на ингредиент и показывает данные именно этого ингредиента', async ({
      page,
      constructorPage
    }) => {
      const { modal, modalOverlay, openIngredientDetails } = constructorPage;

      await openIngredientDetails(MAIN.name);

      await expect(page).toHaveURL(`/ingredients/${MAIN.id}`);
      await expect(modal).toBeVisible();
      await expect(modalOverlay).toBeVisible();
      await expectIngredientDetails(constructorPage, MAIN);
      await expect(modal.getByText(BUN.name)).toHaveCount(0);
      await expect(modal.getByText(SAUCE.name)).toHaveCount(0);
    });

    test('показывает данные другого ингредиента при клике по другой карточке', async ({
      page,
      constructorPage
    }) => {
      const { modal, modalCloseButton, openIngredientDetails } =
        constructorPage;

      await openIngredientDetails(SAUCE.name);

      await expect(page).toHaveURL(`/ingredients/${SAUCE.id}`);
      await expectIngredientDetails(constructorPage, SAUCE);
      await expect(modal.getByText(MAIN.name)).toHaveCount(0);

      await modalCloseButton.click();
      await openIngredientDetails(BUN.name);

      await expect(page).toHaveURL(`/ingredients/${BUN.id}`);
      await expectIngredientDetails(constructorPage, BUN);
      await expect(modal.getByText(SAUCE.name)).toHaveCount(0);
    });

    test('закрывается по клику на крестик', async ({
      page,
      constructorPage
    }) => {
      const { modal, modalCloseButton, openIngredientDetails } =
        constructorPage;

      await openIngredientDetails(MAIN.name);
      await expect(modal).toBeVisible();

      await modalCloseButton.click();

      await expectModalToBeClosed(constructorPage);
      await expect(page).toHaveURL('/');
    });

    test('закрывается по клику на оверлей', async ({
      page,
      constructorPage
    }) => {
      const { modal, modalOverlay, openIngredientDetails } = constructorPage;

      await openIngredientDetails(MAIN.name);
      await expect(modal).toBeVisible();

      await modalOverlay.click({ position: { x: 10, y: 10 } });

      await expectModalToBeClosed(constructorPage);
      await expect(page).toHaveURL('/');
    });

    test('закрывается по нажатию клавиши Escape', async ({
      page,
      constructorPage
    }) => {
      const { modal, openIngredientDetails } = constructorPage;

      await openIngredientDetails(MAIN.name);
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');

      await expectModalToBeClosed(constructorPage);
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Оформление заказа', () => {
    test('перенаправляет неавторизованного пользователя на страницу входа', async ({
      page,
      constructorPage
    }) => {
      const { addIngredient, orderButton } = constructorPage;
      await constructorPage.goto();

      await addIngredient(BUN.name);
      await addIngredient(MAIN.name);
      await orderButton.click();

      await expect(page).toHaveURL('/login');
      await expectModalToBeClosed(constructorPage);
    });

    test.describe('авторизованным пользователем', () => {
      test.beforeEach(async ({ page, context, baseURL, constructorPage }) => {
        await context.addCookies([
          {
            name: ACCESS_TOKEN_COOKIE_NAME,
            value: encodeURIComponent(ACCESS_TOKEN),
            url: baseURL
          }
        ]);
        await page.addInitScript(
          ([key, value]) => window.localStorage.setItem(key, value),
          [REFRESH_TOKEN_STORAGE_KEY, REFRESH_TOKEN]
        );
        await routeApiFromHar(page, USER_HAR, API_URL_PATTERNS.user);
        await routeApiFromHar(page, ORDER_HAR, API_URL_PATTERNS.orders);

        await constructorPage.goto();
        await expect(page.getByText(USER_NAME)).toBeVisible();
      });

      test('собирает бургер, показывает номер заказа и очищает конструктор', async ({
        page,
        constructorPage
      }) => {
        const {
          constructorSection,
          orderButton,
          modal,
          modalCloseButton,
          addIngredient,
          getConstructorElement
        } = constructorPage;

        await addIngredient(BUN.name);
        await addIngredient(MAIN.name);
        await addIngredient(SAUCE.name);

        await expect(
          getConstructorElement(`${BUN.name} ${TOP_BUN_SUFFIX}`)
        ).toBeVisible();
        await expect(getConstructorElement(MAIN.name)).toBeVisible();
        await expect(getConstructorElement(SAUCE.name)).toBeVisible();
        await expect(constructorSection.getByText(NO_BUN_TEXT)).toHaveCount(0);

        const orderRequestPromise = page.waitForRequest(
          (request) =>
            request.url().endsWith('/api/orders') && request.method() === 'POST'
        );
        await orderButton.click();
        const orderRequest = await orderRequestPromise;

        expect(orderRequest.headers().authorization).toBe(ACCESS_TOKEN);
        expect(orderRequest.postDataJSON()).toEqual({
          ingredients: [BUN.id, MAIN.id, SAUCE.id, BUN.id]
        });

        await expect(modal).toBeVisible();
        await expect(
          modal.getByRole('heading', { name: ORDER_NUMBER, exact: true })
        ).toBeVisible();
        await expect(modal.getByText(ORDER_ID_TEXT)).toBeVisible();

        await expectConstructorToBeEmpty(constructorPage);

        await modalCloseButton.click();

        await expectModalToBeClosed(constructorPage);
        await expect(page).toHaveURL('/');
        await expectConstructorToBeEmpty(constructorPage);
      });

      test('не отправляет заказ без выбранной булки', async ({
        page,
        constructorPage
      }) => {
        const { orderButton, addIngredient, getConstructorElement } =
          constructorPage;
        let isOrderRequested = false;
        page.on('request', (request) => {
          if (request.url().endsWith('/api/orders')) isOrderRequested = true;
        });

        await addIngredient(MAIN.name);
        await orderButton.click();

        await expectModalToBeClosed(constructorPage);
        await expect(getConstructorElement(MAIN.name)).toBeVisible();
        expect(isOrderRequested).toBe(false);
      });
    });
  });
});
