export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  FEED_ORDER: '/feed/:number',
  INGREDIENTS: '/ingredients',
  INGREDIENT: '/ingredients/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  PROFILE_ORDERS: '/profile/orders',
  PROFILE_ORDER: '/profile/orders/:number',
  NOT_FOUND: '*'
} as const;

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
export const RESET_PASSWORD_STORAGE_KEY = 'resetPassword';

export const INGREDIENT_TYPE_BUN = 'bun';
export const INGREDIENT_TYPE_MAIN = 'main';
export const INGREDIENT_TYPE_SAUCE = 'sauce';

export const ORDER_STATUS = {
  CREATED: 'created',
  PENDING: 'pending',
  DONE: 'done',
  CANCELLED: 'cancelled'
} as const;

export const BUN_COUNT_IN_BURGER = 2;
export const ORDER_NUMBER_LENGTH = 6;

export const INGREDIENT_DETAILS_TITLE = 'Детали ингредиента';

export const formatOrderNumber = (orderNumber: number): string =>
  `#${String(orderNumber).padStart(ORDER_NUMBER_LENGTH, '0')}`;
