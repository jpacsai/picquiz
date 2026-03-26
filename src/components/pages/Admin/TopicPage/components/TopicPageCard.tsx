import { Box, Card, Typography } from '@mui/material';

type TopicPageCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const TopicPageCard = ({ icon, title, subtitle, children }: TopicPageCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        p: 3,
      }}
    >
      <Box sx={{ display: 'grid', gap: 1 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>

      <Box>{children}</Box>
    </Card>
  );
};

export default TopicPageCard;
