import { RouterLink } from '@components/ui/RouterLink';
import { Box, Button, Card, Stack, Typography } from '@mui/material';

import type { Topic } from '../../../types/topics';

type AdminPageProps = {
  topics: ReadonlyArray<Topic>;
};

const AdminPage = ({ topics }: AdminPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5">Topic admin</Typography>

        <RouterLink to="/admin/topics/new" underline="none" preload="intent">
          <Button component="span" variant="contained">
            Uj topic schema
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <RouterLink
                params={{ topicId: topic.id }}
                search={{ saved: undefined }}
                to="/admin/$topicId"
                underline="none"
                preload="intent"
              >
                <Button component="span" variant="outlined">
                  Itemek
                </Button>
              </RouterLink>

              <RouterLink
                params={{ topicId: topic.id }}
                to="/admin/topics/$topicId/edit"
                underline="none"
                preload="intent"
              >
                <Button component="span" variant="contained">
                  Schema szerkesztes
                </Button>
              </RouterLink>

              <RouterLink
                params={{ topicId: topic.id }}
                to="/admin/topics/$topicId/duplicate"
                underline="none"
                preload="intent"
              >
                <Button component="span" variant="outlined">
                  Schema duplikalasa
                </Button>
              </RouterLink>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};

export default AdminPage;
