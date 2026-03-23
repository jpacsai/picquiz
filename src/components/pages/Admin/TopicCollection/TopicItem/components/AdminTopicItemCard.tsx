import type { TopicField, TopicItem } from '@/types/topics';

import AdminTopicItemCardView from './AdminTopicItemCardView';
import { useAdminTopicItem } from './useAdminTopicItem';

type AdminTopicItemCardProps = {
  collectionName: string;
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
};

const AdminTopicItemCard = ({ collectionName, fields, item, topicId }: AdminTopicItemCardProps) => {
  const viewModel = useAdminTopicItem({
    collectionName,
    fields,
    item,
    topicId,
  });

  return <AdminTopicItemCardView {...viewModel} />;
};

export default AdminTopicItemCard;
