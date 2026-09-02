import { FC } from 'react';
import clsx from 'clsx';

import styles from './details-page.module.css';
import { TDetailsPageProps } from './type';

export const DetailsPage: FC<TDetailsPageProps> = ({
  title,
  titleClassName = 'text_type_main-large',
  children
}) => (
  <div className={styles.wrap}>
    <h2 className={clsx(styles.title, 'text', titleClassName)}>{title}</h2>
    {children}
  </div>
);
