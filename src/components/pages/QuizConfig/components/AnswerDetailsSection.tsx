import { Checkbox, FormControlLabel, Typography } from '@mui/material';

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
          />
        );
      })}
    </>
  ) : null;
};

export default AnswerDetailsSection;
