import { Box, Card } from '@mui/material';

import type { Topic } from '../../../types/topics';
import { RouterLink } from '@components/ui/RouterLink';

type AdminProps = {
  topics: ReadonlyArray<Topic>;
};

const Admin = ({ topics }: AdminProps) => {
  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      {topics.map((topic) => (
        <RouterLink
          key={topic.id}
          params={{ topicId: topic.id }}
          search={{ saved: undefined }}
          to="/admin/$topicId"
          underline="none"
          preload="intent"
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            transition: 'color 150ms ease',
          }}
        >
          <Card>{topic.label}</Card>
        </RouterLink>
      ))}
    </Box>
  );
};

export default Admin;
