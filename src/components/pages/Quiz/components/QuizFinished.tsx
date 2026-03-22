import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

type QuizFinishedProps = {
  score: number;
  questionsLength: number;
  onRestart: () => void;
  onReturnToConfig: () => void;
};

const QuizFinished = ({
  score,
  questionsLength,
  onRestart,
  onReturnToConfig,
}: QuizFinishedProps) => {
  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Kvíz vége</Typography>
            <Typography color="text.secondary">
              {score} / {questionsLength} helyes válasz.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <Button onClick={() => onReturnToConfig()} variant="outlined">
                Vissza a beállításokhoz
              </Button>
              <Button onClick={() => onRestart()} variant="contained">
                Újraindítás
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizFinished;
