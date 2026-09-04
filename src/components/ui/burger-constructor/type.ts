import { TConstructorItems, TOrder } from '@utils-types';

export type BurgerConstructorUIProps = {
  constructorItems: TConstructorItems;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrder | null;
  orderError?: string | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
