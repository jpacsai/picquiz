import { Box, Card } from '@mui/material';
import type { Topic } from '../../../types/topics';
import { NavLink } from '../../ui/NavLink';

type AdminProps = {
  topics: Topic[];
};

const Admin = ({ topics }: AdminProps) => {
  return (
    <Box sx={{ display: 'grid', gap: '20px' }}>
      {topics.map((topic, index) => (
        <NavLink to={`/admin/${topic.id}`}>
          <Card key={index}>{topic.label}</Card>
        </NavLink>
      ))}
    </Box>
  );
};

export default Admin;
