import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

type QuizHeaderProps = {
  questionLength: number;
  currentQuestionIndex: number;
  prompt: string;
};

const QuizHeader = ({ questionLength, currentQuestionIndex, prompt }: QuizHeaderProps) => {
  return (
    <Card sx={{ width: '100%' }} variant="outlined">
      <CardContent sx={{ position: 'relative' }}>
        <Stack spacing={2}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
            <Typography>
              {questionLength} / {currentQuestionIndex + 1}
            </Typography>
          </Box>

          <Typography variant="h5" color="text.secondary">
            {prompt}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuizHeader;
