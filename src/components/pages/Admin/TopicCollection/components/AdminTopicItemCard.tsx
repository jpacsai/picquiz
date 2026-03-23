import AdminTopicItemCardView from '@/components/pages/Admin/TopicCollection/components/AdminTopicItemCardView';
import { useAdminTopicItem } from '@/components/pages/Admin/TopicCollection/components/useAdminTopicItem';
import type { TopicField, TopicItem } from '@/types/topics';

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
