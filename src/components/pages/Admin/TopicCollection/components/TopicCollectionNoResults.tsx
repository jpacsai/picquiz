import { Box, Typography } from '@mui/material';

const TopicCollectionNoResults = ({ query }: { query: string }) => (
  <Box
    sx={{
      border: (theme) => `1px dashed ${theme.palette.divider}`,
      borderRadius: 2,
      p: 3,
    }}
  >
    <Typography variant="body1">
      Nincs találat a kiválasztott mezőben erre: <strong>{query}</strong>
    </Typography>
  </Box>
);

export default TopicCollectionNoResults;
