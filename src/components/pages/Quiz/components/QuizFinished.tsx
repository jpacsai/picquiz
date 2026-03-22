import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import ReturnToConfigButton from '@/components/pages/Quiz/components/ReturnToConfigButton';

type QuizFinishedProps = {
  score: number;
  questionsLength: number;
  onRestart: () => void;
  topicId: string;
};

const QuizFinished = ({ score, questionsLength, onRestart, topicId }: QuizFinishedProps) => {
  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5">Kvíz vége</Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                margin: 4,
              }}
            >
              <Typography variant="h2" color="text.secondary">
                {score} / {questionsLength} helyes válasz.
              </Typography>

              <Typography variant="h4" color="text.secondary">
                {Math.round((score / questionsLength) * 100)} %
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <ReturnToConfigButton topicId={topicId} />

              <Button onClick={() => onRestart()} variant="contained">
                Újraindítás
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizFinished;
