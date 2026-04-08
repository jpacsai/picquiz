import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import ImagePreviewDialog from '@/components/ui/Form/ImageUploadField/components/ImagePreviewDialog';

import type { UseTopicItemPageResult } from './useTopicItemPage';

type TopicItemPageViewProps = UseTopicItemPageResult;

const TopicItemPageView = ({
  detailRows,
  hasDetails,
  imageAlt,
  isImagePreviewOpen,
  isMobileScreen,
  meta,
  onCloseImagePreview,
  onEdit,
  onImageLoad,
  onOpenImagePreview,
  previewImageUrl,
  showImagePreviewLoader,
  showThumbnail,
  thumbnailImageUrl,
}: TopicItemPageViewProps) => {
  return (
    <>
      <Box
        sx={{
          alignItems: { md: 'stretch', xs: 'start' },
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { md: 'minmax(0, 1fr) 280px', xs: '1fr' },
        }}
      >
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%' }}>
            <Stack spacing={2}>
              {hasDetails ? (
                <Box
                  sx={{
                    columnGap: 3,
                    display: 'grid',
                    gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
                    rowGap: 2,
                  }}
                >
                  {detailRows.map((row) => (
                    <Box key={row.key} sx={{ display: 'grid', gap: 0.5 }}>
                      <Typography color="text.secondary" variant="caption">
                        {row.label}
                      </Typography>
                      <Typography variant="body1">{row.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  Ehhez az elemhez jelenleg nincs megjeleníthető adat.
                </Typography>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button startIcon={<EditIcon />} variant="contained" onClick={onEdit}>
                  Szerkesztés
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {showThumbnail ? (
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Box
                component="button"
                type="button"
                onClick={onOpenImagePreview}
                sx={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  height: '100%',
                  padding: 0,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Box
                  component="img"
                  alt={imageAlt}
                  src={thumbnailImageUrl}
                  sx={{
                    aspectRatio: '330 / 400',
                    borderRadius: 2,
                    display: 'block',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ) : null}
      </Box>

      <ImagePreviewDialog
        imageAlt={imageAlt}
        imageSrc={previewImageUrl}
        isLoading={showImagePreviewLoader}
        isMobileScreen={isMobileScreen}
        onClose={onCloseImagePreview}
        onImageLoad={onImageLoad}
        open={isImagePreviewOpen}
      />
    </>
  );
};

export default TopicItemPageView;
