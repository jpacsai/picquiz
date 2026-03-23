import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

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

      {startableFields.map(({ field, promptsLabel }) => {
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
            label={`${field.label} - ${promptsLabel}`}
          />
        );
      })}
    </Stack>
  );
};

export default QuestionFieldsInput;
