import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

type UploadImageVariantParams = {
  blob: Blob;
  fileName: string;
  storagePrefix: string;
  variant: 'desktop' | 'mobile';
};

type UploadedImageVariantResult = {
  path: string;
  url: string;
};

type UploadResponsiveTopicImagesParams = {
  desktopBlob: Blob;
  fileName: string;
  mobileBlob: Blob;
  storagePrefix: string;
};

type UploadedResponsiveTopicImagesResult = {
  desktop: UploadedImageVariantResult;
  mobile: UploadedImageVariantResult;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

export const uploadImageVariant = async ({
  blob,
  fileName,
  storagePrefix,
  variant,
}: UploadImageVariantParams): Promise<UploadedImageVariantResult> => {
  const timestamp = Date.now();
  const safeName = sanitizeFileName(fileName) || 'image';
  const path = `${storagePrefix}/${variant}/${timestamp}-${safeName}.jpg`;
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
  fileName,
  mobileBlob,
  storagePrefix,
}: UploadResponsiveTopicImagesParams): Promise<UploadedResponsiveTopicImagesResult> => {
  const [desktop, mobile] = await Promise.all([
    uploadImageVariant({
      blob: desktopBlob,
      fileName,
      storagePrefix,
      variant: 'desktop',
    }),
    uploadImageVariant({
      blob: mobileBlob,
      fileName,
      storagePrefix,
      variant: 'mobile',
    }),
  ]);

  return {
    desktop,
    mobile,
  };
};
