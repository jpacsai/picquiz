import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { Button } from '@mui/material';

import TopicPageCard from '@/components/pages/Admin/TopicPage/components/TopicPageCard';
import { RouterLink } from '@/components/ui/RouterLink';

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
      <RouterLink
        params={{ topicId }}
        search={{ saved: undefined }}
        to="/admin/$topicId/items"
        underline="none"
        preload="intent"
      >
        <Button component="span" fullWidth variant="contained">
          Itemek kezelése
        </Button>
      </RouterLink>
    </TopicPageCard>
  );
};

export default ItemTopicPageCard;
