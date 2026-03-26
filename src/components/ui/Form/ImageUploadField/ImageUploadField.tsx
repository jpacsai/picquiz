import { createImageFileUniqueSuffix, getResponsiveImageFileNames } from '@data/storage';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { useRef, useState } from 'react';

import ImageUploadDialog from '@/components/pages/Admin/TopicItemFormPage/TopicItemForm/components/ImageUploadDialog';
import type { PendingImageSelection } from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

import ImagePreviewDialog from './components/ImagePreviewDialog';
import ImageUploadAction from './components/ImageUploadAction';
import StoredImagePreview from './components/StoredImagePreview';

type ImageUploadFieldProps = {
  existingDesktopImageUrl?: string | null;
  existingImageUrl?: string | null;
  existingMobileImageUrl?: string | null;
  existingSelection?: PendingImageSelection | null;
  field: Extract<TopicField, { type: 'imageUpload' }>;
  fileNameParts: string[];
  helperText?: string;
  isReadyForUpload: boolean;
  mode?: 'create' | 'edit';
  onSelectImage: (selection: { file: File; uniqueSuffix: string }) => void;
  uniqueSuffix?: string;
};

const ImageUploadField = ({
  existingDesktopImageUrl,
  existingImageUrl,
  existingMobileImageUrl,
  existingSelection,
  field,
  fileNameParts,
  helperText,
  isReadyForUpload,
  mode = 'create',
  onSelectImage,
  uniqueSuffix,
}: ImageUploadFieldProps) => {
  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const directSelectionUniqueSuffixRef = useRef<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [draftUniqueSuffix, setDraftUniqueSuffix] = useState(() => createImageFileUniqueSuffix());
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const [loadedPreviewImageUrl, setLoadedPreviewImageUrl] = useState<string | null>(null);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  const normalizedFileNameParts = fileNameParts.map((part) => part.trim()).filter(Boolean);
  const activeUniqueSuffix = existingSelection?.uniqueSuffix ?? uniqueSuffix ?? draftUniqueSuffix;
  const generatedFileNames = getResponsiveImageFileNames({
    fileNameParts: normalizedFileNameParts,
    uniqueSuffix: activeUniqueSuffix,
  });
  const resolvedDesktopImageUrl =
    typeof existingDesktopImageUrl === 'string' && existingDesktopImageUrl.trim().length > 0
      ? existingDesktopImageUrl
      : typeof existingImageUrl === 'string' && existingImageUrl.trim().length > 0
        ? existingImageUrl
        : null;
  const resolvedMobileImageUrl =
    typeof existingMobileImageUrl === 'string' && existingMobileImageUrl.trim().length > 0
      ? existingMobileImageUrl
      : null;
  const preferredExistingImageUrl = isMobileScreen
    ? (resolvedMobileImageUrl ?? resolvedDesktopImageUrl)
    : (resolvedDesktopImageUrl ?? resolvedMobileImageUrl);
  const showExistingImage = Boolean(
    preferredExistingImageUrl && !existingSelection && failedImageUrl !== preferredExistingImageUrl,
  );
  const existingImageSrc = showExistingImage ? (preferredExistingImageUrl ?? undefined) : undefined;
  const showExistingImageLoader = Boolean(
    showExistingImage && preferredExistingImageUrl && loadedImageUrl !== preferredExistingImageUrl,
  );
  const showMissingImagePlaceholder =
    mode === 'edit' &&
    !existingSelection &&
    (!preferredExistingImageUrl || failedImageUrl === preferredExistingImageUrl);
  const hasUploadedImage = Boolean(existingSelection || showExistingImage);
  const showPreviewDialogLoader = Boolean(
    isPreviewDialogOpen && existingImageSrc && loadedPreviewImageUrl !== existingImageSrc,
  );
  const imageAlt = normalizedFileNameParts.join(' ') || 'Jelenlegi kép';

  const handleDirectFileChange = (file: File | null) => {
    if (!file) {
      directSelectionUniqueSuffixRef.current = null;
      return;
    }

    onSelectImage({
      file,
      uniqueSuffix: directSelectionUniqueSuffixRef.current ?? activeUniqueSuffix,
    });

    if (directFileInputRef.current) {
      directFileInputRef.current.value = '';
    }

    directSelectionUniqueSuffixRef.current = null;
  };

  return (
    <>
      <Box
        sx={{
          alignItems: 'start',
          columnGap: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          marginTop: '22px',
          rowGap: 1,
        }}
        data-testid="image-upload-field-container"
      >
        <ImageUploadAction
          disabled={!isReadyForUpload}
          helperText={helperText}
          label={field.label}
          onClick={() => {
            if (!hasUploadedImage) {
              const nextUniqueSuffix = createImageFileUniqueSuffix();
              setDraftUniqueSuffix(nextUniqueSuffix);
              directSelectionUniqueSuffixRef.current = nextUniqueSuffix;

              if (directFileInputRef.current) {
                directFileInputRef.current.value = '';
              }

              directFileInputRef.current?.click();
              return;
            }

            if (!existingSelection) {
              setDraftUniqueSuffix(createImageFileUniqueSuffix());
            }

            setIsImageDialogOpen(true);
          }}
        />

        <StoredImagePreview
          imageAlt={imageAlt}
          imageSrc={existingImageSrc}
          isLoading={showExistingImageLoader}
          onImageError={() => {
            setFailedImageUrl(preferredExistingImageUrl ?? null);
          }}
          onImageLoad={() => {
            setLoadedImageUrl(preferredExistingImageUrl ?? null);
          }}
          onOpenPreview={() => {
            setLoadedPreviewImageUrl(null);
            setIsPreviewDialogOpen(true);
          }}
          showImage={showExistingImage}
          showMissingPlaceholder={showMissingImagePlaceholder}
        />

        <input
          ref={directFileInputRef}
          data-testid="direct-image-upload-input"
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            handleDirectFileChange(event.target.files?.[0] ?? null);
          }}
        />
      </Box>

      <ImageUploadDialog
        existingSelection={existingSelection}
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        generatedFileNames={generatedFileNames}
        onSelect={(file) => {
          onSelectImage({
            file,
            uniqueSuffix: activeUniqueSuffix,
          });
        }}
      />

      <ImagePreviewDialog
        imageAlt={imageAlt}
        imageSrc={existingImageSrc}
        isLoading={showPreviewDialogLoader}
        isMobileScreen={isMobileScreen}
        onClose={() => {
          setIsPreviewDialogOpen(false);
          setLoadedPreviewImageUrl(null);
        }}
        open={isPreviewDialogOpen}
        onImageLoad={() => {
          setLoadedPreviewImageUrl(existingImageSrc ?? null);
        }}
      />
    </>
  );
};

export default ImageUploadField;
