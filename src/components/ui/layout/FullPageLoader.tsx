import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type FullPageLoaderProps = {
  label?: string;
  open: boolean;
  testId?: string;
};

const FullPageLoader = ({
  label = 'Betöltés folyamatban...',
  open,
  testId = 'full-page-loader',
}: FullPageLoaderProps) => {
  return (
    <Backdrop
      open={open}
      sx={(theme) => ({
        position: 'absolute',
        zIndex: theme.zIndex.modal + 1,
        color: theme.palette.common.white,
        borderRadius: 1,
      })}
      data-testid={testId}
    >
      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2, textAlign: 'center', px: 3 }}>
        <CircularProgress color="inherit" size={40} />
        <Typography variant="body1">{label}</Typography>
      </Box>
    </Backdrop>
  );
};

export default FullPageLoader;
