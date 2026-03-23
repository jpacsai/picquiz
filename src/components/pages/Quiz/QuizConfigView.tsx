import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
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
  handleQuestionCountBlur,
  handleQuestionCountInputChange,
  handleQuestionCountSliderChange,
  handleToggleField,
  maxQuestionCount,
  minQuestionCount,
  questionCount,
  selectedFields,
  setAutoAdvanceAfterAnswer,
  setShowCorrectAnswer,
  showCorrectAnswer,
  startableFields,
}: QuizConfigViewProps) => {
  const sliderMax = Math.max(maxQuestionCount, 1);
  const sliderMin = maxQuestionCount > 0 ? (minQuestionCount < sliderMax ? minQuestionCount : sliderMax) : 1;
  const sliderMarks = Array.from(
    new Set([
      sliderMin,
      sliderMax,
      ...Array.from({ length: Math.floor(sliderMax / 5) }, (_, index) => (index + 1) * 5).filter(
        (value) => value >= sliderMin && value <= sliderMax,
      ),
    ]),
  )
    .sort((left, right) => left - right)
    .map((value) => ({ value }));

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
                  <Typography id="quiz-question-count-label" variant="subtitle2">
                    Kérdések száma
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Input
                      id="quiz-question-count-input"
                      value={questionCount}
                      size="small"
                      onChange={(event) => {
                        handleQuestionCountInputChange(event.target.value);
                      }}
                      onBlur={handleQuestionCountBlur}
                      inputProps={{
                        step: 1,
                        min: minQuestionCount,
                        max: sliderMax,
                        type: 'number',
                        'aria-labelledby': 'quiz-question-count-label',
                      }}
                      disabled={maxQuestionCount <= 0}
                      sx={{ width: 56 }}
                    />
                    <Slider
                      aria-label="Kérdések száma"
                      value={typeof questionCount === 'number' ? questionCount : 0}
                      onChange={handleQuestionCountSliderChange}
                      marks={sliderMarks}
                      min={sliderMin}
                      max={sliderMax}
                      step={null}
                      disabled={maxQuestionCount <= 0}
                      sx={{ mr: 2 }}
                    />
                  </Box>
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
