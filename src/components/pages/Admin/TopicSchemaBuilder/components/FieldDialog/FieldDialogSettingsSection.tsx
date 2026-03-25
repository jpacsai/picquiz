import { Box, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';

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
      <TextField
        select
        label="Card display"
        value={field.display ?? ''}
        onChange={(event) => {
          const nextValue = event.target.value as NonNullable<TopicFieldDraft['display']> | '';

          onChange((currentField) => ({
            ...currentField,
            display: nextValue === '' ? undefined : nextValue,
          }));
        }}
        fullWidth
        margin="normal"
        helperText="Beallitja, hogy ez a mezo hol jelenjen meg az admin lista item kartyan."
      >
        <MenuItem value="">No special display</MenuItem>
        <MenuItem value="title">Title</MenuItem>
        <MenuItem value="subtitle">Subtitle</MenuItem>
        <MenuItem value="meta">Meta</MenuItem>
      </TextField>

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

      {field.type === 'string' ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(field.autocomplete)}
              onChange={(event) => {
                const nextValue = event.target.checked;

                onChange((currentField) => ({
                  ...currentField,
                  autocomplete: nextValue,
                }));
              }}
            />
          }
          label="Autocomplete"
        />
      ) : null}

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
