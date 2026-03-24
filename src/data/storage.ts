import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../lib/firebase';

type ImageVariant = 'desktop' | 'mobile';

type UploadImageVariantParams = {
  blob: Blob;
  fileNameBase: string;
  storagePrefix: string;
  variant: ImageVariant;
};

type UploadedImageVariantResult = {
  path: string;
  url: string;
};

type UploadResponsiveTopicImagesParams = {
  desktopBlob: Blob;
  fileNameParts: string[];
  mobileBlob: Blob;
  storagePrefix: string;
  uniqueSuffix?: string;
};

type UploadedResponsiveTopicImagesResult = {
  desktop: UploadedImageVariantResult;
  mobile: UploadedImageVariantResult;
};

const sanitizeFileNamePart = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const getFileNameBasePart = (parts: string[]) =>
  parts
    .map((part) => sanitizeFileNamePart(part))
    .filter(Boolean)
    .join('-') || 'image';

export const createImageFileUniqueSuffix = () => {
  const timestamp = Date.now().toString(36);

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${timestamp}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
  }

  return `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getImageVariantFileName = ({
  fileNameParts,
  uniqueSuffix,
  variant,
}: {
  fileNameParts: string[];
  uniqueSuffix?: string;
  variant: ImageVariant;
}) =>
  `${getFileNameBasePart(fileNameParts)}${
    uniqueSuffix ? `-${sanitizeFileNamePart(uniqueSuffix)}` : ''
  }-${variant}.jpg`;

export const getResponsiveImageFileNames = ({
  fileNameParts,
  uniqueSuffix,
}: {
  fileNameParts: string[];
  uniqueSuffix?: string;
}) => ({
  desktop: getImageVariantFileName({ fileNameParts, uniqueSuffix, variant: 'desktop' }),
  mobile: getImageVariantFileName({ fileNameParts, uniqueSuffix, variant: 'mobile' }),
});

export const uploadImageVariant = async ({
  blob,
  fileNameBase,
  storagePrefix,
  variant,
}: UploadImageVariantParams): Promise<UploadedImageVariantResult> => {
  const timestamp = Date.now();
  const path = `${storagePrefix}/${variant}/${timestamp}-${fileNameBase}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  return {
    path,
    url: await getDownloadURL(storageRef),
  };
};

export const uploadResponsiveTopicImages = async ({
  desktopBlob,
  fileNameParts,
  mobileBlob,
  storagePrefix,
  uniqueSuffix,
}: UploadResponsiveTopicImagesParams): Promise<UploadedResponsiveTopicImagesResult> => {
  const fileNames = getResponsiveImageFileNames({ fileNameParts, uniqueSuffix });

  const [desktop, mobile] = await Promise.all([
    uploadImageVariant({
      blob: desktopBlob,
      fileNameBase: fileNames.desktop,
      storagePrefix,
      variant: 'desktop',
    }),
    uploadImageVariant({
      blob: mobileBlob,
      fileNameBase: fileNames.mobile,
      storagePrefix,
      variant: 'mobile',
    }),
  ]);

  return {
    desktop,
    mobile,
  };
};

export const deleteTopicImageByPath = async (path: string) => {
  await deleteObject(ref(storage, path));
};
