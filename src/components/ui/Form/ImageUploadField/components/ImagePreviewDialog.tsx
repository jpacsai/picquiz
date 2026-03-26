import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

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
  return (
    <Dialog fullWidth maxWidth={isMobileScreen ? 'xs' : 'md'} onClose={onClose} open={open}>
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
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }} variant="body2">
          {isMobileScreen ? 'Mobil preview' : 'Desktop preview'}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
