import { Box } from '@mui/material';
import type { Topic } from '../../../types/topics';
import Fields from './Form/Form';

type AdminTopicProps = { topic: Topic };

const AdminTopic = ({ topic }: AdminTopicProps) => {
  return (
    <Box>
      <Fields fields={topic.fields} />
    </Box>
  );
};

export default AdminTopic;
