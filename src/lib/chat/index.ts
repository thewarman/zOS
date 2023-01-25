import SendBird from 'sendbird';
import { config } from '../../config';

import { map as mapMessage } from './chat-message';
import { Message } from '../../store/messages';

interface RealtimeChatEvents {
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
}

export class Chat {
  sb = new SendBird({ appId: config.sendBird.appId });
  userPromise: Promise<any>;
  channelListQuery: any;
  messageQueries = {};

  async setUserId(userId: string, accessToken) {
    if (!accessToken || !userId) {
      console.error('accessToken or userId not found');
    }

    const userPromise = new Promise((resolve, reject) => {
      this.sb.connect(userId, accessToken, (user, error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(user);
      });
    });
    this.userPromise = userPromise;
    return userPromise;
  }

  initChat(events: RealtimeChatEvents): void {
    this.initConnectionHandlers(events);
    this.initChannelHandlers(events);
  }

  initConnectionHandlers(events: RealtimeChatEvents): void {
    const connectionHandler = new this.sb.ConnectionHandler();

    connectionHandler.onReconnectStarted = () => events.reconnectStart();
    connectionHandler.onReconnectSucceeded = () => events.reconnectStop();
    connectionHandler.onReconnectFailed = () => this.sb.reconnect(); // sendbird gives up, so for now, just retry every time.

    this.sb.addConnectionHandler('connectionHandler', connectionHandler);
  }

  initChannelHandlers(events: RealtimeChatEvents): void {
    const channelHandler = new this.sb.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      const id = channel.url.replace('sendbird_group_channel_', '');
      if (channel.isGroupChannel()) {
        events.receiveNewMessage(id, this.mapMessage(message));
      }
    };

    channelHandler.onMessageDeleted = (channel, messageId) => {
      const id = channel.url.replace('sendbird_group_channel_', '');
      events.receiveDeleteMessage(id, parseInt(messageId as any)); // It is documented to return a number. But is actually a string
    };

    chat.sb.addChannelHandler('chatHandler', channelHandler);
  }

  reconnect(): void {
    this.sb.reconnect();
  }

  mapMessage = (message): Message => mapMessage(message);
}

export const chat = new Chat();