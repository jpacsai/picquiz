import { Box, Card } from '@mui/material';
import type { Topic } from '../../types/topics';

type AdminProps = {
  topics: Topic[];
};

const Admin = ({ topics }: AdminProps) => {
  return (
    <Box>
      <Box>
        {topics.map((topic, index) => (
          <Card key={index}>{topic.label}</Card>
        ))}
      </Box>
    </Box>
  );
};

export default Admin;
