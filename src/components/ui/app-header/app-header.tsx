import React, { FC } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import { ROUTES } from '../../../utils/constants';

const getIconType = (isActive: boolean) => (isActive ? 'primary' : 'secondary');

const getLinkClassName = (isActive: boolean) =>
  clsx(styles.link, { [styles.link_active]: isActive });

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const { pathname } = useLocation();
  const isConstructorActive =
    pathname === ROUTES.HOME || pathname.startsWith(ROUTES.INGREDIENTS);

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <NavLink
            to={ROUTES.HOME}
            end
            className={() => getLinkClassName(isConstructorActive)}
          >
            <BurgerIcon type={getIconType(isConstructorActive)} />
            <p className='text text_type_main-default ml-2 mr-10'>
              Конструктор
            </p>
          </NavLink>
          <NavLink
            to={ROUTES.FEED}
            className={({ isActive }) => getLinkClassName(isActive)}
          >
            {({ isActive }) => (
              <>
                <ListIcon type={getIconType(isActive)} />
                <p className='text text_type_main-default ml-2'>
                  Лента заказов
                </p>
              </>
            )}
          </NavLink>
        </div>
        <div className={styles.logo}>
          <Link to={ROUTES.HOME}>
            <Logo className='' />
          </Link>
        </div>
        <div className={styles.link_position_last}>
          <NavLink
            to={ROUTES.PROFILE}
            className={({ isActive }) => getLinkClassName(isActive)}
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={getIconType(isActive)} />
                <p className='text text_type_main-default ml-2'>
                  {userName || 'Личный кабинет'}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
