import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { IMAGE_UPLOAD_MAX_DIMENSIONS } from '@/constants/imageUpload';

type ImagePreviewDialogProps = {
  imageAlt: string;
  imageSrc?: string;
  isLoading: boolean;
  isMobileScreen: boolean;
  onClose: () => void;
  onImageLoad: () => void;
  open: boolean;
};

const ImagePreviewDialog = ({
  imageAlt,
  imageSrc,
  isLoading,
  isMobileScreen,
  onClose,
  onImageLoad,
  open,
}: ImagePreviewDialogProps) => {
  const dialogMaxDimensions = isMobileScreen
    ? IMAGE_UPLOAD_MAX_DIMENSIONS.mobile
    : IMAGE_UPLOAD_MAX_DIMENSIONS.desktop;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            maxWidth: dialogMaxDimensions.maxWidth,
            width: '100%',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            maxHeight: dialogMaxDimensions.maxHeight,
            overflow: 'hidden',
            position: 'relative',
            p: 0,
          }}
        >
          {isLoading ? (
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
            src={imageSrc}
            alt={imageAlt}
            onLoad={onImageLoad}
            sx={{
              display: 'block',
              height: '100%',
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              opacity: isLoading ? 0 : 1,
              width: '100%',
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
