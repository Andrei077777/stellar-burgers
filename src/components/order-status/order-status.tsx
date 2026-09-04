import React, { FC } from 'react';
import { OrderStatusProps } from './type';
import { OrderStatusUI } from '@ui';
import { ORDER_STATUS } from '../../utils/constants';

const statusText: { [key: string]: string } = {
  [ORDER_STATUS.PENDING]: 'Готовится',
  [ORDER_STATUS.DONE]: 'Выполнен',
  [ORDER_STATUS.CREATED]: 'Создан',
  [ORDER_STATUS.CANCELLED]: 'Отменён'
};

const PENDING_COLOR = '#E52B1A';
const DONE_COLOR = '#00CCCC';
const DEFAULT_COLOR = '#F2F2F3';

export const OrderStatus: FC<OrderStatusProps> = ({ status }) => {
  let textStyle = '';
  switch (status) {
    case ORDER_STATUS.PENDING:
      textStyle = PENDING_COLOR;
      break;
    case ORDER_STATUS.DONE:
      textStyle = DONE_COLOR;
      break;
    default:
      textStyle = DEFAULT_COLOR;
  }

  return <OrderStatusUI textStyle={textStyle} text={statusText[status]} />;
};
