import { Box, Divider, Stack, Typography } from '@mui/material';

type ImagePreviewSectionProps = {
  fileName: string;
  previewUrl: string;
};

const ImagePreviewSection = ({ fileName, previewUrl }: ImagePreviewSectionProps) => {
  return (
    <>
      <Divider />
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Előnézet</Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 260,
          }}
        >
          <Box
            component="img"
            src={previewUrl}
            alt={fileName || 'Kiválasztott kép'}
            sx={{
              width: '100%',
              maxHeight: 420,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      </Stack>
    </>
  );
};

export default ImagePreviewSection;
