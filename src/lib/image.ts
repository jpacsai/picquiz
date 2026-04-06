import { IMAGE_UPLOAD_MAX_DIMENSIONS } from '@/constants/imageUpload';

type ResizeImageOptions = {
  maxHeight: number;
  maxWidth: number;
};

type ResizedImageResult = {
  blob: Blob;
  height: number;
  width: number;
};

type ResponsiveImageVariants = {
  desktop: ResizedImageResult;
  mobile: ResizedImageResult;
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image.'));
    };

    image.src = objectUrl;
  });

const getFitDimensions = ({
  height,
  maxHeight,
  maxWidth,
  width,
}: ResizeImageOptions & { height: number; width: number }) => {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export resized image.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.9,
    );
  });

export const resizeImageToFit = async (
  file: File,
  options: ResizeImageOptions,
): Promise<ResizedImageResult> => {
  const image = await loadImage(file);
  const { width, height } = getFitDimensions({
    width: image.width,
    height: image.height,
    ...options,
  });
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to create canvas context.');
  }

  context.drawImage(image, 0, 0, width, height);

  return {
    blob: await canvasToBlob(canvas),
    width,
    height,
  };
};

export const generateResponsiveImageVariants = async (
  file: File,
): Promise<ResponsiveImageVariants> => {
  const [desktop, mobile] = await Promise.all([
    resizeImageToFit(file, IMAGE_UPLOAD_MAX_DIMENSIONS.desktop),
    resizeImageToFit(file, IMAGE_UPLOAD_MAX_DIMENSIONS.mobile),
  ]);

  return { desktop, mobile };
};
