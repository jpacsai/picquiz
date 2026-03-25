import { MenuItem, TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

const FIELD_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
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
            ...(nextValue === 'imageUpload'
              ? {
                  fileNameFields: currentField.fileNameFields ?? [],
                  targetFields: currentField.targetFields ?? {},
                }
              : {
                  fileNameFields: undefined,
                  targetFields: undefined,
                }),
          }));
        }}
        fullWidth
        margin="normal"
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
