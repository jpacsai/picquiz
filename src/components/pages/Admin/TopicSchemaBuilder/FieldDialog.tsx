import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

const FIELD_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Select', value: 'select' },
  { label: 'Image upload', value: 'imageUpload' },
] as const;

type FieldDialogProps = {
  availableFileNameFieldOptions: Array<{ key: string; label: string }>;
  canSubmit: boolean;
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  isOpen: boolean;
  mode: 'create' | 'edit';
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: () => void;
  optionsText?: string;
  pathPrefix: string;
};

const FieldDialog = ({
  availableFileNameFieldOptions,
  canSubmit,
  errorsByPath,
  field,
  isOpen,
  mode,
  onChange,
  onClose,
  onDelete,
  onSubmit,
  optionsText = '',
  pathPrefix,
}: FieldDialogProps) => {
  const title = mode === 'create' ? 'Uj field hozzaadasa' : 'Field szerkesztes';
  const submitLabel = mode === 'create' ? 'Field hozzaadasa' : 'Kesz';

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth={mode === 'create' ? 'sm' : 'md'}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
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

        <TextField
          select
          label="Field type"
          value={field.type ?? 'string'}
          error={errorsByPath.has(`${pathPrefix}.type`)}
          helperText={errorsByPath.get(`${pathPrefix}.type`) ?? ' '}
          onChange={(event) => {
            const nextValue = event.target.value as TopicFieldDraft['type'];

            onChange((currentField) => ({
              ...currentField,
              type: nextValue,
              ...(nextValue === 'imageUpload' ? { quiz: undefined } : {}),
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
          {FIELD_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {field.type !== 'imageUpload' ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.quiz?.enabled)}
                onChange={(event) => {
                  const nextValue = event.target.checked;

                  onChange((currentField) => ({
                    ...currentField,
                    quiz: nextValue
                      ? {
                          enabled: true,
                          prompt: currentField.quiz?.enabled ? currentField.quiz.prompt : '',
                        }
                      : {
                          enabled: false,
                        },
                  }));
                }}
              />
            }
            label="Quiz enabled"
          />
        ) : null}

        {field.type !== 'imageUpload' && field.quiz?.enabled ? (
          <TextField
            label="Quiz prompt"
            value={field.quiz.prompt}
            error={errorsByPath.has(`${pathPrefix}.quiz.prompt`)}
            helperText={errorsByPath.get(`${pathPrefix}.quiz.prompt`) ?? ' '}
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                quiz: currentField.quiz?.enabled
                  ? {
                      ...currentField.quiz,
                      prompt: nextValue,
                    }
                  : {
                      enabled: true,
                      prompt: nextValue,
                    },
              }));
            }}
            fullWidth
            margin="normal"
          />
        ) : null}

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

        {mode === 'edit' && field.type === 'select' ? (
          <TextField
            label="Select opciok"
            multiline
            minRows={4}
            value={optionsText}
            error={errorsByPath.has(`${pathPrefix}.options`)}
            helperText={errorsByPath.get(`${pathPrefix}.options`) ?? 'Soronkent egy opcio.'}
            onChange={(event) => {
              const nextValue = event.target.value;

              onChange((currentField) => ({
                ...currentField,
                options: nextValue
                  .split('\n')
                  .map((option) => option.trim())
                  .filter(Boolean)
                  .sort((left, right) => left.localeCompare(right, 'hu', { sensitivity: 'base' })),
              }));
            }}
            fullWidth
            margin="normal"
          />
        ) : null}

        {field.type === 'imageUpload' ? (
          <>
            <TextField
              select
              SelectProps={{
                multiple: true,
                renderValue: (selected) =>
                  (selected as string[])
                    .map(
                      (selectedKey) =>
                        availableFileNameFieldOptions.find((option) => option.key === selectedKey)
                          ?.label ?? selectedKey,
                    )
                    .join(', '),
              }}
              label="File name fields"
              value={field.fileNameFields ?? []}
              error={errorsByPath.has(`${pathPrefix}.fileNameFields`)}
              helperText={
                errorsByPath.get(`${pathPrefix}.fileNameFields`) ??
                'Valaszd ki, melyik kotelezo mezokbol generaljuk a file-nevet. A sorrend a field lista sorrendjet koveti.'
              }
              onChange={(event) => {
                const nextValue = event.target.value;
                const selectedKeys = typeof nextValue === 'string' ? nextValue.split(',') : nextValue;

                onChange((currentField) => ({
                  ...currentField,
                  fileNameFields: availableFileNameFieldOptions
                    .map((option) => option.key)
                    .filter((optionKey) => selectedKeys.includes(optionKey)),
                }));
              }}
              fullWidth
              margin="normal"
            >
              {availableFileNameFieldOptions.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Desktop target field"
              value={field.targetFields?.desktop ?? ''}
              error={errorsByPath.has(`${pathPrefix}.targetFields.desktop`)}
              helperText={errorsByPath.get(`${pathPrefix}.targetFields.desktop`) ?? ' '}
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => ({
                  ...currentField,
                  targetFields: {
                    ...currentField.targetFields,
                    desktop: nextValue,
                  },
                }));
              }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Mobile target field"
              value={field.targetFields?.mobile ?? ''}
              error={errorsByPath.has(`${pathPrefix}.targetFields.mobile`)}
              helperText={errorsByPath.get(`${pathPrefix}.targetFields.mobile`) ?? ' '}
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => ({
                  ...currentField,
                  targetFields: {
                    ...currentField.targetFields,
                    mobile: nextValue,
                  },
                }));
              }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Desktop path field"
              value={field.targetFields?.desktopPath ?? ''}
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => ({
                  ...currentField,
                  targetFields: {
                    ...currentField.targetFields,
                    desktopPath: nextValue,
                  },
                }));
              }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Mobile path field"
              value={field.targetFields?.mobilePath ?? ''}
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => ({
                  ...currentField,
                  targetFields: {
                    ...currentField.targetFields,
                    mobilePath: nextValue,
                  },
                }));
              }}
              fullWidth
              margin="normal"
            />
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        {mode === 'edit' && onDelete ? (
          <Button color="error" onClick={onDelete}>
            Torles
          </Button>
        ) : null}
        <Button onClick={onClose}>{mode === 'create' ? 'Megse' : 'Bezárás'}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldDialog;
