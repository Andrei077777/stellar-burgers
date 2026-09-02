import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Preloader } from '@ui';
import { selectIsAuthChecked, selectUser } from '@selectors';
import { useSelector } from '../../services/store';
import { ROUTES } from '../../utils/constants';
import { TProtectedLocationState, TProtectedRouteProps } from './type';

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate replace to={ROUTES.LOGIN} state={{ from: location }} />;
  }

  if (onlyUnAuth && user) {
    const locationState = location.state as TProtectedLocationState | null;
    const from = locationState?.from ?? { pathname: ROUTES.HOME };
    return <Navigate replace to={from} />;
  }

  return children;
};
