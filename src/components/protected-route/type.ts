import { Location } from 'react-router-dom';
import { ReactElement } from 'react';

export type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export type TProtectedLocationState = {
  from?: Location;
};
