import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

import QuizAnswered from '@/components/pages/Quiz/components/QuizAnswered';
import QuizError from '@/components/pages/Quiz/components/QuizError';
import QuizFinished from '@/components/pages/Quiz/components/QuizFinished';
import QuizHeader from '@/components/pages/Quiz/components/QuizHeader';
import QuizImage from '@/components/pages/Quiz/components/QuizImage';
import QuizMissingFields from '@/components/pages/Quiz/components/QuizMissingFields';
import QuizOptions from '@/components/pages/Quiz/components/QuizOptions.tsx/QuizOptions';
import ReturnToConfigButton from '@/components/pages/Quiz/components/ReturnToConfigButton';
import type { QuizQuestion } from '@/types/quiz';

type QuizViewProps = {
  autoAdvanceAfterAnswer: boolean;
  autoAdvanceCountdownSeconds: number;
  currentImageUrl: string;
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  isAnswered: boolean;
  isQuizFinished: boolean;
  onContinueToNextQuestion: () => void;
  onRestartQuiz: () => void;
  onSelectOption: (optionId: string) => void;
  questionCount: number;
  questions: QuizQuestion[];
  score: number;
  selectedFieldsLength: number;
  selectedOptionId: string;
  showCorrectAnswer: boolean;
  topicId: string;
  topicLabel: string;
};

const QuizView = ({
  autoAdvanceAfterAnswer,
  autoAdvanceCountdownSeconds,
  currentImageUrl,
  currentQuestion,
  currentQuestionIndex,
  isAnswered,
  isQuizFinished,
  onContinueToNextQuestion,
  onRestartQuiz,
  onSelectOption,
  questionCount,
  questions,
  score,
  selectedFieldsLength,
  selectedOptionId,
  showCorrectAnswer,
  topicId,
  topicLabel,
}: QuizViewProps) => {
  if (!selectedFieldsLength || !questionCount) {
    return <QuizMissingFields topicId={topicId} />;
  }

  if (!questions.length) {
    return <QuizError topicId={topicId} />;
  }

  if (isQuizFinished) {
    return (
      <QuizFinished
        topicId={topicId}
        score={score}
        questionsLength={questions.length}
        onRestart={onRestartQuiz}
      />
    );
  }

  if (!currentQuestion) {
    return <QuizError topicId={topicId} />;
  }

  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Stack
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
                },
                alignItems: 'stretch',
              }}
            >
              <QuizImage
                topicLabel={topicLabel}
                currentQuestionCorrectAnswer={currentQuestion.correctAnswer}
                currentImageUrl={currentImageUrl}
              />

              <Stack
                spacing={3}
                sx={{
                  minHeight: '100%',
                }}
              >
                <QuizHeader
                  questionLength={questions.length}
                  currentQuestionIndex={currentQuestionIndex}
                  prompt={currentQuestion.prompt}
                />

                <QuizOptions
                  options={currentQuestion.options}
                  isAnswered={isAnswered}
                  selectedOptionId={selectedOptionId}
                  showCorrectAnswer={showCorrectAnswer}
                  onSelectOption={onSelectOption}
                />

                {isAnswered ? (
                  <QuizAnswered
                    autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
                    autoAdvanceCountdownSeconds={autoAdvanceCountdownSeconds}
                    currentQuestionIndex={currentQuestionIndex}
                    questionsLength={questions.length}
                    onContinue={onContinueToNextQuestion}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ReturnToConfigButton topicId={topicId} />
      </Box>
    </Stack>
  );
};

export default QuizView;
