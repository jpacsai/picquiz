import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Stack, Typography } from '@mui/material';

import type { TopicSchemaBuilderMode } from '@/types/topicSchemaBuilder';

type TopicSchemaBuilderHeaderProps = {
  canSave: boolean;
  description: string;
  isSaving: boolean;
  mode: TopicSchemaBuilderMode;
  onSave: () => void;
  title: string;
};

const TopicSchemaBuilderHeader = ({
  canSave,
  description,
  isSaving,
  mode,
  onSave,
  title,
}: TopicSchemaBuilderHeaderProps) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
    <Box>
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Box>

    <Stack direction="row" gap={1.5}>
      <RouterLink to="/admin" underline="none" preload="intent">
        <Button component="span" startIcon={<ArrowBackIcon />} variant="outlined">
          Vissza az adminhoz
        </Button>
      </RouterLink>

      <Button variant="contained" onClick={onSave} disabled={!canSave}>
        {isSaving
          ? 'Mentes...'
          : mode === 'create'
            ? 'Schema letrehozasa'
            : 'Valtozasok mentese'}
      </Button>
    </Stack>
  </Stack>
);

export default TopicSchemaBuilderHeader;
