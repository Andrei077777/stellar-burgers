import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useCallback, useEffect } from 'react';
import {
  selectFeedError,
  selectFeedLoading,
  selectFeedOrders
} from '@selectors';
import { fetchFeeds } from '@slices';
import { useDispatch, useSelector } from '../../services/store';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isFeedLoading = useSelector(selectFeedLoading);
  const feedError = useSelector(selectFeedError);

  const handleGetFeeds = useCallback(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  useEffect(() => {
    handleGetFeeds();
  }, [handleGetFeeds]);

  if (!orders.length) {
    if (feedError && !isFeedLoading) {
      return <p className='text text_type_main-default p-10'>{feedError}</p>;
    }
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
