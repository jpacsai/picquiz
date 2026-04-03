import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';

import TopicPageCard from '@/components/pages/Admin/TopicPage/components/TopicPageCard';
import TopicPageCardAction from '@/components/pages/Admin/TopicPage/components/TopicPageCardAction';

type ItemTopicPageCardProps = {
  itemCount: number;
  topicId: string;
};

const ItemTopicPageCard = ({ itemCount, topicId }: ItemTopicPageCardProps) => {
  return (
    <TopicPageCard
      icon={<CollectionsBookmarkIcon color="primary" />}
      title="Itemek"
      subtitle={`${itemCount} elem`}
    >
      <TopicPageCardAction
        label="Itemek kezelése"
        params={{ topicId }}
        search={{ saved: undefined }}
        to="/$topicId/items"
        variant="contained"
      />
    </TopicPageCard>
  );
};

export default ItemTopicPageCard;
