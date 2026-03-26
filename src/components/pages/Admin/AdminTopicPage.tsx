import { RouterLink } from '@components/ui/RouterLink';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { Box, Button, Card, Stack, Typography } from '@mui/material';

import type { Topic } from '@/types/topics';

type AdminTopicPageProps = {
  itemCount: number;
  topic: Topic;
};

const AdminTopicPage = ({ itemCount, topic }: AdminTopicPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3, maxWidth: 900 }}>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography variant="h4">{topic.label}</Typography>
        <Typography color="text.secondary">
          Válaszd ki, hogy az itemeket kezelnéd, vagy a topic sémáját szerkesztenéd.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card
          variant="outlined"
          sx={{
            display: 'grid',
            flex: 1,
            gap: 2,
            p: 3,
          }}
        >
          <Box sx={{ display: 'grid', gap: 1 }}>
            <CollectionsBookmarkIcon color="primary" />
            <Typography variant="h6">Itemek</Typography>
            <Typography color="text.secondary">
              {itemCount} feltöltött elem tartozik ehhez a topichoz.
            </Typography>
          </Box>

          <RouterLink
            params={{ topicId: topic.id }}
            search={{ saved: undefined }}
            to="/admin/$topicId/items"
            underline="none"
            preload="intent"
          >
            <Button component="span" fullWidth variant="contained">
              Itemek kezelése
            </Button>
          </RouterLink>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: 'grid',
            flex: 1,
            gap: 2,
            p: 3,
          }}
        >
          <Box sx={{ display: 'grid', gap: 1 }}>
            <AutoStoriesIcon color="primary" />
            <Typography variant="h6">Séma</Typography>
            <Typography color="text.secondary">
              Mezők, validációk és quiz-beállítások szerkesztése.
            </Typography>
          </Box>

          <RouterLink
            params={{ topicId: topic.id }}
            to="/admin/$topicId/schema"
            underline="none"
            preload="intent"
          >
            <Button component="span" fullWidth variant="outlined">
              Séma szerkesztése
            </Button>
          </RouterLink>
        </Card>
      </Stack>
    </Box>
  );
};

export default AdminTopicPage;
