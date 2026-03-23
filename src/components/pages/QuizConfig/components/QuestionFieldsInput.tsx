import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

import type { QuizEligibleField } from '@/types/quiz';

type QuestionFieldsInputProps = {
  startableFields: QuizEligibleField[];
  effectiveSelectedFieldKeys: string[];
  onToggleField: (fieldKey: string, checked: boolean) => void;
};

const QuestionFieldsInput = ({
  startableFields,
  effectiveSelectedFieldKeys,
  onToggleField,
}: QuestionFieldsInputProps) => {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Kérdezett mezők</Typography>

      {startableFields.map(({ distinctValueCount, eligibleItemCount, field, promptsLabel }) => {
        const isChecked = effectiveSelectedFieldKeys.includes(field.key);

        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={(_, checked) => {
                  onToggleField(field.key, checked);
                }}
              />
            }
            key={field.key}
            label={
              <Box component="span">
                <Box component="strong" sx={{ fontSize: '1.05rem' }}>
                  {field.label}
                </Box>{' '}
                - {promptsLabel} - {eligibleItemCount} elem, {distinctValueCount} különböző
                válaszlehetőség
              </Box>
            }
          />
        );
      })}
    </Stack>
  );
};

export default QuestionFieldsInput;
