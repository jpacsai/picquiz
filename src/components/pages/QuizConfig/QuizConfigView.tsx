import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import NoQuiz from '@/components/pages/QuizConfig/components/NoQuiz';
import QuestionFieldsInput from '@/components/pages/QuizConfig/components/QuestionFieldsInput';
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
  const hasStartableFields = startableFields.length > 0;

  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="h6">Kvíz beállításai</Typography>

              <Button onClick={handleReset} size="large" variant="text">
                Alaphelyzet
              </Button>
            </Box>

            {!hasStartableFields ? (
              <NoQuiz eligibleFields={eligibleFields} />
            ) : (
              <>
                <Card variant="outlined" sx={{ width: '100%' }}>
                  <CardContent>
                    <QuestionFieldsInput
                      startableFields={startableFields}
                      effectiveSelectedFieldKeys={effectiveSelectedFieldKeys}
                      onToggleField={handleToggleField}
                    />
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

                <Button
                  disabled={!selectedFields.length || !questionCount}
                  onClick={handleStartQuiz}
                  size="large"
                  variant="contained"
                >
                  Kvíz indítása
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizConfigView;
