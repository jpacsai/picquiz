import { TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogSelectOptionsSectionProps = {
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  onOptionsInputChange: (value: string) => void;
  pathPrefix: string;
  selectOptionsInputValue: string;
};

const FieldDialogSelectOptionsSection = ({
  errorsByPath,
  field,
  onChange,
  onOptionsInputChange,
  pathPrefix,
  selectOptionsInputValue,
}: FieldDialogSelectOptionsSectionProps) => {
  if (field.type !== 'select') {
    return null;
  }

  return (
    <TextField
      label="Select opciok"
      value={selectOptionsInputValue}
      error={errorsByPath.has(`${pathPrefix}.options`)}
      helperText={
        errorsByPath.get(`${pathPrefix}.options`) ?? 'Vesszovel elvalasztva add meg az opciokat.'
      }
      onChange={(event) => {
        const nextValue = event.target.value;
        onOptionsInputChange(nextValue);

        onChange((currentField) => ({
          ...currentField,
          options: nextValue
            .split(',')
            .map((option) => option.trim())
            .filter(Boolean)
            .sort((left, right) => left.localeCompare(right, 'hu', { sensitivity: 'base' })),
        }));
      }}
      fullWidth
      margin="dense"
      sx={{ mt: 0, mb: 0.25 }}
    />
  );
};

export default FieldDialogSelectOptionsSection;
