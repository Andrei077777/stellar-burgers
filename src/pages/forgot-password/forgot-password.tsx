import { FC, useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { ForgotPasswordUI } from '@ui-pages';
import { selectForgotPasswordError } from '@selectors';
import { clearUserErrors, forgotPassword } from '@slices';
import { useDispatch, useSelector } from '../../services/store';
import { RESET_PASSWORD_STORAGE_KEY, ROUTES } from '../../utils/constants';

export const ForgotPassword: FC = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const forgotPasswordError = useSelector(selectForgotPasswordError);

  const navigate = useNavigate();

  useEffect(
    () => () => {
      dispatch(clearUserErrors());
    },
    [dispatch]
  );

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      localStorage.setItem(RESET_PASSWORD_STORAGE_KEY, 'true');
      navigate(ROUTES.RESET_PASSWORD, { replace: true });
    }
  };

  return (
    <ForgotPasswordUI
      errorText={forgotPasswordError ?? undefined}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
