import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { topicItemsOptions } from '@queries/items';
import type { TopicItem } from '@service/items';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import AdminTopicItem from '@/components/pages/Admin/TopicCollection/TopicItem/components/AdminTopicItem';
import type { Topic } from '@/types/topics';

type AdminTopicCollectionPageProps = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

const AdminTopicCollectionPage = ({ items, saved, topic }: AdminTopicCollectionPageProps) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: liveItems = items } = useQuery({
    ...topicItemsOptions(topic.slug),
    initialData: items,
  });

  useEffect(() => {
    if (saved !== 'edited') {
      return;
    }

    enqueueSnackbar('Az elem módosításai elmentve.', { variant: 'success' });

    void navigate({
      replace: true,
      search: { saved: undefined },
      to: '/admin/$topicId',
      params: { topicId: topic.id },
    });
  }, [enqueueSnackbar, navigate, saved, topic.id]);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => {
            void navigate({
              to: '/admin/$topicId/new',
              params: { topicId: topic.id },
            });
          }}
        >
          Új item feltöltése
        </Button>
      </Box>

      {liveItems.length ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {liveItems.map((item) => (
            <AdminTopicItem
              collectionName={topic.slug}
              fields={topic.fields}
              item={item}
              key={item.id}
              topicId={topic.id}
            />
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="body1">
              Ebben a collectionben még nincs feltöltött item.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminTopicCollectionPage;
