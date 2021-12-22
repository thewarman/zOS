import React from 'react';
import classNames from 'classnames';

import { wallets, WalletType } from './wallets';

import './styles.css';

export interface Properties {
  className?: string;
  wallets?: WalletType[];

  onSelect?: (connector: WalletType) => void;
}

export class WalletSelect extends React.Component<Properties> {
  private clickHandlers: any = {};

  getClickHandler = (walletType: WalletType) => {
    if (!this.clickHandlers[walletType]) {
      this.clickHandlers[walletType] = () => this.props.onSelect(walletType);
    }

    return this.clickHandlers[walletType];
  }

	get wallets() {
		return this.props.wallets || Object.values(WalletType);
	}

  renderWallets() {
    return this.wallets.map(walletType => {
      const { type, name } = wallets[walletType];

      return (
        <div key={type} className='wallet-select__wallet' onClick={this.getClickHandler(type)}>
          <div className='wallet-select__wallet-name'>{name}</div>
        </div>
      );
    });
  }

  render() {
    return (
      <div className={classNames('wallet-select', this.props.className)}>
        {this.renderWallets()}
      </div>
    );
  }
}
