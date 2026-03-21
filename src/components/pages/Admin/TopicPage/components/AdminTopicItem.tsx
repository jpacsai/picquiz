import type { TopicItem } from '@/service/items';
import type { TopicField } from '@/types/topics';

import AdminTopicItemView from './AdminTopicItemView';
import { useAdminTopicItem } from './useAdminTopicItem';

type AdminTopicItemProps = {
  collectionName: string;
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
};

const AdminTopicItem = ({ collectionName, fields, item, topicId }: AdminTopicItemProps) => {
  const viewModel = useAdminTopicItem({
    collectionName,
    fields,
    item,
    topicId,
  });

  return <AdminTopicItemView {...viewModel} />;
};

export default AdminTopicItem;
