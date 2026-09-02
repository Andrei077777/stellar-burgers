import { FC, useCallback, useEffect } from 'react';
import {
  Location,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate
} from 'react-router-dom';

import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';

import {
  AppHeader,
  DetailsPage,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute
} from '@components';
import { checkUserAuth, fetchIngredients } from '@slices';
import { useDispatch } from '../../services/store';
import {
  formatOrderNumber,
  INGREDIENT_DETAILS_TITLE,
  ROUTES
} from '../../utils/constants';

type TModalLocationState = {
  background?: Location;
};

const ORDER_TITLE_CLASS_NAME = 'text_type_digits-default';

const App: FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as TModalLocationState | null;
  const backgroundLocation = locationState?.background;

  const feedOrderMatch = useMatch(ROUTES.FEED_ORDER);
  const profileOrderMatch = useMatch(ROUTES.PROFILE_ORDER);
  const orderNumberParam =
    feedOrderMatch?.params.number ?? profileOrderMatch?.params.number;
  const orderTitle = orderNumberParam
    ? formatOrderNumber(Number(orderNumberParam))
    : '';

  useEffect(() => {
    dispatch(fetchIngredients());
    dispatch(checkUserAuth());
  }, [dispatch]);

  const handleModalClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={backgroundLocation || location}>
        <Route path={ROUTES.HOME} element={<ConstructorPage />} />
        <Route path={ROUTES.FEED} element={<Feed />} />
        <Route
          path={ROUTES.LOGIN}
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE_ORDERS}
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FEED_ORDER}
          element={
            <DetailsPage
              title={orderTitle}
              titleClassName={ORDER_TITLE_CLASS_NAME}
            >
              <OrderInfo />
            </DetailsPage>
          }
        />
        <Route
          path={ROUTES.INGREDIENT}
          element={
            <DetailsPage title={INGREDIENT_DETAILS_TITLE}>
              <IngredientDetails />
            </DetailsPage>
          }
        />
        <Route
          path={ROUTES.PROFILE_ORDER}
          element={
            <ProtectedRoute>
              <DetailsPage
                title={orderTitle}
                titleClassName={ORDER_TITLE_CLASS_NAME}
              >
                <OrderInfo />
              </DetailsPage>
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound404 />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path={ROUTES.FEED_ORDER}
            element={
              <Modal title={orderTitle} onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path={ROUTES.INGREDIENT}
            element={
              <Modal
                title={INGREDIENT_DETAILS_TITLE}
                onClose={handleModalClose}
              >
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path={ROUTES.PROFILE_ORDER}
            element={
              <ProtectedRoute>
                <Modal title={orderTitle} onClose={handleModalClose}>
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
