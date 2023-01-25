import { del, get, post, put } from '../../lib/api/rest';
import { LinkPreview } from '../../lib/link-preview';
import { Media, MessagesResponse } from './index';

export async function fetchMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
  const filter: any = {};

  if (lastCreatedAt) {
    filter.lastCreatedAt = lastCreatedAt;
  }

  const response = await get<any>(`/chatChannels/${channelId}/messages`).send(filter);
  return response.body;
}

export async function sendMessagesByChannelId(
  channelId: string,
  message: string,
  mentionedUserIds: string[]
): Promise<any> {
  const response = await post<any>(`/chatChannels/${channelId}/message`).send({ message, mentionedUserIds });

  return response;
}

export async function deleteMessageApi(channelId: string, messageId: number): Promise<number> {
  const response = await del<any>(`/chatChannels/${channelId}/message`).send({ message: { id: messageId } });

  return response.status;
}

export async function editMessageApi(
  channelId: string,
  messageId: number,
  message: string,
  mentionedUserIds: string[]
): Promise<number> {
  const response = await put<any>(`/chatChannels/${channelId}/message`).send({
    message: { id: messageId, message, mentionedUserIds },
  });

  return response.status;
}

export async function uploadFileMessage(channelId: string, media: File): Promise<Media> {
  const response = await post<any>(`/upload/chatChannels/${channelId}/message`).attach('file', media);

  return response.body;
}

export async function getLinkPreviews(link: string): Promise<LinkPreview> {
  const filter: any = { url: link };

  const response = await get<any>('/linkPreviews', filter);
  return response.body;
}