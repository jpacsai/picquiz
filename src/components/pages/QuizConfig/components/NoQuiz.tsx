import { Stack, Typography } from '@mui/material';

import type { QuizEligibleField } from '@/types/quiz';

type NoQuizProps = {
  eligibleFields: QuizEligibleField[];
};

const NoQuiz = ({ eligibleFields }: NoQuizProps) => {
  return (
    <Stack spacing={1.5}>
      <Typography color="text.secondary">
        Ehhez a topikhoz jelenleg nincs indítható quiz beállítás.
      </Typography>

      {eligibleFields.length ? (
        eligibleFields.map(({ distinctValueCount, eligibleItemCount, field }) => (
          <Typography color="text.secondary" key={field.key}>
            {field.label}: {eligibleItemCount} használható item, {distinctValueCount} különböző
            válasz.
          </Typography>
        ))
      ) : (
        <Typography color="text.secondary">
          Ehhez a topikhoz még nincs quizre engedélyezett mező beállítva.
        </Typography>
      )}
    </Stack>
  );
};

export default NoQuiz;
