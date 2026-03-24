import {
  Alert,
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
] as const;

type FieldDialogProps = {
  availableFileNameFieldOptions: Array<{ key: string; label: string }>;
  availableDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
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

const getNumericFieldValue = (value: number | undefined) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : '';

const getRangeMaxValueFieldValue = (value: number | 'todayYear') =>
  value === 'todayYear' ? value : getNumericFieldValue(value);

const FieldDialog = ({
  availableFileNameFieldOptions,
  availableDistractorSourceFieldOptions,
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
  const hasAvailableFileNameFieldOptions = availableFileNameFieldOptions.length > 0;
  const fieldTypeOptions =
    field.type === 'imageUpload'
      ? [...FIELD_TYPE_OPTIONS, { label: 'Image upload', value: 'imageUpload' as const }]
      : FIELD_TYPE_OPTIONS;
  const quizDistractorType = field.quiz?.enabled ? field.quiz.distractor?.type ?? '' : '';
  const availableDistractorOptions =
    field.type === 'select'
      ? [{ label: 'From options', value: 'fromOptions' as const }]
      : field.type === 'number'
        ? [{ label: 'Numeric range', value: 'numericRange' as const }]
        : field.type === 'string' && availableDistractorSourceFieldOptions.length > 0
          ? [{ label: 'Derived range', value: 'derivedRange' as const }]
          : [];
  const isDistractorTypeDisabled = availableDistractorOptions.length === 0;

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth={mode === 'create' ? 'sm' : 'md'}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
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
          <>
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

            <TextField
              select
              label="Distractor type"
              value={quizDistractorType}
              disabled={isDistractorTypeDisabled}
              helperText={
                isDistractorTypeDisabled
                  ? 'Ehhez a fieldhez most nincs hasznalhato distractor beallitas.'
                  : ' '
              }
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => {
                  if (!currentField.quiz?.enabled) {
                    return currentField;
                  }

                  const nextDistractor =
                    nextValue === ''
                      ? undefined
                      : nextValue === 'fromOptions'
                        ? { type: 'fromOptions' as const }
                        : nextValue === 'numericRange'
                          ? { type: 'numericRange' as const, maxValue: 'todayYear' as const }
                          : {
                              type: 'derivedRange' as const,
                              deriveWith: 'yearToCentury' as const,
                              maxValue: 'todayYear' as const,
                              sourceField: '',
                            };

                  return {
                    ...currentField,
                    quiz: {
                      ...currentField.quiz,
                      distractor: nextDistractor,
                    },
                  };
                });
              }}
              fullWidth
              margin="normal"
            >
              <MenuItem value="">Default topic values</MenuItem>
              {availableDistractorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {field.quiz.distractor?.type === 'derivedRange' ? (
              <TextField
                select
                label="Distractor source field"
                value={field.quiz.distractor.sourceField}
                error={errorsByPath.has(`${pathPrefix}.quiz.distractor.sourceField`)}
                helperText={
                  errorsByPath.get(`${pathPrefix}.quiz.distractor.sourceField`) ??
                  'Valaszd ki azt a number mezot, amibol a distractorok kepzodnek.'
                }
                onChange={(event) => {
                  const nextValue = event.target.value;

                  onChange((currentField) => ({
                    ...currentField,
                    quiz:
                      currentField.quiz?.enabled && currentField.quiz.distractor?.type === 'derivedRange'
                        ? {
                            ...currentField.quiz,
                            distractor: {
                              ...currentField.quiz.distractor,
                              sourceField: nextValue,
                            },
                          }
                        : currentField.quiz,
                  }));
                }}
                fullWidth
                margin="normal"
              >
                {availableDistractorSourceFieldOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            {field.quiz.distractor?.type === 'numericRange' ||
            field.quiz.distractor?.type === 'derivedRange' ? (
              <>
                <TextField
                  label="Min value"
                  value={getNumericFieldValue(field.quiz.distractor.minValue)}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    onChange((currentField) => ({
                      ...currentField,
                      quiz:
                        currentField.quiz?.enabled &&
                        currentField.quiz.distractor &&
                        (currentField.quiz.distractor.type === 'numericRange' ||
                          currentField.quiz.distractor.type === 'derivedRange')
                          ? {
                              ...currentField.quiz,
                              distractor: {
                                ...currentField.quiz.distractor,
                                minValue: nextValue === '' ? undefined : Number(nextValue),
                              },
                            }
                          : currentField.quiz,
                    }));
                  }}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Min offset"
                  value={getNumericFieldValue(field.quiz.distractor.minOffset)}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    onChange((currentField) => ({
                      ...currentField,
                      quiz:
                        currentField.quiz?.enabled &&
                        currentField.quiz.distractor &&
                        (currentField.quiz.distractor.type === 'numericRange' ||
                          currentField.quiz.distractor.type === 'derivedRange')
                          ? {
                              ...currentField.quiz,
                              distractor: {
                                ...currentField.quiz.distractor,
                                minOffset: nextValue === '' ? undefined : Number(nextValue),
                              },
                            }
                          : currentField.quiz,
                    }));
                  }}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Max offset"
                  value={getNumericFieldValue(field.quiz.distractor.maxOffset)}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    onChange((currentField) => ({
                      ...currentField,
                      quiz:
                        currentField.quiz?.enabled &&
                        currentField.quiz.distractor &&
                        (currentField.quiz.distractor.type === 'numericRange' ||
                          currentField.quiz.distractor.type === 'derivedRange')
                          ? {
                              ...currentField.quiz,
                              distractor: {
                                ...currentField.quiz.distractor,
                                maxOffset: nextValue === '' ? undefined : Number(nextValue),
                              },
                            }
                          : currentField.quiz,
                    }));
                  }}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Max value"
                  value={getRangeMaxValueFieldValue(field.quiz.distractor.maxValue)}
                  error={errorsByPath.has(`${pathPrefix}.quiz.distractor.maxValue`)}
                  helperText={
                    errorsByPath.get(`${pathPrefix}.quiz.distractor.maxValue`) ??
                    'Adj meg egy szamot vagy a `todayYear` erteket.'
                  }
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    onChange((currentField) => ({
                      ...currentField,
                      quiz:
                        currentField.quiz?.enabled &&
                        currentField.quiz.distractor &&
                        (currentField.quiz.distractor.type === 'numericRange' ||
                          currentField.quiz.distractor.type === 'derivedRange')
                          ? {
                              ...currentField.quiz,
                              distractor: {
                                ...currentField.quiz.distractor,
                                maxValue:
                                  nextValue === 'todayYear' ? 'todayYear' : Number(nextValue),
                              },
                            }
                          : currentField.quiz,
                    }));
                  }}
                  fullWidth
                  margin="normal"
                />
              </>
            ) : null}
          </>
        ) : null}

        {field.type !== 'imageUpload' ? (
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
          </>
        ) : null}

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
              disabled={!hasAvailableFileNameFieldOptions}
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
                (hasAvailableFileNameFieldOptions
                  ? 'Valaszd ki, melyik kotelezo mezokbol generaljuk a file-nevet. A sorrend a field lista sorrendjet koveti.'
                  : 'Vegyel fel hozza legalabb egy required fieldet, es utana itt tudod kivalasztani a file-nevhez hasznalt mezoket.')
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

            <Alert severity="info" sx={{ mt: 2 }}>
              A builder automatikusan kezeli a kepes rendszermezoket: `image_url_desktop`,
              `image_url_mobile`, `image_path_desktop`, `image_path_mobile`.
            </Alert>
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
