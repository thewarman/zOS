import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';

async function extractParentMessageData(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const parentMessageData = {
    parentMessageId: null,
    parentMessageText: '',
  };

  const parent = matrixMessage.content['m.relates_to'];
  if (parent && parent['m.in_reply_to']) {
    parentMessageData.parentMessageId = parent['m.in_reply_to'].event_id;

    const parentMessage = await sdkMatrixClient.fetchRoomEvent(
      matrixMessage.room_id,
      parentMessageData.parentMessageId
    );
    if (parentMessage) {
      parentMessageData.parentMessageText = parentMessage.content.body;
    }
  }

  return parentMessageData;
}

export async function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const { event_id, content, origin_server_ts, sender: senderId } = matrixMessage;
  const senderData = sdkMatrixClient.getUser(senderId);

  return {
    id: event_id,
    message: content.body,
    createdAt: origin_server_ts,
    updatedAt: null,
    sender: {
      userId: senderId,
      firstName: senderData.displayName,
      lastName: '',
      profileImage: '',
      profileId: '',
    },
    isAdmin: false,
    optimisticId: content.optimisticId,
    ...{ mentionedUsers: [], hidePreview: false, media: null, image: null, admin: {} },
    ...(await extractParentMessageData(matrixMessage, sdkMatrixClient)),
  };
}