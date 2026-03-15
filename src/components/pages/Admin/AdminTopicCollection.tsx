import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

import type { Topic } from '@/types/topics';
import type { TopicItem } from '@service/items';
import AdminTopicItem from '@/components/pages/Admin/AdminTopicItem';

type AdminTopicCollectionProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {items.map((item) => (
            <AdminTopicItem item={item} />
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
