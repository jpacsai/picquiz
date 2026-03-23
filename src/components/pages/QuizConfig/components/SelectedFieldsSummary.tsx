import { Stack, Typography } from '@mui/material';

import type { QuizEligibleField } from '@/types/quiz';

type SelectedFieldsSummaryProps = {
  selectedFields: QuizEligibleField[];
};

const SelectedFieldsSummary = ({ selectedFields }: SelectedFieldsSummaryProps) => {
  return selectedFields.length ? (
    <Stack spacing={1}>
      {selectedFields.map((selectedField) => (
        <Typography color="text.secondary" key={selectedField.field.key}>
          {selectedField.field.label}: {selectedField.eligibleItemCount} használható item,{' '}
          {selectedField.distinctValueCount} különböző válaszlehetőség.
        </Typography>
      ))}
    </Stack>
  ) : null;
};

export default SelectedFieldsSummary;
