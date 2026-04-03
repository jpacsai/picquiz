import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import TopicPageCard from '@/components/pages/Admin/TopicPage/components/TopicPageCard';
import TopicPageCardAction from '@/components/pages/Admin/TopicPage/components/TopicPageCardAction';

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
      <TopicPageCardAction
        label="Séma szerkesztése"
        params={{ topicId }}
        to="/$topicId/schema"
        variant="outlined"
      />
    </TopicPageCard>
  );
};

export default SchemaTopicPageCard;
