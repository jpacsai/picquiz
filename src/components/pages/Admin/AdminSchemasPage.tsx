import { RouterLink } from '@components/ui/RouterLink';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import { Box, Button, Card, Stack, Typography } from '@mui/material';

import type { Topic } from '@/types/topics';

type AdminSchemasPageProps = {
  topics: ReadonlyArray<Topic>;
};

const AdminSchemasPage = ({ topics }: AdminSchemasPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography variant="h4">Sémák</Typography>
          <Typography color="text.secondary">
            Itt találod az összes meglévő topic sémát, és innen tudsz újat létrehozni vagy
            duplikálni.
          </Typography>
        </Box>

        <RouterLink to="/admin/schemas/new" underline="none" preload="intent">
          <Button component="span" startIcon={<AddIcon />} variant="contained">
            Új séma
          </Button>
        </RouterLink>
      </Box>

      <Stack spacing={2}>
        {topics.map((topic) => (
          <Card key={topic.id} variant="outlined" sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Box sx={{ display: 'grid', gap: 0.5 }}>
                <Typography variant="h6">{topic.label}</Typography>
                <Typography color="text.secondary" variant="body2">
                  ID: {topic.id}
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <RouterLink
                  params={{ topicId: topic.id }}
                  to="/admin/$topicId"
                  underline="none"
                  preload="intent"
                >
                  <Button component="span" startIcon={<LaunchIcon />} variant="outlined">
                    Topic admin
                  </Button>
                </RouterLink>

                <RouterLink
                  params={{ topicId: topic.id }}
                  to="/admin/$topicId/schema"
                  underline="none"
                  preload="intent"
                >
                  <Button component="span" startIcon={<EditIcon />} variant="contained">
                    Szerkesztés
                  </Button>
                </RouterLink>

                <RouterLink
                  params={{ topicId: topic.id }}
                  to="/admin/schemas/$topicId/duplicate"
                  underline="none"
                  preload="intent"
                >
                  <Button component="span" startIcon={<ContentCopyIcon />} variant="outlined">
                    Duplikálás
                  </Button>
                </RouterLink>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminSchemasPage;
