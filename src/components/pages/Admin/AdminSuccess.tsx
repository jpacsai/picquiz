import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

type AdminSuccessProps = {
  topicId: string;
  topicLabel: string;
};

const AdminSuccess = ({ topicId, topicLabel }: AdminSuccessProps) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        maxWidth: 560,
      }}
    >
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography color="text.secondary" variant="body1">
          A(z) {topicLabel} elem sikeresen elmentődött.
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Szeretnél feltölteni még egy képet?
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => {
            void navigate({ to: '/admin/$topicId/new', params: { topicId } });
          }}
        >
          Igen, feltöltök még egyet
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            void navigate({ to: '/admin/$topicId', params: { topicId } });
          }}
        >
          Vissza a collectionhöz
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSuccess;
