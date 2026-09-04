import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResetPasswordUI } from '@ui-pages';
import { selectResetPasswordError } from '@selectors';
import { clearUserErrors, resetPassword } from '@slices';
import { useDispatch, useSelector } from '../../services/store';
import { RESET_PASSWORD_STORAGE_KEY, ROUTES } from '../../utils/constants';

export const ResetPassword: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const resetPasswordError = useSelector(selectResetPasswordError);

  useEffect(
    () => () => {
      dispatch(clearUserErrors());
    },
    [dispatch]
  );

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const result = await dispatch(resetPassword({ password, token }));
    if (resetPassword.fulfilled.match(result)) {
      localStorage.removeItem(RESET_PASSWORD_STORAGE_KEY);
      navigate(ROUTES.LOGIN);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem(RESET_PASSWORD_STORAGE_KEY)) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [navigate]);

  return (
    <ResetPasswordUI
      errorText={resetPasswordError ?? undefined}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
