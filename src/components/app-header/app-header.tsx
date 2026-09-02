import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { selectUserName } from '@selectors';
import { useSelector } from '../../services/store';

export const AppHeader: FC = () => {
  const userName = useSelector(selectUserName);

  return <AppHeaderUI userName={userName} />;
};
