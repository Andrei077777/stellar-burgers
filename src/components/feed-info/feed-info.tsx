import { FC } from 'react';

import { TOrder } from '@utils-types';
import { selectFeedInfo, selectFeedOrders } from '@selectors';
import { useSelector } from '../../services/store';
import { ORDER_STATUS } from '../../utils/constants';
import { FeedInfoUI } from '../ui/feed-info';

const MAX_ORDERS_IN_COLUMN = 20;

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, MAX_ORDERS_IN_COLUMN);

export const FeedInfo: FC = () => {
  const orders = useSelector(selectFeedOrders);
  const feed = useSelector(selectFeedInfo);

  const readyOrders = getOrders(orders, ORDER_STATUS.DONE);

  const pendingOrders = getOrders(orders, ORDER_STATUS.PENDING);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
