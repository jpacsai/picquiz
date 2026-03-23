import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import type { useQuizConfig } from './useQuizConfig';

type QuizConfigViewProps = ReturnType<typeof useQuizConfig>;

const QuizConfigView = ({
  autoAdvanceAfterAnswer,
  effectiveSelectedFieldKeys,
  eligibleFields,
  handleStartQuiz,
  handleToggleField,
  questionCount,
  questionCountOptions,
  selectedFields,
  setAutoAdvanceAfterAnswer,
  setSelectedQuestionCount,
  setShowCorrectAnswer,
  showCorrectAnswer,
  startableFields,
}: QuizConfigViewProps) => {
  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">Kvíz beállításai</Typography>

            {startableFields.length ? (
              <>
                <Card variant="outlined" sx={{ width: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle1">Kérdezett mezők</Typography>

                      {startableFields.map(({ field, promptsLabel }) => {
                        const isChecked = effectiveSelectedFieldKeys.includes(field.key);

                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(_, checked) => {
                                  handleToggleField(field.key, checked);
                                }}
                              />
                            }
                            key={field.key}
                            label={`${field.label} - ${promptsLabel}`}
                          />
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>

                <FormControl fullWidth>
                  <InputLabel id="quiz-question-count-label">Kérdések száma</InputLabel>
                  <Select
                    id="quiz-question-count"
                    label="Kérdések száma"
                    labelId="quiz-question-count-label"
                    onChange={(event: SelectChangeEvent<string>) => {
                      setSelectedQuestionCount(Number(event.target.value));
                    }}
                    value={questionCount ? String(questionCount) : ''}
                  >
                    {questionCountOptions.map((count) => (
                      <MenuItem key={count} value={String(count)}>
                        {count} kérdés
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showCorrectAnswer}
                      onChange={(_, checked) => {
                        setShowCorrectAnswer(checked);
                      }}
                    />
                  }
                  label="Helyes válasz megmutatása"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={autoAdvanceAfterAnswer}
                      onChange={(_, checked) => {
                        setAutoAdvanceAfterAnswer(checked);
                      }}
                    />
                  }
                  label="Automatikus továbblépés 3 mp után"
                />

                {selectedFields.length ? (
                  <Stack spacing={1}>
                    {selectedFields.map((selectedField) => (
                      <Typography color="text.secondary" key={selectedField.field.key}>
                        {selectedField.field.label}: {selectedField.eligibleItemCount} használható
                        item, {selectedField.distinctValueCount} különböző válaszlehetőség.
                      </Typography>
                    ))}
                  </Stack>
                ) : null}

                <Button
                  disabled={!selectedFields.length || !questionCount}
                  onClick={handleStartQuiz}
                  size="large"
                  variant="contained"
                >
                  Kvíz indítása
                </Button>
              </>
            ) : (
              <Stack spacing={1.5}>
                <Typography color="text.secondary">
                  Ehhez a topikhoz jelenleg nincs indítható quiz beállítás.
                </Typography>
                {eligibleFields.length ? (
                  eligibleFields.map(({ distinctValueCount, eligibleItemCount, field }) => (
                    <Typography color="text.secondary" key={field.key}>
                      {field.label}: {eligibleItemCount} használható item, {distinctValueCount}{' '}
                      különböző válasz.
                    </Typography>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    Ehhez a topikhoz még nincs quizre engedélyezett mező beállítva.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizConfigView;
