import { to } from 'await-to-js';
import React from 'react';
import { toast } from 'react-toastify';
import { getAccountsFromDevice } from '@utils/hwManager';
import { tokenMap, routes } from '@constants';
import { TertiaryButton } from '@toolbox/buttons';
import AccountCard from './accountCard';
import LoadingIcon from '../loadingIcon';
import styles from './selectAccount.css';

class SelectAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accountOnEditMode: -1,
      hwAccounts: [],
    };

    this.onEditAccount = this.onEditAccount.bind(this);
    this.onChangeAccountTitle = this.onChangeAccountTitle.bind(this);
    this.onSaveNameAccounts = this.onSaveNameAccounts.bind(this);
    this.onAddNewAccount = this.onAddNewAccount.bind(this);
    this.onSelectAccount = this.onSelectAccount.bind(this);
    this.getNameFromAccount = this.getNameFromAccount.bind(this);
  }

  componentDidMount() {
    console.info('selectAccount componentDidMount');
    this.getAccountsFromDevice();
  }

  componentDidUpdate() {
    // istanbul ignore else
    console.info('selectAccount componentDidUpdate this.props.account', this.props.account);
    if (this.props.account?.summary?.address) {
      this.props.history.push(`${routes.dashboard.path}`);
    }
    const { devices, device } = this.props;
    const activeDevice = devices.find(d => d.deviceId === device.deviceId);
    if (!activeDevice) this.props.prevStep({ reset: true });
  }

  getNameFromAccount(address) {
    const { settings, device } = this.props;
    // istanbul ignore else
    if (Array.isArray(settings.hardwareAccounts[device.model])) {
      const storedAccount = settings.hardwareAccounts[device.model].filter(account =>
        account.summary?.address === address);
      return storedAccount.length ? storedAccount[0].name : null;
    }

    return null;
  }

  async getAccountsFromDevice() {
    const { device, network } = this.props;
    console.info('selectAccount getAccountsFromDevice', { device, network });
    const [error, accounts] = await to(getAccountsFromDevice({ device, network }));
    console.info('selectAccount getAccountsFromDevice', error, accounts);
    if (error) {
      toast.error(`Error retrieving accounts from device: ${error}`);
    } else {
      console.info("selectAccount getAccountsFromDevice accounts", accounts);
      const hwAccounts = accounts.map((account, index) => ({
        ...account,
        name: this.getNameFromAccount(account.summary.address),
        shouldShow: account.summary.balance > 0 || index === 0,
      }));
      console.info("selectAccount getAccountsFromDevice hwAccounts", hwAccounts);
      this.setState({ hwAccounts });
    }
  }

  onEditAccount(index) {
    this.onSaveNameAccounts();
    this.setState({ accountOnEditMode: index });
  }

  onChangeAccountTitle(value, index) {
    const newAccounts = this.state.hwAccounts;
    newAccounts[index].name = value;
    this.setState({ hwAccounts: newAccounts });
  }

  onSaveNameAccounts() {
    const accountNames = this.state.hwAccounts.map(account =>
      ({ address: account.summary.address, name: account.name }));
    this.props.settingsUpdated({
      hardwareAccounts: {
        ...this.props.settings.hardwareAccounts,
        [this.props.device.model]: accountNames,
      },
    });
    this.setState({ accountOnEditMode: -1 });
  }

  onAddNewAccount() {
    const { t } = this.props;
    const { hwAccounts } = this.state;
    const lastAccount = hwAccounts[hwAccounts.length - 1];

    if (!lastAccount.shouldShow) {
      hwAccounts[hwAccounts.length - 1] = {
        ...lastAccount,
        shouldShow: true,
      };
      this.setState({ hwAccounts });
    } else {
      const label = t('Please use the last not-initialized account before creating a new one!');
      toast.error(label);
    }
  }

  onSelectAccount(account, index) {
    const { login, device, settingsUpdated } = this.props;
    console.info("selectAccount onSelectAccount account, index", account, index);
    console.info("selectAccount onSelectAccount", login, device, settingsUpdated);

    settingsUpdated({
      token: {
        active: tokenMap.LSK.key,
        list: { BTC: false, LSK: true },
      },
    });

    login({
      publicKey: account.summary.publicKey,
      hwInfo: {
        deviceId: device.deviceId,
        derivationIndex: index,
        deviceModel: device.model,
      },
    });
  }

  render() {
    const { t, device, goBack } = this.props;
    const { accountOnEditMode, hwAccounts } = this.state;
    console.info("selectAccount hwAccounts", hwAccounts);

    return (
      <div>
        <h1>{t('Lisk accounts on {{WalletModel}}', { WalletModel: device.model })}</h1>
        <p>
          {t('Please select the account you’d like to sign in to or')}
          <TertiaryButton
            className={`${styles.createAccountBtn} create-account`}
            onClick={this.onAddNewAccount}
          >
            {t('Create an account')}
          </TertiaryButton>
        </p>

        <div className={`${styles.deviceContainer} hw-container`}>
          {
          hwAccounts.length
            ? hwAccounts.filter(({ shouldShow }) => shouldShow).map((hwAccount, index) => (
              <AccountCard
                key={index}
                account={hwAccount}
                accountOnEditMode={accountOnEditMode}
                index={index}
                onChangeAccountTitle={this.onChangeAccountTitle}
                onEditAccount={this.onEditAccount}
                onSaveNameAccounts={this.onSaveNameAccounts}
                onSelectAccount={this.onSelectAccount}
                t={t}
              />
            ))
            : <LoadingIcon />
        }
        </div>

        <TertiaryButton className="go-back" onClick={goBack}>
          {t('Go back')}
        </TertiaryButton>
      </div>
    );
  }
}

export default SelectAccount;
