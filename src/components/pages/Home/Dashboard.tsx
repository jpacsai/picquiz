import Box from '@mui/material/Box';

import TopicCard from '@/components/pages/Home/components/TopicCard';
import type { Topic } from '@/types/topics';

type DashboardProps = {
  topics: ReadonlyArray<Topic>;
};

const Dashboard = ({ topics }: DashboardProps) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </Box>
  );
};

export default Dashboard;
