import { Card, CardContent } from '@mui/material';
import Box from '@mui/material/Box';

import type { Topic } from '../../types/topics';
import { RouterLink } from '../ui/RouterLink';

type DashboardProps = {
  topics: ReadonlyArray<Topic>;
};

const Dashboard = ({ topics }: DashboardProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {topics.map((topic) => {
        return (
          <Card key={topic.id}>
            <CardContent>
              <RouterLink
                to="/$topicId"
                params={{ topicId: topic.id }}
                activeOptions={{ exact: true }}
                underline="none"
                preload="intent"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  color: 'text.primary',
                  '&[data-status="active"]': {
                    fontWeight: 700,
                    bgcolor: 'action.selected',
                  },
                }}
              >
                {topic.label}
              </RouterLink>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default Dashboard;
