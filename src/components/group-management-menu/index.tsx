import * as React from 'react';

import { IconDotsHorizontal, IconPlus, IconUserRight1 } from '@zero-tech/zui/icons';
import { DropdownMenu } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  canAddMembers: boolean;
  canLeaveRoom: boolean;
  onStartAddMember: () => void;
  onLeave: () => void;
}

interface State {}

export class GroupManagementMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOpenChange = () => {};

  startAddMember = (_e) => {
    this.props.onStartAddMember();
  };

  renderMenuItem(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  get dropdownMenuItems() {
    const menuItems = [];

    if (this.props.canAddMembers) {
      menuItems.push({
        id: 'add-member',
        label: this.renderMenuItem(<IconPlus />, 'Add Member'),
        onSelect: this.startAddMember as any,
      });
    }

    if (this.props.canLeaveRoom) {
      menuItems.push({
        id: 'leave_group',
        className: 'leave-group',
        label: this.renderMenuItem(<IconUserRight1 />, 'Leave Group'),
        onSelect: () => {
          this.props.onLeave();
        },
      });
    }

    return menuItems;
  }

  render() {
    return (
      <DropdownMenu
        menuClassName={'group-management-menu'}
        items={this.dropdownMenuItems}
        side='bottom'
        alignMenu='end'
        onOpenChange={this.handleOpenChange}
        trigger={<IconDotsHorizontal size={24} isFilled />}
      />
    );
  }
}
