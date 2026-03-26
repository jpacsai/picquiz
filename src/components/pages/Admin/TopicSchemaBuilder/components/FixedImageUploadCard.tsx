import { Box, Card, Stack, Typography } from '@mui/material';

type FixedImageUploadCardProps = {
  canConfigure: boolean;
  helperText?: string;
  onClick?: () => void;
  showClickHint?: boolean;
};

const FixedImageUploadCard = ({
  canConfigure,
  helperText = 'Disabled, amig nincs keszre konfiguralva. Vegyel fel hozza legalabb egy required fieldet.',
  onClick,
  showClickHint = true,
}: FixedImageUploadCardProps) => (
  <Card
    variant="outlined"
    data-testid="fixed-image-upload-card"
    aria-disabled={!canConfigure}
    sx={{
      p: 2,
      cursor: canConfigure ? 'pointer' : 'not-allowed',
      opacity: 0.72,
      backgroundColor: 'action.hover',
    }}
    onClick={canConfigure ? onClick : undefined}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={1}
    >
      <Box>
        <Typography variant="subtitle1">Kepfeltoltes</Typography>
        <Typography color="text.secondary" variant="body2">
          {helperText}
        </Typography>
      </Box>

      {showClickHint ? (
        <Typography color="text.secondary" variant="body2">
          Kattints a szerkeszteshez
        </Typography>
      ) : null}
    </Stack>
  </Card>
);

export default FixedImageUploadCard;
