import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';

import { getResponsiveImageFileNames, uploadResponsiveTopicImages } from '../../../data/storage';
import { generateResponsiveImageVariants } from '../../../lib/image';
import type { TopicField } from '../../../types/topics';
import ImageUploadDialog from '../../pages/Admin/Form/ImageUploadDialog';

type ImageUploadFieldProps = {
  artistName: string;
  field: Extract<TopicField, { type: 'imageUpload' }>;
  onUploaded: (urls: { desktop: string; mobile: string }) => void;
  storagePrefix: string;
  title: string;
};

const ImageUploadField = ({
  artistName,
  field,
  onUploaded,
  storagePrefix,
  title,
}: ImageUploadFieldProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const isReadyForUpload = artistName.trim().length > 0 && title.trim().length > 0;
  const generatedFileNames = getResponsiveImageFileNames({
    artistName,
    title,
  });

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1,
          marginTop: '22px',
        }}
      >
        <Button
          variant="contained"
          disabled={!isReadyForUpload}
          onClick={() => setIsImageDialogOpen(true)}
          sx={{ height: '55px' }}
        >
          {field.label}
        </Button>
        {!isReadyForUpload && field.buttonLabel ? (
          <Box
            component="span"
            sx={{
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            {field.buttonLabel}
          </Box>
        ) : null}
      </Box>

      <ImageUploadDialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        generatedFileNames={generatedFileNames}
        onUpload={async (file) => {
          const { desktop, mobile } = await generateResponsiveImageVariants(file);
          const uploadedImages = await uploadResponsiveTopicImages({
            artistName,
            title,
            storagePrefix,
            desktopBlob: desktop.blob,
            mobileBlob: mobile.blob,
          });

          onUploaded({
            desktop: uploadedImages.desktop.url,
            mobile: uploadedImages.mobile.url,
          });
        }}
      />
    </>
  );
};

export default ImageUploadField;
