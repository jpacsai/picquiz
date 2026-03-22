import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';

import QuizAnswered from '@/components/pages/Quiz/components/QuizAnswered';
import QuizError from '@/components/pages/Quiz/components/QuizError';
import QuizFinished from '@/components/pages/Quiz/components/QuizFinished';
import QuizHeader from '@/components/pages/Quiz/components/QuizHeader';
import QuizImage from '@/components/pages/Quiz/components/QuizImage';
import QuizMissingFields from '@/components/pages/Quiz/components/QuizMissingFields';
import QuizOptions from '@/components/pages/Quiz/components/QuizOptions.tsx/QuizOptions';
import type { TopicItem } from '@/service/items';

import type { Topic } from '../../../types/topics';
import { buildQuizQuestions, getSelectedQuizFields } from './utils';

type QuizProps = {
  answerFieldKeys: string[];
  autoAdvanceAfterAnswer: boolean;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  showCorrectAnswer: boolean;
  topic: Topic;
};

const AUTO_ADVANCE_DELAY_MS = 5000;

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [score, setScore] = useState(0);
  const selectedFields = getSelectedQuizFields({ fieldKeys: answerFieldKeys, items, topic });
  const questions = useMemo(
    () =>
      buildQuizQuestions({
        answerFieldKeys,
        items,
        questionCount,
        topic,
      }),
    [answerFieldKeys, items, questionCount, topic],
  );
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isQuizFinished = currentQuestionIndex >= questions.length;
  const selectedOption =
    currentQuestion?.options.find((option) => option.id === selectedOptionId) ?? null;
  const isAnswered = Boolean(selectedOption);
  const currentImageUrl = currentQuestion
    ? isDesktop
      ? currentQuestion.imageUrls.desktop
      : currentQuestion.imageUrls.mobile
    : '';

  useEffect(() => {
    if (!isAnswered || !autoAdvanceAfterAnswer) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
      setSelectedOptionId('');
    }, AUTO_ADVANCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoAdvanceAfterAnswer, isAnswered, selectedOptionId]);

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
        onRestart={() => {
          setCurrentQuestionIndex(0);
          setSelectedOptionId('');
          setScore(0);
        }}
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
                  onSelectOption={(optionId) => {
                    setSelectedOptionId(optionId);

                    const selectedOption = currentQuestion.options.find(
                      (option) => option.id === optionId,
                    );

                    if (selectedOption?.isCorrect) {
                      setScore((score) => score + 1);
                    }
                  }}
                />
              </Stack>
            </Stack>

            {isAnswered ? (
              <QuizAnswered
                isCorrect={selectedOption?.isCorrect ?? false}
                showCorrectAnswer={showCorrectAnswer}
                correctAnswer={currentQuestion.correctAnswer}
                autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
                currentQuestionIndex={currentQuestionIndex}
                questionsLength={questions.length}
                onContinue={() => {
                  setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
                  setSelectedOptionId('');
                }}
              />
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Quiz;
