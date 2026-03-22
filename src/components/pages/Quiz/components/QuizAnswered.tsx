import { Button, Stack, Typography } from '@mui/material';

type QuizAnsweredProps = {
  isCorrect: boolean;
  showCorrectAnswer: boolean;
  correctAnswer: string;
  autoAdvanceAfterAnswer: boolean;
  currentQuestionIndex: number;
  questionsLength: number;
  onContinue: () => void;
};

const QuizAnswered = ({
  isCorrect,
  showCorrectAnswer,
  correctAnswer,
  autoAdvanceAfterAnswer,
  currentQuestionIndex,
  questionsLength,
  onContinue,
}: QuizAnsweredProps) => {
  return (
    <Stack spacing={2}>
      <Typography color={isCorrect ? 'success.main' : 'error.main'}>
        {isCorrect
          ? 'Helyes válasz.'
          : showCorrectAnswer
            ? `Nem ez a helyes válasz. A megoldás: ${correctAnswer}.`
            : 'Nem ez a helyes válasz.'}
      </Typography>
      {autoAdvanceAfterAnswer ? (
        <Typography color="text.secondary">
          {currentQuestionIndex === questionsLength - 1
            ? 'Eredmény megjelenítése 5 másodperc múlva.'
            : 'Következő kérdés 5 másodperc múlva.'}
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
