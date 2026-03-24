import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Alert, Box, Button, Card, Stack, Typography } from '@mui/material';

import type { Topic } from '@/types/topics';

type TopicSchemaBuilderPageProps = {
  mode: 'create' | 'edit';
  topic?: Topic;
};

const TopicSchemaBuilderPage = ({ mode, topic }: TopicSchemaBuilderPageProps) => {
  const title = mode === 'create' ? 'Uj topic schema' : `${topic?.label ?? 'Topic'} schema`;
  const description =
    mode === 'create'
      ? 'Itt lesz a topic schema builder. A kovetkezo lepesben jon a metadata es field editor.'
      : 'Itt lesz a topic schema szerkeszto. A kovetkezo lepesben jon a metadata es field editor.';

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>

        <RouterLink to="/admin" underline="none" preload="intent">
          <Button component="span" startIcon={<ArrowBackIcon />} variant="outlined">
            Vissza az adminhoz
          </Button>
        </RouterLink>
      </Stack>

      <Alert severity="info">
        Ez most az elso skeleton lepes. A page mar navigalhato, de a builder UI meg nincs
        bekotve.
      </Alert>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ConstructionIcon color="action" />
            <Typography variant="h6">Kovetkezo szeletek</Typography>
          </Stack>

          <Typography color="text.secondary">
            A kovetkezo review-barat lepesekben ide kerul majd a topic metadata editor, a field
            lista, a field editor es a validation panel.
          </Typography>

          {topic ? (
            <Box>
              <Typography variant="subtitle2">Betoltott topic</Typography>
              <Typography color="text.secondary">
                {topic.label} ({topic.id})
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Card>
    </Box>
  );
};

export default TopicSchemaBuilderPage;
