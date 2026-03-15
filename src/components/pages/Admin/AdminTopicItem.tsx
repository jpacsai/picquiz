import type { TopicItem } from '@/service/items';
import { Card, CardContent, Typography } from '@mui/material';

type AdminTopicItemProps = {
  item: TopicItem;
};

const AdminTopicItem = ({ item }: AdminTopicItemProps) => {
  const getItemTitle = () => {
    if (typeof item.title === 'string' && item.title.trim().length > 0) {
      return item.title;
    }

    if (typeof item.artist === 'string' && item.artist.trim().length > 0) {
      return item.artist;
    }

    return item.id;
  };

  const getItemSubtitle = () => {
    const parts = [item.artist, item.year]
      .filter(
        (value): value is string | number => typeof value === 'string' || typeof value === 'number',
      )
      .map(String)
      .filter((value) => value.trim().length > 0);

    return parts.join(' - ');
  };

  return (
    <Card key={item.id}>
      <CardContent sx={{ display: 'grid', gap: 0.5 }}>
        <Typography variant="h6">{getItemTitle()}</Typography>
        {getItemSubtitle() ? (
          <Typography color="text.secondary" variant="body2">
            {getItemSubtitle()}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AdminTopicItem;
