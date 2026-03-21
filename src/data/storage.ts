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
  artistName: string;
  desktopBlob: Blob;
  mobileBlob: Blob;
  storagePrefix: string;
  title: string;
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

const getArtistLastNamePart = (artistName: string) => {
  const tokens = artistName.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return 'artist';
  }

  const trailingLowercaseTokens = tokens.slice(0, -1).reduceRight<string[]>(
    (acc, token) => {
      if (acc.length === 0 || token.toLowerCase() === token) {
        return [token, ...acc];
      }

      return acc;
    },
    [],
  );
  const lastNameTokens = [...trailingLowercaseTokens, tokens.at(-1) ?? 'artist'];

  return sanitizeFileNamePart(lastNameTokens.join('')) || 'artist';
};

const getTitlePart = (title: string) =>
  sanitizeFileNamePart(title.replace(/\s+/g, '')) || 'untitled';

export const getImageVariantFileName = ({
  artistName,
  title,
  variant,
}: {
  artistName: string;
  title: string;
  variant: ImageVariant;
}) => `${getArtistLastNamePart(artistName)}-${getTitlePart(title)}-${variant}.jpg`;

export const getResponsiveImageFileNames = ({
  artistName,
  title,
}: {
  artistName: string;
  title: string;
}) => ({
  desktop: getImageVariantFileName({ artistName, title, variant: 'desktop' }),
  mobile: getImageVariantFileName({ artistName, title, variant: 'mobile' }),
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
  artistName,
  desktopBlob,
  mobileBlob,
  storagePrefix,
  title,
}: UploadResponsiveTopicImagesParams): Promise<UploadedResponsiveTopicImagesResult> => {
  const fileNames = getResponsiveImageFileNames({ artistName, title });

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
