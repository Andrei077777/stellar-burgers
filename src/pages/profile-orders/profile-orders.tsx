import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import {
  selectUserOrders,
  selectUserOrdersError,
  selectUserOrdersLoading
} from '@selectors';
import { fetchUserOrders } from '@slices';
import { useDispatch, useSelector } from '../../services/store';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const isOrdersLoading = useSelector(selectUserOrdersLoading);
  const userOrdersError = useSelector(selectUserOrdersError);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (isOrdersLoading && !orders.length) {
    return <Preloader />;
  }

  if (userOrdersError && !orders.length) {
    return (
      <p className='text text_type_main-default p-10'>{userOrdersError}</p>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
