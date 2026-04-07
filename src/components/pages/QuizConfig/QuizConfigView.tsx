import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import AnswerDetailsSection from '@/components/pages/QuizConfig/components/AnswerDetailsSection';
import ItemFilterSection from '@/components/pages/QuizConfig/components/ItemFilterSection';
import NoQuiz from '@/components/pages/QuizConfig/components/NoQuiz';
import QuestionFieldsInput from '@/components/pages/QuizConfig/components/QuestionFieldsInput';
import QuestionNumberInput from '@/components/pages/QuizConfig/components/QuestionNumberInput';
import type { UseQuizConfigResult } from '@/types/quiz';

type QuizConfigViewProps = UseQuizConfigResult;

const QuizConfigView = ({
  answerDetailFieldKeys,
  answerDetailFields,
  answerDetailsEnabled,
  answerDetailsExpanded,
  autoAdvanceAfterAnswer,
  effectiveSelectedFieldKeys,
  eligibleFields,
  filteredItemCount,
  handleAddItemFilter,
  handleRemoveItemFilter,
  handleToggleAnswerDetailField,
  handleItemFilterFieldChange,
  handleItemFilterValueChange,
  handleReset,
  handleStartQuiz,
  handleQuestionCountBlur,
  handleQuestionCountInputChange,
  handleQuestionCountSliderChange,
  handleToggleField,
  itemFilterFields,
  itemFilterRows,
  maxQuestionCount,
  minQuestionCount,
  questionCount,
  selectedFields,
  setAnswerDetailsEnabled,
  setAnswerDetailsExpanded,
  setAutoAdvanceAfterAnswer,
  setShowCorrectAnswer,
  showCorrectAnswer,
  startableFields,
  totalItemCount,
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

            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <ItemFilterSection
                  filteredItemCount={filteredItemCount}
                  itemFilterFields={itemFilterFields}
                  itemFilterRows={itemFilterRows}
                  onAddItemFilter={handleAddItemFilter}
                  onItemFilterFieldChange={handleItemFilterFieldChange}
                  onItemFilterValueChange={handleItemFilterValueChange}
                  onRemoveItemFilter={handleRemoveItemFilter}
                  totalItemCount={totalItemCount}
                />
              </CardContent>
            </Card>

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
                      checked={autoAdvanceAfterAnswer}
                      onChange={(_, checked) => {
                        setAutoAdvanceAfterAnswer(checked);
                      }}
                    />
                  }
                  label="Automatikus továbblépés 3 mp után"
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
                  label="Helyes válasz megmutatása rossz válasz esetén"
                />

                <Card variant="outlined" sx={{ width: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={answerDetailsEnabled}
                              onChange={(_, checked) => {
                                setAnswerDetailsEnabled(checked);
                              }}
                            />
                          }
                          label="Plusz adatok megjelenítése a válasz után"
                          sx={{ mr: 0 }}
                        />

                        {answerDetailsEnabled ? (
                          <IconButton
                            aria-label={
                              answerDetailsExpanded
                                ? 'Plusz adatok szekció összecsukása'
                                : 'Plusz adatok szekció lenyitása'
                            }
                            onClick={() => {
                              setAnswerDetailsExpanded((currentValue) => !currentValue);
                            }}
                            size="small"
                          >
                            {answerDetailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        ) : null}
                      </Box>

                      <Collapse in={answerDetailsEnabled && answerDetailsExpanded}>
                        {answerDetailsEnabled ? (
                          <AnswerDetailsSection
                            answerDetailFieldKeys={answerDetailFieldKeys}
                            answerDetailFields={answerDetailFields}
                            answerDetailsEnabled={answerDetailsEnabled}
                            onToggleAnswerDetailField={handleToggleAnswerDetailField}
                          />
                        ) : null}
                      </Collapse>
                    </Stack>
                  </CardContent>
                </Card>

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
