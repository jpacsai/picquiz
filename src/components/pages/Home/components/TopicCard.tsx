import { Card, CardActionArea, CardContent } from '@mui/material';

import { RouterLink } from '@/components/ui/RouterLink';
import type { Topic } from '@/types/topics';

type TopicCardProps = {
  topic: Topic;
};

const TopicCard = ({ topic }: TopicCardProps) => {
  return (
    <RouterLink
      to="/$topicId"
      params={{ topicId: topic.id }}
      activeOptions={{ exact: true }}
      underline="none"
      preload="intent"
      sx={{
        display: 'block',
        width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
        color: 'text.primary',
        '&[data-status="active"] .MuiCard-root': {
          bgcolor: 'action.selected',
          fontWeight: 700,
        },
      }}
      data-testid={`topic-card-${topic.id}`}
    >
      <Card sx={{ padding: 0 }}>
        <CardActionArea sx={{ padding: 2 }}>
          <CardContent>{topic.label}</CardContent>
        </CardActionArea>
      </Card>
    </RouterLink>
  );
};

export default TopicCard;
