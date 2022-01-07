import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { Button } from '../../shared-components/button';
import { WalletSelectModal } from '../../shared-components/wallet-select/modal';
import { updateConnector } from '../../store/web3';
import { WalletType } from '../../shared-components/wallet-select/wallets';
import  { ConnectionStatus } from '../../lib/web3';

import './styles.css';
import {EthAddress} from '../../shared-components/eth-address';

export interface Properties {
  currentAddress: string;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
}

export interface State {
  showModal: boolean;
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const { web3: { address, status } } = state;

    return {
      currentAddress: address,
      connectionStatus: status,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
    };
  }

  state = { showModal: false, walletSelected: false };

  componentDidUpdate(prevProps: Properties) {
    if (
      ( this.props.connectionStatus === ConnectionStatus.Connected ) &&
      ( prevProps.connectionStatus !== ConnectionStatus.Connected )
    ) {
      this.closeModal();
    }
  }

  get showModal() {
    return this.state.showModal;
  }

  get isConnecting() {
    return this.state.walletSelected || ( this.props.connectionStatus === ConnectionStatus.Connecting );
  }

  get availableWallets() {
    return [ WalletType.Metamask ];
  }

  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });

  handleWalletSelected = (connector: WalletType) => {
    this.setState({ walletSelected: true });
    this.props.updateConnector(connector);
  }

  render() {
    return (
      <div className="wallet-manager">
        <EthAddress address={this.props.currentAddress} />
        <Button className='wallet-manager__connect-button' label='Connect Wallet' onClick={this.openModal} />
        {this.showModal && (
          <WalletSelectModal
            wallets={this.availableWallets}
            isConnecting={this.isConnecting}
            onClose={this.closeModal}
            onSelect={this.handleWalletSelected}
          />
        )}
      </div>
    );
  }
}

export const WalletManager = connectContainer<{}>(Container);
