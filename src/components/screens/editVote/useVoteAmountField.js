import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { validateAmountFormat } from '@utils/validators';
import { selectAccountBalance } from '@store/selectors';
import { tokenMap, regex } from '@constants';
import { useSelector } from 'react-redux';

let loaderTimeout = null;

/**
 * Returns error and feedback of vote amount field.
 *
 * @param {String} value - The vote amount value in Beddows
 * @param {Number} balance - The account balance value in Beddows
 * @returns {Object} The boolean error flag and a human readable message.
 */
const getAmountFeedbackAndError = (value, balance) => {
  const { message: feedback } = validateAmountFormat({
    value,
    token: tokenMap.LSK.key,
    funds: balance,
    checklist: ['FORMAT', 'ZERO', 'VOTE_10X', 'INSUFFICIENT_FUNDS', 'VOTES_MAX'],
  });

  return { error: !!feedback, feedback };
};

/**
 * Formats and defines potential errors of the vote mount value
 * Also provides a setter function
 *
 * @param {String} initialValue - The initial vote amount value in Beddows
 * @param {Number} accountBalance - The account balance value in Beddows
 * @returns {[Boolean, Function]} The error flag, The setter function
 */
const useVoteAmountField = (initialValue) => {
  const { i18n } = useTranslation();
  const balance = useSelector(selectAccountBalance);
  const [amountField, setAmountField] = useState({
    value: initialValue,
    isLoading: false,
    feedback: '',
    error: false,
  });

  useEffect(() => {
    if (!amountField.value && initialValue) {
      setAmountField({
        value: initialValue,
        isLoading: false,
        error: false,
        feedback: '',
      });
    }
  }, [initialValue]);

  const onAmountInputChange = ({ value }) => {
    const { leadingPoint } = regex.amount[i18n.language];
    value = leadingPoint.test(value) ? `0${value}` : value;
    clearTimeout(loaderTimeout);

    setAmountField({
      ...amountField,
      value,
      isLoading: true,
    });
    const feedback = getAmountFeedbackAndError(value, balance);
    loaderTimeout = setTimeout(() => {
      setAmountField({
        isLoading: false,
        value,
        ...feedback,
      });
    }, 300);
  };

  return [amountField, onAmountInputChange];
};

export default useVoteAmountField;
