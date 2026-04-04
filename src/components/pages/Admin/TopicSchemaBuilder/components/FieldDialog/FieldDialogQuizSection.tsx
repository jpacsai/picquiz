import { Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogQuizSectionProps = {
  availableDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  pathPrefix: string;
};

const getNumericFieldValue = (value: number | undefined) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : '';

const getRangeMaxValueFieldValue = (value: number | 'todayYear') =>
  value === 'todayYear' ? value : getNumericFieldValue(value);

const FieldDialogQuizSection = ({
  availableDistractorSourceFieldOptions,
  errorsByPath,
  field,
  onChange,
  pathPrefix,
}: FieldDialogQuizSectionProps) => {
  const isBooleanField = field.type === 'boolean';
  const isSelectField = field.type === 'select';
  const quizDistractorType = field.quiz?.enabled ? (field.quiz.distractor?.type ?? '') : '';
  const availableDistractorOptions =
    field.type === 'number' || field.type === 'year'
      ? [{ label: 'Numeric range', value: 'numericRange' as const }]
      : (field.type === 'string' || field.type === 'yearRange') &&
          availableDistractorSourceFieldOptions.length > 0
        ? [{ label: 'Derived range', value: 'derivedRange' as const }]
        : [];
  const isDistractorTypeDisabled = availableDistractorOptions.length === 0;

  if (field.type === 'imageUpload') {
    return null;
  }

  return (
    <>
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
                      ...(currentField.type === 'select'
                        ? {
                            distractor: {
                              type: 'fromOptions' as const,
                            },
                          }
                        : {}),
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

      {field.quiz?.enabled ? (
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

          {!isBooleanField && !isSelectField ? (
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
              <MenuItem value="">Alapértelmezett topik értékek</MenuItem>
              {availableDistractorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          {field.quiz.distractor?.type === 'derivedRange' ? (
            <TextField
              select
              label="Distractor source field"
              value={field.quiz.distractor.sourceField}
              error={errorsByPath.has(`${pathPrefix}.quiz.distractor.sourceField`)}
              helperText={
                errorsByPath.get(`${pathPrefix}.quiz.distractor.sourceField`) ??
                'Válaszd ki azt a szám típusú mezőt, amiből a distractorok képződnek.'
              }
              onChange={(event) => {
                const nextValue = event.target.value;

                onChange((currentField) => ({
                  ...currentField,
                  quiz:
                    currentField.quiz?.enabled &&
                    currentField.quiz.distractor?.type === 'derivedRange'
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
                              maxValue: nextValue === 'todayYear' ? 'todayYear' : Number(nextValue),
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
    </>
  );
};

export default FieldDialogQuizSection;
