import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
  ReceiveUnreadCount = 'channelsList/saga/receiveUnreadCount',
  StopSyncChannels = 'channelsList/saga/stopSyncChannels',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const receiveUnreadCount = createAction<string>(SagaActionTypes.ReceiveUnreadCount);
const stopSyncChannels = createAction<string>(SagaActionTypes.StopSyncChannels);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetch, receiveUnreadCount, stopSyncChannels };