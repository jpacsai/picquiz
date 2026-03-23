import { Box, Divider, Stack, Typography } from '@mui/material';

import type { ImageFileNames } from '@/types/topicItemForm';

type ImagePreviewSectionProps = {
  fileName: string;
  generatedFileNames: ImageFileNames;
  previewUrl: string;
};

const previewVariants = [
  {
    label: 'Desktop preview',
    helperText: 'Max 800 x 600',
    aspectRatio: '4 / 3',
    maxWidth: 320,
  },
  {
    label: 'Mobile preview',
    helperText: 'Max 330 x 400',
    aspectRatio: '330 / 400',
    maxWidth: 220,
  },
] as const;

const ImagePreviewSection = ({
  fileName,
  generatedFileNames,
  previewUrl,
}: ImagePreviewSectionProps) => {
  return (
    <>
      <Divider />
      <Stack spacing={2}>
        <Typography variant="subtitle2">Előnézet</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          {previewVariants.map((variant) => (
            <Stack
              key={variant.label}
              spacing={1}
              sx={{ width: '100%', maxWidth: variant.maxWidth }}
            >
              <Typography variant="body2" fontWeight={600}>
                {variant.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {variant.helperText}
              </Typography>
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
                  width: '100%',
                  aspectRatio: variant.aspectRatio,
                }}
              >
                <Box
                  component="img"
                  src={previewUrl}
                  alt={fileName || 'Kiválasztott kép'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflowWrap: 'anywhere',
                }}
              >
                {variant.label === 'Desktop preview'
                  ? generatedFileNames.desktop
                  : generatedFileNames.mobile}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          A preview az arányt mutatja, a kép teljes egészében látszik crop nélkül.
        </Typography>
      </Stack>
    </>
  );
};

export default ImagePreviewSection;
