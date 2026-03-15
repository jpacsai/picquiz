import { Box } from '@mui/material';

import type { Topic } from '../../../types/topics';
import Form from './Form/Form';

type AdminTopicProps = { topic: Topic };

const AdminTopic = ({ topic }: AdminTopicProps) => {
  return (
    <Box>
      <Form
        collectionName={topic.slug}
        fields={topic.fields}
        storagePrefix={topic.storage_prefix}
        topicId={topic.id}
      />
    </Box>
  );
};

export default AdminTopic;
