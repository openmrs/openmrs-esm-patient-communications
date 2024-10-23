import React, { useCallback, useEffect, useState } from 'react';
import {
  FileUploaderDropContainer,
  InlineNotification,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Stack,
  TextArea,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { DocumentUnknown } from '@carbon/react/icons';
import { uploadConfigTemplate } from '../../api/providers.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './config-upload.scss';

interface ErrorNotification {
  title: string;
  subtitle: string;
}

interface ConfigUploadModalProps {
  closeModal: () => {};
  mutateTemplates: () => void;
}

const ConfigUploadModal: React.FC<ConfigUploadModalProps> = ({ closeModal, mutateTemplates }) => {
  const { t } = useTranslation();

  // Maximm config file size. Hard coding since we don't expect the file size to go beyond
  // 1MB. This value should be updated to match the actual maximum file size once needed in the future.
  const maxFileSize = 1;

  const [errorNotification, setErrorNotification] = useState<ErrorNotification>(null);
  const [fileToUpload, setFileToUpload] = useState<File>(null);

  const [fileContent, setFileContent] = useState<string | null>(null);

  const upload = useCallback(
    (files: Array<File>) => {
      const config = files[0];

      if (config.size > maxFileSize * 1024 * 1024) {
        return setErrorNotification({
          title: t('fileSizeLimitExceededText', 'File size limit exceeded'),
          subtitle: `The file "${config.name}" ${t(
            'fileSizeLimitExceeded',
            'exceeds the size limit of',
          )} ${maxFileSize} MB.`,
        });
      } else {
        setFileToUpload(config);
      }
    },
    [maxFileSize, t],
  );
  const onCancel = useCallback(() => {
    setFileToUpload(null);
    setFileContent(null);
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      try {
        const json = JSON.parse(result);
        setFileContent(JSON.stringify(json, null, 2));
      } catch (e) {
        setFileContent('Invalid JSON file');
      }
    };
    if (fileToUpload) {
      reader.readAsText(fileToUpload);
    }
  }, [fileToUpload]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (fileToUpload) {
        return uploadConfigTemplate(fileToUpload)
          .then(() => {
            mutateTemplates?.();
            showSnackbar({
              title: t('uploadSuccess', 'Upload successful'),
              kind: 'success',
            }),
              closeModal();
          })
          .catch(() =>
            showSnackbar({
              title: t('uploadNotSuccess', 'Upload unsuccessful'),
              kind: 'error',
            }),
          );
      }
    },
    [closeModal, fileToUpload, mutateTemplates, t],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={onCancel} title={t('uploadConfig', 'Upload configuration template')} />
      <ModalBody className={styles.modalBody}>
        {fileToUpload ? (
          <>
            <div className={styles.filePlaceholder}>
              <DocumentUnknown size={16} />
            </div>
            <div className={styles.imageDetails}>
              <Stack gap={5}>
                <div className="cds--label">{t('fileName', 'File name')}</div>
                <h6>{fileToUpload.name}</h6>
                {fileContent && (
                  <div className={styles.jsonPreviesw}>
                    <TextArea labelText={t('fileContent', 'File Content')} value={fileContent} readOnly rows={10} />
                  </div>
                )}
              </Stack>
            </div>
          </>
        ) : (
          <div className="cds--file__container">
            {errorNotification && (
              <div className={styles.errorContainer}>
                <InlineNotification
                  aria-label="Upload error notification"
                  kind="error"
                  onClose={() => setErrorNotification(null)}
                  subtitle={errorNotification.subtitle}
                  title={errorNotification.title}
                />
              </div>
            )}
            <p className="cds--label-description">
              {t('fileUploadSizeConstraints', 'Size limit is {{fileSize}}MB', {
                fileSize: maxFileSize,
              })}
              .
            </p>
            <div className={styles.uploadFile}>
              <FileUploaderDropContainer
                accept={['.json']}
                labelText={t('fileSizeInstructions', 'Drag and drop files here or click to upload')}
                tabIndex={0}
                onAddFiles={(evt, { addedFiles }) => {
                  upload(addedFiles);
                }}
              />
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="lg" disabled={!fileToUpload}>
          {t('uploadConfig', 'Upload config')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default ConfigUploadModal;
