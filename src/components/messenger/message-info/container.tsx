import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { closeMessageInfo } from '../../../store/message-info';
import { denormalize as denormalizeChannel } from '../../../store/channels';
import { User } from '../../../store/channels';
import { OverviewPanel } from './overview-panel';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  readBy: User[];
  sentTo: User[];
  message: string;
  messageCreatedAt: string;

  closeMessageInfo: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
      messageInfo: { selectedMessageId },
    } = state;

    const channel = denormalizeChannel(activeConversationId, state) || {};
    const messages = channel.messages || [];
    const selectedMessage = messages.find((msg) => msg.id === selectedMessageId) || {};

    const readBy = selectedMessage.readBy || [];

    const sentTo = (channel.otherMembers || [])
      .filter((user) => !readBy.some((readUser) => readUser.userId === user.userId))
      .filter((user) => user.userId !== selectedMessage.sender?.userId);

    return {
      readBy,
      sentTo,
      message: selectedMessage.message,
      messageCreatedAt: selectedMessage.createdAt,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeMessageInfo };
  }

  close = () => {
    this.props.closeMessageInfo();
  };

  render() {
    return (
      <OverviewPanel
        message={this.props.message}
        messageCreatedAt={this.props.messageCreatedAt}
        readBy={this.props.readBy}
        sentTo={this.props.sentTo}
        closeMessageInfo={this.close}
      />
    );
  }
}

export const MessageInfoContainer = connectContainer<PublicProperties>(Container);
