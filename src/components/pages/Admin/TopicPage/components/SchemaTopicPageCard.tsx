import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { Button } from '@mui/material';

import TopicPageCard from '@/components/pages/Admin/TopicPage/components/TopicPageCard';
import { RouterLink } from '@/components/ui/RouterLink';

type SchemaTopicPageCardProps = {
  topicId: string;
};

const SchemaTopicPageCard = ({ topicId }: SchemaTopicPageCardProps) => {
  return (
    <TopicPageCard
      icon={<AutoStoriesIcon color="primary" />}
      title="Séma"
      subtitle="Mezők, validációk és quiz-beállítások szerkesztése."
    >
      <RouterLink
        params={{ topicId }}
        to="/admin/$topicId/schema"
        underline="none"
        preload="intent"
      >
        <Button component="span" fullWidth variant="outlined">
          Séma szerkesztése
        </Button>
      </RouterLink>
    </TopicPageCard>
  );
};

export default SchemaTopicPageCard;
