import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { useState } from 'react';

import CreateSchemaDialog from '@/components/pages/Admin/CreateSchemaDialog';
import TopicCard from '@/components/pages/Home/components/TopicCard';
import type { Topic } from '@/types/topics';

type DashboardProps = {
  topics: ReadonlyArray<Topic>;
};

const Dashboard = ({ topics }: DashboardProps) => {
  const [isCreateSchemaDialogOpen, setIsCreateSchemaDialogOpen] = useState<boolean>(false);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setIsCreateSchemaDialogOpen(true)}
        >
          Új topic
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </Box>

      <CreateSchemaDialog
        initialMode="create"
        onClose={() => setIsCreateSchemaDialogOpen(false)}
        open={isCreateSchemaDialogOpen}
        topics={topics}
      />
    </Box>
  );
};

export default Dashboard;
