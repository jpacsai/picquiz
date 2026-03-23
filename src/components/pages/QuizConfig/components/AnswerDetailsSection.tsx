import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

import type { QuizValueField } from '@/types/quiz';

type AnswerDetailsSectionProps = {
  answerDetailsEnabled: boolean;
  answerDetailFields: QuizValueField[];
  answerDetailFieldKeys: string[];
  onToggleAnswerDetailField: (fieldKey: string, enabled: boolean) => void;
};

const AnswerDetailsSection = ({
  answerDetailsEnabled,
  answerDetailFields,
  answerDetailFieldKeys,
  onToggleAnswerDetailField,
}: AnswerDetailsSectionProps) => {
  return answerDetailsEnabled ? (
    <>
      <Typography variant="subtitle1">Helyes válasz extra adatai</Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {answerDetailFields.map((field: QuizValueField) => {
          const fieldKey: string = field.key;
          const isChecked = answerDetailFieldKeys.includes(fieldKey);

          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(_, checked) => {
                    onToggleAnswerDetailField(fieldKey, checked);
                  }}
                />
              }
              key={fieldKey}
              label={field.label}
              sx={{ mr: 0 }}
            />
          );
        })}
      </Box>
    </>
  ) : null;
};

export default AnswerDetailsSection;
