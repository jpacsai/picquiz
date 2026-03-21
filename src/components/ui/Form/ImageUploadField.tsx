import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';

import { getResponsiveImageFileNames } from '../../../data/storage';
import type { TopicField } from '../../../types/topics';
import ImageUploadDialog from '../../pages/Admin/Form/components/ImageUploadDialog';

type ImageUploadFieldProps = {
  artistName: string;
  existingImageUrl?: string | null;
  existingSelection?: {
    file: File;
    previewUrl: string;
  } | null;
  field: Extract<TopicField, { type: 'imageUpload' }>;
  onSelectImage: (file: File) => void;
  title: string;
};

const ImageUploadField = ({
  artistName,
  existingImageUrl,
  existingSelection,
  field,
  onSelectImage,
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

        {existingImageUrl && !existingSelection ? (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: 12,
              }}
            >
              Jelenlegi kép
            </Box>
            <Box
              component="img"
              src={existingImageUrl}
              alt={title || 'Jelenlegi kép'}
              sx={{
                display: 'block',
                width: 180,
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                objectFit: 'contain',
                backgroundColor: 'background.paper',
              }}
            />
          </Box>
        ) : null}
      </Box>

      <ImageUploadDialog
        existingSelection={existingSelection}
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        generatedFileNames={generatedFileNames}
        onSelect={(file) => {
          onSelectImage(file);
        }}
      />
    </>
  );
};

export default ImageUploadField;
