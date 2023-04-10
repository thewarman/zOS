import * as React from 'react';

import { Button, Input } from '@zero-tech/zui/components';

import { Option } from '../autocomplete-members';
import { PanelHeader } from './panel-header';
import { SelectedUserTag } from './selected-user-tag';

import { bem } from '../../../lib/bem';
import { ImageUpload } from '../../image-upload';
const c = bem('group-details-panel');

export interface Properties {
  users: Option[];
  isCreating: boolean;

  onBack: () => void;
  onCreate: (data: { name: string; users: Option[]; image: File }) => void;
}

interface State {
  name: string;
  image: File | null;
}

export class GroupDetailsPanel extends React.Component<Properties, State> {
  state = { name: '', image: null };

  createGroup = () => {
    this.props.onCreate({ name: this.state.name, users: this.props.users, image: this.state.image });
  };

  nameChanged = (value) => {
    this.setState({ name: value });
  };

  onImageChange = (image) => {
    this.setState({ image });
  };

  render() {
    return (
      <>
        <PanelHeader title='Group details' onBack={this.props.onBack} />
        <div>
          <div className={c('field-info')}>
            <span className={c('label')}>Group name</span>
            <span className={c('optional')}>Optional</span>
          </div>
          <Input value={this.state.name} onChange={this.nameChanged} />
          <div className={c('field-info')}>
            <span className={c('label')}>Group image</span>
            <span className={c('optional')}>Optional</span>
          </div>
          <ImageUpload onChange={this.onImageChange} />
        </div>
        <div className={c('selected-count')}>
          <span className={c('selected-number')}>{this.props.users.length}</span> member
          {this.props.users.length === 1 ? '' : 's'} selected
        </div>
        <div>
          {this.props.users.map((u) => (
            <SelectedUserTag userOption={u} key={u.value}></SelectedUserTag>
          ))}
        </div>
        <Button onPress={this.createGroup} className={c('create')} isLoading={this.props.isCreating}>
          Create Group
        </Button>
      </>
    );
  }
}