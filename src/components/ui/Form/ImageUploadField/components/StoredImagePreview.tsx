import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';

type StoredImagePreviewProps = {
  imageAlt: string;
  imageSrc?: string;
  isLoading: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
  onOpenPreview: () => void;
  showImage: boolean;
  showMissingPlaceholder: boolean;
};

const StoredImagePreview = ({
  imageAlt,
  imageSrc,
  isLoading,
  onImageError,
  onImageLoad,
  onOpenPreview,
  showImage,
  showMissingPlaceholder,
}: StoredImagePreviewProps) => {
  if (!showImage && !showMissingPlaceholder) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        minWidth: 0,
      }}
    >
      {showMissingPlaceholder ? (
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

      {showImage ? (
        <ButtonBase
          onClick={onOpenPreview}
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
                <CircularProgress aria-label="Kep elonezet toltese" size={20} />
              </Box>
            ) : null}

            <Box
              component="img"
              src={imageSrc}
              alt={imageAlt}
              onError={onImageError}
              onLoad={onImageLoad}
              sx={{
                cursor: 'zoom-in',
                display: 'block',
                height: 72,
                objectFit: 'contain',
                opacity: isLoading ? 0 : 1,
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
  );
};

export default StoredImagePreview;
