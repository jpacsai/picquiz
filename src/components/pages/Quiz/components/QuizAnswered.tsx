import { Box, Button, Stack, Typography } from '@mui/material';

import type { QuizAnswerDetail } from '@/types/quiz';

type QuizAnsweredProps = {
  autoAdvanceAfterAnswer: boolean;
  autoAdvanceCountdownSeconds: number;
  answerDetails: QuizAnswerDetail[];
  currentQuestionIndex: number;
  questionsLength: number;
  showAnswerDetails: boolean;
  onContinue: () => void;
};

const QuizAnswered = ({
  autoAdvanceAfterAnswer,
  autoAdvanceCountdownSeconds,
  answerDetails,
  currentQuestionIndex,
  questionsLength,
  showAnswerDetails,
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

      {showAnswerDetails && answerDetails.length ? (
        <Stack spacing={0.5}>
          {answerDetails.map((detail) => (
            <Typography color="text.secondary" variant="subtitle1" key={detail.key}>
              {/* {detail.label} -  */}
              <Box component="strong">{detail.value}</Box>
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default QuizAnswered;
