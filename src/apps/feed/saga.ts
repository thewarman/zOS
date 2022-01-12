import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receive } from './store';

import { client } from '../../lib/web3/zns/client';
import { service as providerService } from '../../lib/web3/provider-service';

export function* load(action) {
  const currentProvider = yield call([providerService, providerService.get]);
  const znsClient = yield call(client.get, currentProvider);

  const routeId = yield call([znsClient, znsClient.resolveIdFromName], action.payload);

  const items = yield call([znsClient, znsClient.getFeed], routeId);

  yield put(receive(items));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Load, load);
}