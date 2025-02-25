import React from 'react';
import { Layer, Link, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';
import { Button } from '@carbon/react';

export interface EmptyStateProps {
  displayText: string;
  headerTitle: string;
  launchForm?(): void;
}

export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <EmptyDataIllustration />
        <p className={styles.content}>{t('emptyTableStateText', 'There are no SMS logs to display')}</p>
        <p className={styles.action}>
          {props.launchForm && (
            <Button onClick={props.launchForm} kind="ghost" size={isTablet ? 'lg' : 'sm'}>
              {t('record', 'Record')} {props.displayText.toLowerCase()}
            </Button>
          )}
        </p>
      </Tile>
    </Layer>
  );
};
