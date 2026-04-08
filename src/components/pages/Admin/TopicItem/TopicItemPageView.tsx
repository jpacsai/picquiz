import EditIcon from '@mui/icons-material/Edit';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

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
  subtitle,
  thumbnailCaption,
  thumbnailImageUrl,
  title,
}: TopicItemPageViewProps) => {
  return (
    <>
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  alignItems: { md: 'flex-start', xs: 'stretch' },
                  display: 'flex',
                  flexDirection: { md: 'row', xs: 'column' },
                  gap: 2,
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  <Typography variant="h5">{title}</Typography>
                  {subtitle ? (
                    <Typography color="text.secondary" variant="body1">
                      {subtitle}
                    </Typography>
                  ) : null}
                  {meta ? (
                    <Typography color="text.secondary" variant="body2">
                      {meta}
                    </Typography>
                  ) : null}
                </Box>

                <Button startIcon={<EditIcon />} variant="contained" onClick={onEdit}>
                  Szerkesztés
                </Button>
              </Box>

              {showThumbnail ? (
                <>
                  <Divider />

                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Typography variant="subtitle2">{thumbnailCaption}</Typography>

                    <Box
                      component="button"
                      type="button"
                      onClick={onOpenImagePreview}
                      sx={{
                        alignItems: 'center',
                        backgroundColor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        cursor: 'pointer',
                        display: 'grid',
                        gap: 1,
                        justifyItems: 'center',
                        maxWidth: 240,
                        p: 1.5,
                        textAlign: 'left',
                      }}
                    >
                      <Box
                        component="img"
                        alt={imageAlt}
                        src={thumbnailImageUrl}
                        sx={{
                          aspectRatio: '9 / 16',
                          borderRadius: 2,
                          display: 'block',
                          maxWidth: '100%',
                          objectFit: 'cover',
                          width: '100%',
                        }}
                      />
                      <Box
                        sx={{
                          alignItems: 'center',
                          color: 'primary.main',
                          display: 'inline-flex',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          gap: 0.5,
                        }}
                      >
                        <OpenInFullIcon fontSize="small" />
                        <span>Megnyitás</span>
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Adatok</Typography>

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
            </Stack>
          </CardContent>
        </Card>
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
