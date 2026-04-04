import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from '@tanstack/react-router';

import type { Topic } from '@/types/topics';

type TopicPageProps = {
  topic: Topic;
};

const TopicPage = ({ topic }: TopicPageProps) => {
  const navigate = useNavigate();

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          onClick={() => {
            void navigate({
              to: '/$topicId/quiz-config',
              params: { topicId: topic.id },
            });
          }}
          size="large"
          variant="contained"
        >
          Kvíz indítása
        </Button>

        <Button disabled size="large" variant="outlined">
          Eredmények
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          onClick={() => {
            void navigate({
              to: '/$topicId/items',
              params: { topicId: topic.id },
              search: { saved: undefined },
            });
          }}
          size="large"
          variant="outlined"
        >
          Elemek
        </Button>

        <Button
          onClick={() => {
            void navigate({
              to: '/$topicId/schema',
              params: { topicId: topic.id },
            });
          }}
          size="large"
          variant="outlined"
        >
          Séma
        </Button>
      </Stack>
    </Stack>
  );
};

export default TopicPage;
