import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  resetPasswordApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '@api';
import { TUser } from '@utils-types';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_STORAGE_KEY
} from '../../utils/constants';

const LOGIN_ERROR = 'Не удалось войти';
const REGISTER_ERROR = 'Не удалось зарегистрироваться';
const UPDATE_USER_ERROR = 'Не удалось обновить данные пользователя';
const FORGOT_PASSWORD_ERROR = 'Не удалось отправить письмо для сброса пароля';
const RESET_PASSWORD_ERROR = 'Не удалось сменить пароль';

type TAuthTokens = Pick<
  Awaited<ReturnType<typeof loginUserApi>>,
  'accessToken' | 'refreshToken'
>;

type TApiError = {
  success: boolean;
  message?: string;
};

type TForgotPasswordData = Parameters<typeof forgotPasswordApi>[0];

type TResetPasswordData = Parameters<typeof resetPasswordApi>[0];

export type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isAuthCheckPending: boolean;
  loginError: string | null;
  registerError: string | null;
  updateUserError: string | null;
  forgotPasswordError: string | null;
  resetPasswordError: string | null;
};

export const userInitialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isAuthCheckPending: false,
  loginError: null,
  registerError: null,
  updateUserError: null,
  forgotPasswordError: null,
  resetPasswordError: null
};

const saveAuthTokens = (tokens: TAuthTokens) => {
  setCookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
};

const clearAuthTokens = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

const hasStoredAuthTokens = () =>
  Boolean(
    getCookie(ACCESS_TOKEN_COOKIE_NAME) ||
      localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  );

/** Ответ сервера с success: false (в отличие от сетевой ошибки fetch). */
const isApiError = (error: unknown): error is TApiError =>
  typeof error === 'object' && error !== null && 'success' in error;

export const registerUser = createAsyncThunk<TUser, TRegisterData>(
  'user/registerUser',
  async (registerData) => {
    const response = await registerUserApi(registerData);
    saveAuthTokens(response);
    return response.user;
  }
);

export const loginUser = createAsyncThunk<TUser, TLoginData>(
  'user/loginUser',
  async (loginData) => {
    const response = await loginUserApi(loginData);
    saveAuthTokens(response);
    return response.user;
  }
);

/** Локальная сессия сбрасывается даже если сервер не подтвердил выход. */
export const logoutUser = createAsyncThunk<void>(
  'user/logoutUser',
  async () => {
    try {
      await logoutApi();
    } finally {
      clearAuthTokens();
    }
  }
);

export const fetchUser = createAsyncThunk<TUser>('user/fetchUser', async () => {
  try {
    if (!getCookie(ACCESS_TOKEN_COOKIE_NAME)) {
      await refreshToken();
    }
    const response = await getUserApi();
    return response.user;
  } catch (error) {
    if (isApiError(error)) {
      clearAuthTokens();
    }
    throw error;
  }
});

export const checkUserAuth = createAsyncThunk<
  void,
  void,
  { state: { user: TUserState } }
>(
  'user/checkUserAuth',
  async (_, { dispatch }) => {
    if (hasStoredAuthTokens()) {
      await dispatch(fetchUser());
    }
  },
  {
    condition: (_, { getState }) => !getState().user.isAuthCheckPending
  }
);

export const updateUser = createAsyncThunk<TUser, Partial<TRegisterData>>(
  'user/updateUser',
  async (userData) => {
    const response = await updateUserApi(userData);
    return response.user;
  }
);

export const forgotPassword = createAsyncThunk<void, TForgotPasswordData>(
  'user/forgotPassword',
  async (forgotPasswordData) => {
    await forgotPasswordApi(forgotPasswordData);
  }
);

export const resetPassword = createAsyncThunk<void, TResetPasswordData>(
  'user/resetPassword',
  async (resetPasswordData) => {
    await resetPasswordApi(resetPasswordData);
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    clearUserErrors: (state) => {
      state.loginError = null;
      state.registerError = null;
      state.updateUserError = null;
      state.forgotPasswordError = null;
      state.resetPasswordError = null;
    }
  },
  selectors: {
    selectUser: (state) => state.user,
    selectUserName: (state) => state.user?.name,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectIsAuthenticated: (state) => Boolean(state.user),
    selectLoginError: (state) => state.loginError,
    selectRegisterError: (state) => state.registerError,
    selectUpdateUserError: (state) => state.updateUserError,
    selectForgotPasswordError: (state) => state.forgotPasswordError,
    selectResetPasswordError: (state) => state.resetPasswordError
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerError = action.error.message ?? REGISTER_ERROR;
      })
      .addCase(loginUser.pending, (state) => {
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginError = action.error.message ?? LOGIN_ERROR;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthCheckPending = true;
      })
      .addCase(checkUserAuth.fulfilled, (state) => {
        state.isAuthCheckPending = false;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.isAuthCheckPending = false;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError = action.error.message ?? UPDATE_USER_ERROR;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordError =
          action.error.message ?? FORGOT_PASSWORD_ERROR;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordError = action.error.message ?? RESET_PASSWORD_ERROR;
      });
  }
});

export const { clearUserErrors } = userSlice.actions;

export const {
  selectUser,
  selectUserName,
  selectIsAuthChecked,
  selectIsAuthenticated,
  selectLoginError,
  selectRegisterError,
  selectUpdateUserError,
  selectForgotPasswordError,
  selectResetPasswordError
} = userSlice.selectors;

export const userReducer = userSlice.reducer;
