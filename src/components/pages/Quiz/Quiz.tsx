import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import type { Topic, TopicItem } from '../../../types/topics';
import QuizView from './QuizView';
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

  return (
    <QuizView
      autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
      autoAdvanceCountdownSeconds={autoAdvanceCountdownSeconds}
      currentImageUrl={currentImageUrl}
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      isAnswered={isAnswered}
      isQuizFinished={isQuizFinished}
      onContinueToNextQuestion={continueToNextQuestion}
      onRestartQuiz={restartQuiz}
      onSelectOption={selectOption}
      questionCount={questionCount}
      questions={questions}
      score={score}
      selectedFieldsLength={selectedFields.length}
      selectedOptionId={selectedOptionId}
      showCorrectAnswer={showCorrectAnswer}
      topicId={topic.id}
      topicLabel={topic.label}
    />
  );
};

export default Quiz;
