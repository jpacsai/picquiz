import { Checkbox, FormControlLabel, TextField } from '@mui/material';

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
    <>
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

      {field.type === 'year' ? (
        <>
          <TextField
            label="Minimum year"
            type="number"
            value={typeof field.min === 'number' && !Number.isNaN(field.min) ? field.min : ''}
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                min: nextValue === '' ? undefined : Number(nextValue),
              }));
            }}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Maximum year"
            value={field.max === 'todayYear' ? 'todayYear' : typeof field.max === 'number' && !Number.isNaN(field.max) ? field.max : ''}
            helperText="Adj meg egy evszamot vagy a `todayYear` erteket."
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                max:
                  nextValue === ''
                    ? undefined
                    : nextValue === 'todayYear'
                      ? 'todayYear'
                      : Number(nextValue),
              }));
            }}
            fullWidth
            margin="normal"
          />
        </>
      ) : null}
    </>
  );
};

export default FieldDialogSettingsSection;
