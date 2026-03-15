import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

import type { Topic } from '@/types/topics';
import type { TopicItem } from '@service/items';

type AdminTopicCollectionProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const getItemTitle = (item: TopicItem) => {
  if (typeof item.title === 'string' && item.title.trim().length > 0) {
    return item.title;
  }

  if (typeof item.artist === 'string' && item.artist.trim().length > 0) {
    return item.artist;
  }

  return item.id;
};

const getItemSubtitle = (item: TopicItem) => {
  const parts = [item.artist, item.year]
    .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
    .map(String)
    .filter((value) => value.trim().length > 0);

  return parts.join(' - ');
};

const AdminTopicCollection = ({ items, topic }: AdminTopicCollectionProps) => {
  const navigate = useNavigate();

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

      {items.length ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent sx={{ display: 'grid', gap: 0.5 }}>
                <Typography variant="h6">{getItemTitle(item)}</Typography>
                {getItemSubtitle(item) ? (
                  <Typography color="text.secondary" variant="body2">
                    {getItemSubtitle(item)}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
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

export default AdminTopicCollection;
