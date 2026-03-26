import { RouterLink } from '@components/ui/RouterLink';
import LaunchIcon from '@mui/icons-material/Launch';
import SchemaIcon from '@mui/icons-material/Schema';
import { Box, Button, Card, Stack, Typography } from '@mui/material';

import type { Topic } from '../../../types/topics';

type AdminPageProps = {
  topics: ReadonlyArray<Topic>;
};

const AdminPage = ({ topics }: AdminPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography variant="h5">Topic admin</Typography>
          <Typography color="text.secondary" variant="body2">
            Válassz topikot, vagy menj a külön sémalistára.
          </Typography>
        </Box>

        <RouterLink to="/admin/schemas" underline="none" preload="intent">
          <Button component="span" startIcon={<SchemaIcon />} variant="contained">
            Sémák kezelése
          </Button>
        </RouterLink>
      </Box>

      {topics.map((topic) => (
        <Card key={topic.id} sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="h6">{topic.label}</Typography>

            <RouterLink
              params={{ topicId: topic.id }}
              to="/admin/$topicId"
              underline="none"
              preload="intent"
            >
              <Button component="span" endIcon={<LaunchIcon />} variant="outlined">
                Megnyitás
              </Button>
            </RouterLink>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};

export default AdminPage;
