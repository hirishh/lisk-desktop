import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';

import { selectSearchParamValue, removeSearchParamsFromUrl } from '@utils/searchParams';
import { tokenMap } from '@constants';
import { voteEdited } from '@actions';
import { selectAccountBalance } from '@store/selectors';
import { toRawLsk, fromRawLsk } from '@utils/lsk';
import Dialog from '@toolbox/dialog/dialog';
import Box from '@toolbox/box';
import BoxContent from '@toolbox/box/content';
import BoxFooter from '@toolbox/box/footer';
import BoxHeader from '@toolbox/box/header';
import BoxInfoText from '@toolbox/box/infoText';
import AmountField from '@shared/amountField';
import LiskAmount from '@shared/liskAmount';
import Converter from '@shared/converter';
import WarnPunishedDelegate from '@shared/warnPunishedDelegate';
import { PrimaryButton, WarningButton } from '@toolbox/buttons';
import useVoteAmountField from './useVoteAmountField';
import getMaxAmount from './getMaxAmount';
import styles from './editVote.css';

const getTitles = t => ({
  edit: {
    title: t('Edit vote'),
    description: t('Increase or decrease your vote amount, or remove your vote from this delegate. Your updated vote will be added to the voting queue.'),
  },
  add: {
    title: t('Add vote'),
    description: t('Insert a vote amount for this delegate. Your new vote will be added to the voting queue.'),
  },
});

// eslint-disable-next-line max-statements
const AddVote = ({
  history, t,
}) => {
  const dispatch = useDispatch();
  const { account, network, voting } = useSelector(state => state);
  const host = useSelector(state => state.account.info.LSK.summary.address);
  const address = selectSearchParamValue(history.location.search, 'address');
  const start = selectSearchParamValue(history.location.search, 'start');
  const end = selectSearchParamValue(history.location.search, 'end');
  const existingVote = useSelector(state => state.voting[address || host]);
  const balance = useSelector(selectAccountBalance);
  const [voteAmount, setVoteAmount] = useVoteAmountField(existingVote ? fromRawLsk(existingVote.unconfirmed) : '');
  const mode = existingVote ? 'edit' : 'add';
  const [maxAmount, setMaxAmount] = useState(0);
  useEffect(() => {
    getMaxAmount(account.info.LSK, network, voting, address || host)
      .then(setMaxAmount);
  }, [account, voting]);

  const confirm = () => {
    dispatch(voteEdited([{
      address: address || host,
      amount: toRawLsk(voteAmount.value),
    }]));

    removeSearchParamsFromUrl(history, ['modal']);
  };

  const titles = getTitles(t)[mode];

  const removeVote = () => {
    dispatch(voteEdited([{
      address: address || host,
      amount: 0,
    }]));

    removeSearchParamsFromUrl(history, ['modal']);
  };

  return (
    <Dialog hasClose className={styles.wrapper}>
      <Box>
        <BoxHeader>
          <h1>{titles.title}</h1>
        </BoxHeader>
        <BoxContent className={styles.noPadding}>
          <BoxInfoText>
            <span>{titles.description}</span>
          </BoxInfoText>
          <BoxInfoText className={styles.accountInfo}>
            <p className={styles.balanceTitle}>{t('Available balance')}</p>
            <div className={styles.balanceDetails}>
              <span className={styles.lskValue}>
                <LiskAmount val={balance} token={tokenMap.LSK.key} />
              </span>
              <Converter
                className={styles.fiatValue}
                value={fromRawLsk(balance)}
                error=""
              />
            </div>
          </BoxInfoText>
          {start !== undefined && (
          <>
            <WarnPunishedDelegate pomHeight={{ start, end }} vote />
            <span className={styles.space} />
          </>
          )}
          <label className={styles.fieldGroup}>
            <AmountField
              amount={voteAmount}
              onChange={setVoteAmount}
              maxAmount={{ value: maxAmount || balance }}
              displayConverter
              label={t('Vote amount (LSK)')}
              placeholder={t('Insert vote amount')}
              useMaxLabel={t('Use maximum amount')}
              useMaxWarning={t('You are about to vote almost your entire balance')}
              name="vote"
            />
          </label>
        </BoxContent>
        <BoxFooter direction="horizontal">
          {
            mode === 'edit' && (
              <WarningButton className="remove-vote" onClick={removeVote}>
                {t('Remove vote')}
              </WarningButton>
            )
          }
          <PrimaryButton className={`${styles.confirmButton} confirm`} onClick={confirm} disabled={voteAmount.error}>
            {t('Confirm')}
          </PrimaryButton>
        </BoxFooter>
      </Box>
    </Dialog>
  );
};

export default compose(
  withRouter,
  withTranslation(),
)(AddVote);
