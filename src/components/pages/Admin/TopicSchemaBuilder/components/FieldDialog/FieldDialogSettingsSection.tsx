import { Box, Checkbox, FormControlLabel } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogSettingsSectionProps = {
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
};

const FieldDialogSettingsSection = ({
  field,
  onChange,
}: FieldDialogSettingsSectionProps) => {
  if (field.type === 'imageUpload') {
    return null;
  }

  return (
    <Box sx={{ mt: 0.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(field.required)}
            onChange={(event) => {
              const nextValue = event.target.checked;

              onChange((currentField) => ({
                ...currentField,
                required: nextValue,
              }));
            }}
          />
        }
        label="Required"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(field.readonly)}
            onChange={(event) => {
              const nextValue = event.target.checked;

              onChange((currentField) => ({
                ...currentField,
                readonly: nextValue,
              }));
            }}
          />
        }
        label="Readonly"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(field.hideInEdit)}
            onChange={(event) => {
              const nextValue = event.target.checked;

              onChange((currentField) => ({
                ...currentField,
                hideInEdit: nextValue,
              }));
            }}
          />
        }
        label="Hide in edit"
      />

    </Box>
  );
};

export default FieldDialogSettingsSection;
