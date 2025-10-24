import Box from '@mui/material/Box';
import type { Topic } from '../../types/topics';
import { Card, CardContent } from '@mui/material';
import { RouterLink } from '../ui/RouterLink';

type DashboardProps = {
  topics: Topic[];
};

const Dashboard = ({ topics }: DashboardProps) => {
  return (
    <Box>
      {topics.map((topic) => {
        return (
          <Card key={topic.id}>
            <CardContent>
              <RouterLink></RouterLink>
              <RouterLink
                to={`/${topic.id}`}
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
                {topic.id}
              </RouterLink>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default Dashboard;
