import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useProviderConfigurations } from '../../hooks/useProviderConfigurations';
import { saveConfig } from '../../api/providers.resource';

interface RemoveConfigModalProps {
  closeDeleteModal: () => void;
  configName: string;
}

const RemoveConfigModal: React.FC<RemoveConfigModalProps> = ({ closeDeleteModal, configName }) => {
  const { t } = useTranslation();
  const { mutateConfigs, providerConfigurations } = useProviderConfigurations();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    const newConfigs = providerConfigurations.filter((config) => config.name !== configName);
    setIsDeleting(true);

    await saveConfig(newConfigs)
      .then(() => {
        mutateConfigs();
        closeDeleteModal();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('configRemoved', 'Configuration removed'),
        });
      })
      .catch((error) => {
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('errorDeletingConfig', 'Error deleting configuration'),
          subtitle: error?.message,
        });
      });
  }, [closeDeleteModal, configName, mutateConfigs, providerConfigurations, t]);

  return (
    <div>
      <ModalHeader
        closeModal={closeDeleteModal}
        title={t('removeConfiguration', 'Remove {{configName}} configuration', {
          configName,
        })}
      />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this configuration?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('removing', 'Removing') + '...'} />
          ) : (
            <span>{t('remove', 'Remove')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RemoveConfigModal;
