import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@utils/theme';
import { routes } from '@constants';
import Box from '@toolbox/box';
import BoxHeader from '@toolbox/box/header';
import BoxContent from '@toolbox/box/content';
import LiskAmount from '@shared/liskAmount';
import Icon from '@toolbox/icon';
import styles from './delegateProfile.css';

const Item = ({
  icon, title, children,
}) => {
  const theme = useTheme();

  return (
    <BoxContent className={`${styles.highlight} performance`}>
      <div className={styles.content}>
        <div className={`${styles.title} ${theme}`}>{title}</div>
        {children}
      </div>
      <div className={`${styles.highlighIcon} ${styles[icon]}`}>
        <Icon name={icon} />
      </div>
    </BoxContent>
  );
};

const FullItem = ({
  icon, title, children,
}) => {
  const theme = useTheme();

  return (
    <BoxContent className={`${styles.full} performance`}>
      <div className={styles.content}>
        <div className={`${styles.title} ${theme}`}>{title}</div>
        { children }
      </div>
      <div className={`${styles.highlighIcon} ${styles[icon]}`}>
        <Icon name={icon} />
      </div>
    </BoxContent>
  );
};

const ActiveDelegate = () => {
  const theme = useTheme();

  return (
    <div className={`${styles.delegateDescription} ${theme}`}>
      <p>This delegate is among the first 101 delegates in delegate weight ranking.</p>

      <p>The first 101 delegates will always be selected to forge new blocks.</p>
    </div>
  );
};

const PerformanceView = ({
  t, data,
}) => (
  <Box className={`${grid['col-xs-12']} ${grid['col-md-9']} ${styles.highlightContainer} performance-container`}>
    <BoxHeader>
      <h1 className={styles.heading}>{t('Performance')}</h1>
    </BoxHeader>
    <Box className={`${grid.row} ${styles.content}`}>
      <Box className={`${grid.col} ${grid['col-xs-4']} ${grid['col-md-4']} ${styles.column}`}>
        <FullItem
          title={t('Status')}
          icon="delegateActive"
        >
          <div className={styles.performanceValue}>{data.status ? `${data.status[0].toUpperCase()}${data.status.slice(1)}` : '-'}</div>
          <ActiveDelegate />
        </FullItem>
      </Box>
      <Box className={`${grid.col} ${grid['col-xs-4']} ${grid['col-md-4']} ${styles.column}`}>
        <Item
          title={t('Productivity')}
          icon="productivity"
        >
          <NavLink
            to={`${routes.block.path}?height=${data.lastForgedHeight}`}
            className={styles.performanceValue}
            id={data.lastForgedHeight}
            exact
          >
            {'99.45%' || '-'}
          </NavLink>
        </Item>
        <Item
          title={t('Forged blocks')}
          icon="forgedBlocks"
        >
          <div className={styles.performanceValue}>{data.producedBlocks ?? '-'}</div>
        </Item>
      </Box>
      <Box className={`${grid.col} ${grid['col-xs-4']} ${grid['col-md-4']} ${styles.column}`}>
        <Item
          title={t('Rewards (LSK)')}
          icon="reward"
        >
          <div><LiskAmount val={data.rewards || 0} /></div>
        </Item>
        <Item
          title={t('Consecutive missed blocks')}
          icon="consecutiveMissedBlocks"
        >
          <div className={styles.performanceValue}>{data.consecutiveMissedBlocks}</div>
        </Item>
      </Box>
    </Box>
  </Box>
);

export default PerformanceView;
