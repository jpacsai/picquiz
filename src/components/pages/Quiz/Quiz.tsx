import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import QuizAnswered from '@/components/pages/Quiz/components/QuizAnswered';
import QuizError from '@/components/pages/Quiz/components/QuizError';
import QuizFinished from '@/components/pages/Quiz/components/QuizFinished';
import QuizHeader from '@/components/pages/Quiz/components/QuizHeader';
import QuizImage from '@/components/pages/Quiz/components/QuizImage';
import QuizMissingFields from '@/components/pages/Quiz/components/QuizMissingFields';
import QuizOptions from '@/components/pages/Quiz/components/QuizOptions.tsx/QuizOptions';
import type { TopicItem } from '@/service/items';

import type { Topic } from '../../../types/topics';
import { useQuiz } from './useQuiz';

type QuizProps = {
  answerFieldKeys: string[];
  autoAdvanceAfterAnswer: boolean;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  showCorrectAnswer: boolean;
  topic: Topic;
};

const Quiz = ({
  answerFieldKeys,
  autoAdvanceAfterAnswer,
  items,
  questionCount,
  showCorrectAnswer,
  topic,
}: QuizProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const {
    autoAdvanceCountdownSeconds,
    continueToNextQuestion,
    currentImageUrl,
    currentQuestion,
    currentQuestionIndex,
    isAnswered,
    isQuizFinished,
    questions,
    restartQuiz,
    score,
    selectOption,
    selectedFields,
    selectedOptionId,
  } = useQuiz({
    answerFieldKeys,
    autoAdvanceAfterAnswer,
    isDesktop,
    items,
    questionCount,
    topic,
  });

  if (!selectedFields.length || !questionCount) {
    return <QuizMissingFields topicId={topic.id} />;
  }

  if (!questions.length) {
    return <QuizError topicId={topic.id} />;
  }

  if (isQuizFinished) {
    return (
      <QuizFinished
        topicId={topic.id}
        score={score}
        questionsLength={questions.length}
        onRestart={restartQuiz}
      />
    );
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
                topicLabel={topic.label}
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
                  onSelectOption={selectOption}
                />

                {isAnswered ? (
                  <QuizAnswered
                    autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
                    autoAdvanceCountdownSeconds={autoAdvanceCountdownSeconds}
                    currentQuestionIndex={currentQuestionIndex}
                    questionsLength={questions.length}
                    onContinue={continueToNextQuestion}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Quiz;
