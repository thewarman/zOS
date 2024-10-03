import { call, put, select, spawn, take, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { userByMatrixIdSelector } from './selectors';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getUserSubHandle } from '../../lib/user';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { currentUserSelector } from '../authentication/saga';
import { setUser } from '../authentication';
import { downloadFile, uploadFile, editProfile as matrixEditProfile } from '../../lib/chat';
import cloneDeep from 'lodash/cloneDeep';
import { getProvider as getIndexedDbProvider } from '../../lib/storage/idb';
import { editUserProfile as apiEditUserProfile } from '../edit-profile/api';
import { User } from '../authentication/types';

export function* clearUsers() {
  yield put(removeAll({ schema: schema.key }));
}

export function* receiveSearchResults(searchResults) {
  const existingUsers = (yield select((state) => state.normalized.users)) ?? {};
  const existingUserIds = Object.keys(existingUsers);

  const mappedUsers = searchResults
    .filter((r) => !existingUserIds.includes(r.id))
    .map((r) => {
      return {
        userId: r.id,
        firstName: r.name,
        profileImage: r.profileImage,
        matrixId: r.matrixId,
        primaryZID: r.primaryZID,
        primaryWalletAddress: r.primaryWalletAddress,
        displaySubHandle: getUserSubHandle(r.primaryZID, r.primaryWalletAddress),
      };
    });

  // fetch the profile images from the homeserver for new search result users
  for (const user of mappedUsers) {
    user.profileImage = yield call(downloadFile, user.profileImage);
  }

  yield put(receive(mappedUsers));
}

/*
  If the user is logging in for the first time, we fetch the cached image (from indexed-db),
  and then call the edit profile API to update the profile image in the ZERO-API database.
  This is because the profile image could not be uploaded to the homeserver during registration
  (as the matrixClient was not initialized at that time).
*/
export function* updateUserProfileImageFromCache(currentUser: User) {
  const { firstName: name } = currentUser.profileSummary || {};
  const { primaryZID } = currentUser;

  const provider = yield call(getIndexedDbProvider);
  const profileImage: File = yield call([provider, provider.get], 'profileImage');

  if (profileImage) {
    const profileImageUrl = yield call(uploadFile, profileImage);
    const response = yield call(apiEditUserProfile, {
      name,
      primaryZID,
      profileImage: profileImageUrl || undefined,
    });
    if (response.success) {
      yield call(matrixEditProfile, profileImageUrl); // also update the profile image in the homeserver user directory
      return profileImageUrl;
    } else {
      console.error('Failed to update user profile on registration:', response.error);
    }
  }

  return undefined;
}

/*
  Fetch the current user's profile image url from the store, and then fetch the image from the homeserver.
  This is because the profile image stored in the homeserver (mxc://) is authoritative, and we need the matrix-client
  access token to fetch the image.

  Also handles the case where the user is logging in for the first time.
*/
export function* fetchCurrentUserProfileImage() {
  const currentUser: User = cloneDeep(yield select(currentUserSelector()));
  let profileImageUrl: string | undefined;

  const isFirstTimeLogin = yield select((state) => state.registration.isFirstTimeLogin);

  if (isFirstTimeLogin) {
    profileImageUrl = yield call(updateUserProfileImageFromCache, currentUser);
  } else {
    profileImageUrl = currentUser.profileSummary?.profileImage;
  }

  if (!profileImageUrl) {
    return;
  }

  // Download the profile image after getting the url
  const downloadedImageUrl = yield call(downloadFile, profileImageUrl);

  // Update the profile image in the store
  const updatedUser = {
    ...currentUser,
    profileSummary: {
      ...currentUser.profileSummary,
      profileImage: downloadedImageUrl,
    },
  };

  yield put(setUser({ data: updatedUser }));
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(fetchCurrentUserProfileImage);
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);

  yield takeEvery(SagaActionTypes.SearchResults, receiveSearchResultsAction);
}

export function* receiveSearchResultsAction(action) {
  return yield receiveSearchResults(action.payload);
}

export function* getUserByMatrixId(matrixId: string) {
  let user = yield select(userByMatrixIdSelector, matrixId);
  if (!user) {
    user = (yield call(getZEROUsersAPI, [matrixId]) ?? [])[0];
  }
  return user;
}
