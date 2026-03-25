import { MenuItem, TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

const FIELD_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Year', value: 'year' },
  { label: 'Year range', value: 'yearRange' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Select', value: 'select' },
] as const;

type FieldDialogBasicsSectionProps = {
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  mode: 'create' | 'edit';
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  pathPrefix: string;
};

const FieldDialogBasicsSection = ({
  errorsByPath,
  field,
  mode,
  onChange,
  pathPrefix,
}: FieldDialogBasicsSectionProps) => {
  const hasTypeSpecificFields =
    field.type === 'select' ||
    field.type === 'year' ||
    field.type === 'yearRange' ||
    field.type === 'imageUpload';
  const fieldTypeOptions =
    field.type === 'imageUpload'
      ? [...FIELD_TYPE_OPTIONS, { label: 'Image upload', value: 'imageUpload' as const }]
      : FIELD_TYPE_OPTIONS;

  return (
    <>
      {field.type !== 'imageUpload' ? (
        <>
          <TextField
            label="Field label"
            value={field.label ?? ''}
            error={errorsByPath.has(`${pathPrefix}.label`)}
            helperText={errorsByPath.get(`${pathPrefix}.label`) ?? ' '}
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                label: nextValue,
              }));
            }}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Field key"
            value={field.key ?? ''}
            error={errorsByPath.has(`${pathPrefix}.key`)}
            helperText={errorsByPath.get(`${pathPrefix}.key`) ?? ' '}
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                key: nextValue,
              }));
            }}
            fullWidth
            margin="normal"
          />
        </>
      ) : null}

      <TextField
        select
        label="Field type"
        value={field.type ?? 'string'}
        disabled={mode === 'edit' && field.type === 'imageUpload'}
        error={errorsByPath.has(`${pathPrefix}.type`)}
        helperText={errorsByPath.get(`${pathPrefix}.type`) ?? ' '}
        onChange={(event) => {
          const nextValue = event.target.value as TopicFieldDraft['type'];

          onChange((currentField) => ({
            ...currentField,
            type: nextValue,
            ...(nextValue === 'imageUpload' ? { quiz: undefined, required: true } : {}),
            ...(nextValue === 'select'
              ? { options: currentField.options ?? [] }
              : { options: undefined }),
            ...(nextValue === 'year' || nextValue === 'yearRange'
              ? { max: currentField.max ?? 'todayYear', min: currentField.min }
              : { max: undefined, min: undefined }),
            ...(nextValue === 'imageUpload'
              ? {
                  fileNameFields: currentField.fileNameFields ?? [],
                  targetFields: currentField.targetFields ?? {},
                }
              : {
                  fileNameFields: undefined,
                  targetFields: undefined,
                }),
            ...(nextValue === 'string'
              ? {}
              : {
                  autocomplete: undefined,
                  autocompleteCopyFields: undefined,
                  autocompleteMatchField: undefined,
                }),
          }));
        }}
        fullWidth
        margin={hasTypeSpecificFields ? 'dense' : 'normal'}
        sx={hasTypeSpecificFields ? { mb: 0.25 } : undefined}
      >
        {fieldTypeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default FieldDialogBasicsSection;
