import { createImageFileUniqueSuffix, getResponsiveImageFileNames } from '@data/storage';
import { useMediaQuery, useTheme } from '@mui/material';
import { useRef, useState } from 'react';

import type { PendingImageSelection } from '@/types/topicItemForm';

type UseImageUploadFieldParams = {
  existingDesktopImageUrl?: string | null;
  existingImageUrl?: string | null;
  existingMobileImageUrl?: string | null;
  existingSelection?: PendingImageSelection | null;
  fileNameParts: string[];
  mode: 'create' | 'edit';
  onSelectImage: (selection: { file: File; uniqueSuffix: string }) => void;
  uniqueSuffix?: string;
};

const getResolvedImageUrl = (imageUrl?: string | null) => {
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0 ? imageUrl : null;
};

const useImageUploadField = ({
  existingDesktopImageUrl,
  existingImageUrl,
  existingMobileImageUrl,
  existingSelection,
  fileNameParts,
  mode,
  onSelectImage,
  uniqueSuffix,
}: UseImageUploadFieldParams) => {
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
  const imageAlt = normalizedFileNameParts.join(' ') || 'Jelenlegi kép';
  const activeUniqueSuffix = existingSelection?.uniqueSuffix ?? uniqueSuffix ?? draftUniqueSuffix;
  const generatedFileNames = getResponsiveImageFileNames({
    fileNameParts: normalizedFileNameParts,
    uniqueSuffix: activeUniqueSuffix,
  });
  const resolvedDesktopImageUrl =
    getResolvedImageUrl(existingDesktopImageUrl) ?? getResolvedImageUrl(existingImageUrl);
  const resolvedMobileImageUrl = getResolvedImageUrl(existingMobileImageUrl);
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

  const openImageDialog = () => {
    if (!existingSelection) {
      setDraftUniqueSuffix(createImageFileUniqueSuffix());
    }

    setIsImageDialogOpen(true);
  };

  const handleActionClick = () => {
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

    openImageDialog();
  };

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

  const handleDialogSelect = (file: File) => {
    onSelectImage({
      file,
      uniqueSuffix: activeUniqueSuffix,
    });
  };

  const handleStoredImageError = () => {
    setFailedImageUrl(preferredExistingImageUrl ?? null);
  };

  const handleStoredImageLoad = () => {
    setLoadedImageUrl(preferredExistingImageUrl ?? null);
  };

  const openPreviewDialog = () => {
    setLoadedPreviewImageUrl(null);
    setIsPreviewDialogOpen(true);
  };

  const closePreviewDialog = () => {
    setIsPreviewDialogOpen(false);
    setLoadedPreviewImageUrl(null);
  };

  const handlePreviewImageLoad = () => {
    setLoadedPreviewImageUrl(existingImageSrc ?? null);
  };

  return {
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
  };
};

export default useImageUploadField;
