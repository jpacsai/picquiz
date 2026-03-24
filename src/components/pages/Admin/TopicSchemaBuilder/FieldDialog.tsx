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
              ...(nextValue === 'select'
                ? { options: currentField.options ?? [] }
                : { options: undefined }),
              ...(nextValue === 'imageUpload'
                ? {
                    fileNameFields: currentField.fileNameFields ?? {},
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
