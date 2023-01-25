import getDeepProperty from 'lodash.get';
import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';

import { nonceOrAuthorize as nonceOrAuthorizeApi, fetchCurrentUser, clearSession as clearSessionApi } from './api';

export interface Payload {
  signedWeb3Token: string;
}

export const currentUserSelector = () => (state) => {
  return getDeepProperty(state, 'authentication.user.data', null);
};

export function* nonceOrAuthorize(action) {
  const { signedWeb3Token } = action.payload;

  const { nonceToken: nonce = undefined } = yield call(nonceOrAuthorizeApi, signedWeb3Token);

  if (nonce) {
    yield put(setUser({ nonce }));
  } else {
    yield call(getCurrentUser);
  }
}

export function* clearSession() {
  yield call(clearSessionApi);
  yield put(
    setUser({
      data: null,
      isLoading: false,
      nonce: null,
    })
  );
}

export function* getCurrentUser() {
  yield put(setUser({ data: null, isLoading: true }));
  const user = yield call(fetchCurrentUser);

  yield put(
    setUser({
      data: user,
      isLoading: false,
    })
  );
}

export function* saga() {
  yield takeLatest(SagaActionTypes.NonceOrAuthorize, nonceOrAuthorize);
  yield takeLatest(SagaActionTypes.ClearSession, clearSession);
  yield takeLatest(SagaActionTypes.FetchCurrentUser, getCurrentUser);
}