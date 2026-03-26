import Box from '@mui/material/Box';

import ImageUploadDialog from '@/components/pages/Admin/TopicItemFormPage/TopicItemForm/components/ImageUploadDialog';
import type { PendingImageSelection } from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

import ImagePreviewDialog from './components/ImagePreviewDialog';
import ImageUploadAction from './components/ImageUploadAction';
import StoredImagePreview from './components/StoredImagePreview';
import useImageUploadField from './useImageUploadField';

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
  const {
    directFileInputRef,
    existingImageSrc,
    generatedFileNames,
    handleActionClick,
    handleDialogSelect,
    handleDirectFileChange,
    handlePreviewImageLoad,
    handleStoredImageError,
    handleStoredImageLoad,
    imageAlt,
    isImageDialogOpen,
    isMobileScreen,
    isPreviewDialogOpen,
    openPreviewDialog,
    setIsImageDialogOpen,
    showExistingImage,
    showExistingImageLoader,
    showMissingImagePlaceholder,
    showPreviewDialogLoader,
    closePreviewDialog,
  } = useImageUploadField({
    existingDesktopImageUrl,
    existingImageUrl,
    existingMobileImageUrl,
    existingSelection,
    fileNameParts,
    mode,
    onSelectImage,
    uniqueSuffix,
  });

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
          onClick={handleActionClick}
        />

        <StoredImagePreview
          imageAlt={imageAlt}
          imageSrc={existingImageSrc}
          isLoading={showExistingImageLoader}
          onImageError={handleStoredImageError}
          onImageLoad={handleStoredImageLoad}
          onOpenPreview={openPreviewDialog}
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
        onSelect={handleDialogSelect}
      />

      <ImagePreviewDialog
        imageAlt={imageAlt}
        imageSrc={existingImageSrc}
        isLoading={showPreviewDialogLoader}
        isMobileScreen={isMobileScreen}
        onClose={closePreviewDialog}
        open={isPreviewDialogOpen}
        onImageLoad={handlePreviewImageLoad}
      />
    </>
  );
};

export default ImageUploadField;
