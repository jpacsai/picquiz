import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import NoQuiz from '@/components/pages/QuizConfig/components/NoQuiz';
import QuestionNumberInput from '@/components/pages/QuizConfig/components/QuestionNumberInput';
import type { UseQuizConfigResult } from '@/types/quiz';

type QuizConfigViewProps = UseQuizConfigResult;

const QuizConfigView = ({
  autoAdvanceAfterAnswer,
  effectiveSelectedFieldKeys,
  eligibleFields,
  handleReset,
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

                <QuestionNumberInput
                  questionCount={questionCount}
                  maxQuestionCount={maxQuestionCount}
                  minQuestionCount={minQuestionCount}
                  onQuestionCountInputChange={handleQuestionCountInputChange}
                  onQuestionCountBlur={handleQuestionCountBlur}
                  onQuestionCountSliderChange={handleQuestionCountSliderChange}
                />

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

                <Button onClick={handleReset} size="large" variant="text">
                  Alaphelyzet
                </Button>
              </>
            ) : (
              <NoQuiz eligibleFields={eligibleFields} />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizConfigView;
