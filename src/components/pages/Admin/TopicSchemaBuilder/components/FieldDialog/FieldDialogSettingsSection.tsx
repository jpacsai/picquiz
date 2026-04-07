import { Box, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogSettingsSectionProps = {
  availableAutocompleteCopyFieldOptions: Array<{ key: string; label: string }>;
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
};

const FieldDialogSettingsSection = ({
  availableAutocompleteCopyFieldOptions,
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
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.autocomplete)}
                onChange={(event) => {
                  const nextValue = event.target.checked;

                  onChange((currentField) => ({
                    ...currentField,
                    autocomplete: nextValue,
                    autocompleteCopyFields: nextValue
                      ? currentField.autocompleteCopyFields
                      : undefined,
                    autocompleteMatchField: undefined,
                  }));
                }}
              />
            }
            label="Autocomplete"
          />

          {field.autocomplete ? (
            <>
              <TextField
                select
                label="Autocomplete copy fields"
                value={field.autocompleteCopyFields ?? []}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  onChange((currentField) => ({
                    ...currentField,
                    autocompleteCopyFields:
                      typeof nextValue === 'string'
                        ? nextValue.split(',').filter(Boolean)
                        : nextValue,
                  }));
                }}
                fullWidth
                margin="normal"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) =>
                    (Array.isArray(selected) ? selected : [selected])
                      .map((selectedKey) => {
                        const option = availableAutocompleteCopyFieldOptions.find(
                          (candidate) => candidate.key === selectedKey,
                        );

                        return option?.label ?? selectedKey;
                      })
                      .join(', '),
                }}
                helperText="Az azonos értékű meglévő itemből ezek a mezők töltődnek ki automatikusan, de csak ha még üresek."
              >
                {availableAutocompleteCopyFieldOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </>
          ) : null}
        </>
      ) : null}

      <FormControlLabel
        control={
          <Checkbox
            checked={field.filter?.enabled !== false}
            onChange={(event) => {
              const nextValue = event.target.checked;

              onChange((currentField) => ({
                ...currentField,
                filter: nextValue
                  ? undefined
                  : {
                      enabled: false,
                    },
              }));
            }}
          />
        }
        label="Filter enabled"
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
