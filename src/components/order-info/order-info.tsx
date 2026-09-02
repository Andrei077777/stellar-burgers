import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import {
  selectCurrentOrderError,
  selectCurrentOrderLoading,
  selectIngredients,
  selectOrderByNumber
} from '@selectors';
import { fetchOrderByNumber } from '@slices';
import { useDispatch, useSelector } from '../../services/store';

const INVALID_ORDER_NUMBER_TEXT = 'Некорректный номер заказа';

export const OrderInfo: FC = () => {
  const { number: orderNumberParam = '' } = useParams<{ number: string }>();
  const orderNumber = Number(orderNumberParam);
  const isOrderNumberValid = Number.isInteger(orderNumber) && orderNumber > 0;
  const dispatch = useDispatch();

  const orderData = useSelector((state) =>
    selectOrderByNumber(state, orderNumber)
  );

  const ingredients = useSelector(selectIngredients);
  const isCurrentOrderLoading = useSelector(selectCurrentOrderLoading);
  const currentOrderError = useSelector(selectCurrentOrderError);

  useEffect(() => {
    if (!orderData && isOrderNumberValid) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber, isOrderNumberValid]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    const message = !isOrderNumberValid
      ? INVALID_ORDER_NUMBER_TEXT
      : !isCurrentOrderLoading
        ? currentOrderError
        : null;
    return message ? (
      <p className='text text_type_main-default'>{message}</p>
    ) : (
      <Preloader />
    );
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
