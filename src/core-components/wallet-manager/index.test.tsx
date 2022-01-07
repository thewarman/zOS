import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Button } from '../../shared-components/button';
import { WalletSelectModal } from '../../shared-components/wallet-select/modal';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';

describe('WalletManager', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders connect button', () => {
    const wrapper = subject();

    const button = wrapper.find(Button);

    expect(button.hasClass('wallet-manager__connect-button')).toBe(true);
  });

  it('does not render wallet select modal', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('renders wallet select modal when button is clicked', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(true);
  });

  it('passes isConnecting of true when connection status is Connecting', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('passes isConnecting of true when wallet selected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Disconnected });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('closes wallet select modal onClose', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('close');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('closes wallet select modal when status is connected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Disconnected });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    // straight to Connected from Disconnected. we should not force this
    // to pass through Connecting
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected })

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('calls update connector when wallet selected', () => {
    const updateConnector = jest.fn();

    const wrapper = subject({ updateConnector });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Metamask);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) => ({
      ...state,
      web3: {
        status: ConnectionStatus.Connecting,
        ...(state.web3 || {}),
      },
    } as RootState);

    test('status', () => {
      const state = subject(getState({ web3: { status: ConnectionStatus.Connected } }));

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });
  });
});
