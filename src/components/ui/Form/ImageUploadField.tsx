import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
  mode?: 'create' | 'edit';
  onSelectImage: (file: File) => void;
  title: string;
};

const ImageUploadField = ({
  artistName,
  existingImageUrl,
  existingSelection,
  field,
  mode = 'create',
  onSelectImage,
  title,
}: ImageUploadFieldProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const isReadyForUpload = artistName.trim().length > 0 && title.trim().length > 0;
  const generatedFileNames = getResponsiveImageFileNames({
    artistName,
    title,
  });
  const showExistingImage = Boolean(
    existingImageUrl && !existingSelection && failedImageUrl !== existingImageUrl,
  );
  const existingImageSrc = showExistingImage ? existingImageUrl ?? undefined : undefined;
  const showMissingImagePlaceholder =
    mode === 'edit' && !existingSelection && (!existingImageUrl || failedImageUrl === existingImageUrl);

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

        {showExistingImage ? (
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
              src={existingImageSrc}
              alt={title || 'Jelenlegi kép'}
              onError={() => {
                setFailedImageUrl(existingImageUrl ?? null);
              }}
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

        {showMissingImagePlaceholder ? (
          <Box
            sx={{
              alignItems: 'center',
              border: '1px dashed',
              borderColor: 'error.main',
              borderRadius: 1,
              color: 'error.main',
              display: 'flex',
              gap: 1,
              maxWidth: '100%',
              minHeight: 72,
              px: 2,
              width: 180,
            }}
          >
            <ErrorOutlineIcon fontSize="small" titleAccess="Hibas vagy hianyzo kep" />
            <Box
              component="span"
              sx={{
                fontSize: 12,
                lineHeight: 1.4,
              }}
            >
              Hibas vagy hianyzo kep
            </Box>
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
