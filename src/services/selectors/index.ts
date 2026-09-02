import { TOrder } from '@utils-types';
import type { RootState } from '../store';

export {
  selectIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
  selectBuns,
  selectMains,
  selectSauces,
  selectIngredientById
} from '../slices/ingredients-slice';

export { selectConstructorItems } from '../slices/burger-constructor-slice';

export {
  selectOrderRequest,
  selectOrderModalData,
  selectOrderError,
  selectCurrentOrderLoading,
  selectCurrentOrderError
} from '../slices/order-slice';

export {
  selectFeedOrders,
  selectFeedLoading,
  selectFeedError,
  selectFeedInfo
} from '../slices/feed-slice';

export {
  selectUserOrders,
  selectUserOrdersLoading,
  selectUserOrdersError
} from '../slices/user-orders-slice';

export {
  selectUser,
  selectUserName,
  selectIsAuthChecked,
  selectIsAuthenticated,
  selectLoginError,
  selectRegisterError,
  selectUpdateUserError,
  selectForgotPasswordError,
  selectResetPasswordError
} from '../slices/user-slice';

const findOrderByNumber = (orders: TOrder[], orderNumber: number) =>
  orders.find((order) => order.number === orderNumber);

export const selectOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | undefined => {
  const { currentOrder } = state.order;
  if (currentOrder && currentOrder.number === orderNumber) {
    return currentOrder;
  }
  return (
    findOrderByNumber(state.feed.orders, orderNumber) ??
    findOrderByNumber(state.userOrders.orders, orderNumber)
  );
};
