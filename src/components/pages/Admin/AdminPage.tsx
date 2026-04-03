import { RouterLink } from '@components/ui/RouterLink';
import LaunchIcon from '@mui/icons-material/Launch';
import SchemaIcon from '@mui/icons-material/Schema';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import CreateSchemaDialog from '@/components/pages/Admin/CreateSchemaDialog';

import type { Topic } from '../../../types/topics';

type AdminPageProps = {
  defaultSchemaCreationMode: 'create' | 'duplicate';
  duplicateSourceTopicId?: string;
  isCreateSchemaDialogOpen: boolean;
  topics: ReadonlyArray<Topic>;
};

const AdminPage = ({
  defaultSchemaCreationMode,
  duplicateSourceTopicId,
  isCreateSchemaDialogOpen,
  topics,
}: AdminPageProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<SchemaIcon />}
          variant="contained"
          onClick={() =>
            navigate({
              to: '/schemas/new',
            })
          }
        >
          Új séma
        </Button>
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
              to="/$topicId"
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

      <CreateSchemaDialog
        duplicateSourceTopicId={duplicateSourceTopicId}
        initialMode={defaultSchemaCreationMode}
        open={isCreateSchemaDialogOpen}
        onClose={() =>
          navigate({
            to: '/home',
          })
        }
        topics={topics}
      />
    </Box>
  );
};

export default AdminPage;
