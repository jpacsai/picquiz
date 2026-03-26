import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';

import ImageUploadDialog from '@/components/pages/Admin/TopicItemFormPage/TopicItemForm/components/ImageUploadDialog';
import type { PendingImageSelection } from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

import { createImageFileUniqueSuffix, getResponsiveImageFileNames } from '../../../data/storage';

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
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            width: '100%',
          }}
        >
          {!isReadyForUpload && helperText ? (
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: 12,
              }}
            >
              {helperText}
            </Box>
          ) : null}

          <Button
            variant="contained"
            disabled={!isReadyForUpload}
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
            sx={{ height: '67px' }}
          >
            {field.label}
          </Button>
        </Box>

        {showExistingImage || showMissingImagePlaceholder ? (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              minWidth: 0,
            }}
          >
            {showMissingImagePlaceholder ? (
              <Box
                component="span"
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                }}
              >
                Jelenlegi kép hiba
              </Box>
            ) : null}

            {showExistingImage ? (
              <ButtonBase
                onClick={() => {
                  setLoadedPreviewImageUrl(null);
                  setIsPreviewDialogOpen(true);
                }}
                sx={{
                  borderRadius: 1,
                  display: 'block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textAlign: 'left',
                  width: 180,
                }}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    maxWidth: '100%',
                    height: '67px',
                    overflow: 'hidden',
                    position: 'relative',
                    width: 180,
                  }}
                >
                  {showExistingImageLoader ? (
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        inset: 0,
                        justifyContent: 'center',
                        position: 'absolute',
                      }}
                    >
                      <CircularProgress aria-label="Kep elonezet toltese" size={20} />
                    </Box>
                  ) : null}

                  <Box
                    component="img"
                    src={existingImageSrc}
                    alt={normalizedFileNameParts.join(' ') || 'Jelenlegi kép'}
                    onError={() => {
                      setFailedImageUrl(preferredExistingImageUrl ?? null);
                    }}
                    onLoad={() => {
                      setLoadedImageUrl(preferredExistingImageUrl ?? null);
                    }}
                    sx={{
                      cursor: 'zoom-in',
                      display: 'block',
                      height: 72,
                      objectFit: 'contain',
                      opacity: showExistingImageLoader ? 0 : 1,
                      width: '100%',
                    }}
                  />
                </Box>
              </ButtonBase>
            ) : (
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
            )}
          </Box>
        ) : null}

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

      <Dialog
        fullWidth
        maxWidth={isMobileScreen ? 'xs' : 'md'}
        onClose={() => {
          setIsPreviewDialogOpen(false);
          setLoadedPreviewImageUrl(null);
        }}
        open={isPreviewDialogOpen}
      >
        <DialogContent>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'background.paper',
              display: 'flex',
              height: isMobileScreen ? 400 : 600,
              justifyContent: 'center',
              mx: 'auto',
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              maxWidth: isMobileScreen ? 330 : 800,
            }}
          >
            {showPreviewDialogLoader ? (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  inset: 0,
                  justifyContent: 'center',
                  position: 'absolute',
                }}
              >
                <CircularProgress aria-label="Nagy kep elonezet toltese" size={28} />
              </Box>
            ) : null}

            <Box
              component="img"
              src={existingImageSrc}
              alt={normalizedFileNameParts.join(' ') || 'Jelenlegi kép'}
              onLoad={() => {
                setLoadedPreviewImageUrl(existingImageSrc ?? null);
              }}
              sx={{
                display: 'block',
                height: '100%',
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: showPreviewDialogLoader ? 0 : 1,
                width: '100%',
              }}
            />
          </Box>
          <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }} variant="body2">
            {isMobileScreen ? 'Mobil preview' : 'Desktop preview'}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploadField;
