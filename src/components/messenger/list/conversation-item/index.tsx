import * as React from 'react';

import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { isCustomIcon, lastSeenText } from '../utils/utils';
import { highlightFilter } from '../../lib/utils';
import { Channel } from '../../../../store/channels';

import Tooltip from '../../../tooltip';
import { Avatar, Status } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';

import { ContentHighlighter } from '../../../content-highlighter';

import { bemClassName } from '../../../../lib/bem';
import './conversation-item.scss';
import '../styles.scss';

const cn = bemClassName('conversation-item');

export interface Properties {
  filter: string;
  conversation: Channel & { messagePreview?: string; previewDisplayDate?: string };
  myUserId: string;
  activeConversationId: string;

  onClick: (conversationId: string) => void;
}

export class ConversationItem extends React.Component<Properties> {
  handleMemberClick = () => {
    this.props.onClick(this.props.conversation.id);
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.props.onClick(this.props.conversation.id);
    }
  };

  tooltipContent(conversation: Channel) {
    if (conversation.otherMembers && conversation.otherMembers.length === 1) {
      return lastSeenText(conversation.otherMembers[0]);
    }

    return otherMembersToString(conversation.otherMembers);
  }

  get conversationStatus() {
    const isAnyUserOnline = this.props.conversation.otherMembers.some((user) => user.isOnline);
    return isAnyUserOnline ? 'active' : 'offline';
  }

  highlightedName = () => {
    const { filter, conversation } = this.props;
    const name = conversation.name || otherMembersToString(conversation.otherMembers);

    return highlightFilter(name, filter);
  };

  renderAvatar() {
    if (this.props.conversation.isOneOnOne) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.otherMembers[0].profileImage}
          statusType={this.conversationStatus}
          tabIndex={-1}
        />
      );
    } else if (isCustomIcon(this.props.conversation.icon)) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.icon}
          statusType={this.conversationStatus}
          tabIndex={-1}
        />
      );
    }

    return (
      <div {...cn('group-icon')}>
        <IconUsers1 size={25} />
        <Status {...cn('group-status')} type={this.conversationStatus} />
      </div>
    );
  }

  render() {
    const { conversation, activeConversationId } = this.props;
    const { messagePreview, previewDisplayDate } = conversation;
    const hasUnreadMessages = conversation.unreadCount !== 0;
    const isUnread = hasUnreadMessages ? 'true' : 'false';
    const isActive = conversation.id === activeConversationId ? 'true' : 'false';

    return (
      <Tooltip
        placement='left'
        overlay={this.tooltipContent(conversation)}
        align={{
          offset: [
            10,
            0,
          ],
        }}
      >
        <div
          {...cn('')}
          onClick={this.handleMemberClick}
          onKeyDown={this.handleKeyDown}
          tabIndex={0}
          role='button'
          is-active={isActive}
        >
          {this.renderAvatar()}
          <div {...cn('summary')}>
            <div {...cn('header')}>
              <div {...cn('name')} is-unread={isUnread}>
                {this.highlightedName()}
              </div>
              <div {...cn('timestamp')}>{previewDisplayDate}</div>
            </div>
            <div {...cn('content')}>
              <div {...cn('message')} is-unread={isUnread}>
                <ContentHighlighter message={messagePreview} variant='negative' tabIndex={-1} />
              </div>
              {hasUnreadMessages && <div {...cn('unread-count')}>{conversation.unreadCount}</div>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
}