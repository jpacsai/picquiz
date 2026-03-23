import { Button, Stack, Typography } from '@mui/material';

type QuizAnsweredProps = {
  autoAdvanceAfterAnswer: boolean;
  autoAdvanceCountdownSeconds: number;
  currentQuestionIndex: number;
  questionsLength: number;
  onContinue: () => void;
};

const QuizAnswered = ({
  autoAdvanceAfterAnswer,
  autoAdvanceCountdownSeconds,
  currentQuestionIndex,
  questionsLength,
  onContinue,
}: QuizAnsweredProps) => {
  return (
    <Stack spacing={2}>
      {autoAdvanceAfterAnswer ? (
        <Typography color="text.secondary">
          {currentQuestionIndex === questionsLength - 1
            ? `Eredmény megjelenítése ${autoAdvanceCountdownSeconds} másodperc múlva.`
            : `Következő kérdés ${autoAdvanceCountdownSeconds} másodperc múlva.`}
        </Typography>
      ) : (
        <Button onClick={onContinue} variant="contained">
          {currentQuestionIndex === questionsLength - 1
            ? 'Eredmény megtekintése'
            : 'Következő kérdés'}
        </Button>
      )}
    </Stack>
  );
};

export default QuizAnswered;
