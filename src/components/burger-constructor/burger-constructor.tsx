import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BurgerConstructorUI } from '@ui';
import {
  selectConstructorItems,
  selectIsAuthenticated,
  selectOrderError,
  selectOrderModalData,
  selectOrderRequest
} from '@selectors';
import { clearConstructor, clearOrderModalData, createOrder } from '@slices';
import { useDispatch, useSelector } from '../../services/store';
import { BUN_COUNT_IN_BURGER, ROUTES } from '../../utils/constants';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);
  const orderError = useSelector(selectOrderError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const onOrderClick = async () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const bunId = constructorItems.bun._id;
    const ingredientIds = [
      bunId,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      bunId
    ];
    const result = await dispatch(createOrder(ingredientIds));
    if (createOrder.fulfilled.match(result)) {
      dispatch(clearConstructor());
    }
  };

  const closeOrderModal = () => {
    dispatch(clearOrderModalData());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun
        ? constructorItems.bun.price * BUN_COUNT_IN_BURGER
        : 0) +
      constructorItems.ingredients.reduce(
        (sum, ingredient) => sum + ingredient.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderError={orderError}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
