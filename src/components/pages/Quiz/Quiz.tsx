import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

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
  const navigate = useNavigate();
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
  const progressValue = questions.length
    ? (Math.min(currentQuestionIndex, questions.length) / questions.length) * 100
    : 0;
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
    return (
      <Stack spacing={3}>
        <Card sx={{ width: '100%' }} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Hiányos kvíz konfiguráció</Typography>
              <Typography color="text.secondary">
                Válassz érvényes kérdezett mezőt és kérdésszámot a kvíz indításához.
              </Typography>
              <Button
                onClick={() => {
                  void navigate({
                    to: '/$topicId/quiz-config',
                    params: { topicId: topic.id },
                  });
                }}
                variant="contained"
              >
                Vissza a beállításokhoz
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (!questions.length) {
    return (
      <Stack spacing={3}>
        <Card sx={{ width: '100%' }} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Nem indítható a kvíz</Typography>
              <Typography color="text.secondary">
                A kiválasztott mezőhöz nincs elég használható item vagy válaszlehetőség.
              </Typography>
              <Button
                onClick={() => {
                  void navigate({
                    to: '/$topicId/quiz-config',
                    params: { topicId: topic.id },
                  });
                }}
                variant="contained"
              >
                Vissza a beállításokhoz
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (isQuizFinished) {
    return (
      <Stack spacing={3}>
        <Card sx={{ width: '100%' }} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Kvíz vége</Typography>
              <Typography color="text.secondary">
                {score} / {questions.length} helyes válasz.
              </Typography>
              <Button
                onClick={() => {
                  void navigate({
                    to: '/$topicId/quiz-config',
                    params: { topicId: topic.id },
                  });
                }}
                variant="outlined"
              >
                Vissza a beállításokhoz
              </Button>
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setSelectedOptionId('');
                }}
                variant="contained"
              >
                Újraindítás
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
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
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: 280,
                }}
              >
                <Box
                  alt={`${topic.label} - ${currentQuestion.correctAnswer}`}
                  component="img"
                  src={currentImageUrl}
                  sx={{
                    width: '100%',
                    maxHeight: 420,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>

              <Stack
                spacing={3}
                sx={{
                  minHeight: '100%',
                }}
              >
                <Card sx={{ width: '100%' }} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h5">
                        {currentQuestionIndex + 1}. kérdés / {questions.length}
                      </Typography>
                      <Typography color="text.secondary">{currentQuestion.prompt}</Typography>
                      <Typography color="text.secondary">
                        Aktuális pontszám: {score} / {questions.length}
                      </Typography>
                      <LinearProgress value={progressValue} variant="determinate" />
                    </Stack>
                  </CardContent>
                </Card>

                <Box
                  sx={{
                    marginTop: 'auto',
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                  }}
                >
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const showCorrect = isAnswered && option.isCorrect;
                    const showIncorrect = isAnswered && isSelected && !option.isCorrect;

                    return (
                      <Button
                        disabled={isAnswered}
                        key={option.id}
                        onClick={() => {
                          if (isAnswered) {
                            return;
                          }

                          setSelectedOptionId(option.id);
                          if (option.isCorrect) {
                            setScore((currentScore) => currentScore + 1);
                          }
                        }}
                        sx={(theme) => ({
                          justifyContent: 'flex-start',
                          py: 1.5,
                          borderWidth: 2,
                          backgroundColor: isSelected
                            ? theme.palette.action.selected
                            : 'transparent',
                          borderColor: showCorrect
                            ? theme.palette.success.main
                            : showIncorrect
                              ? theme.palette.error.main
                              : undefined,
                          color: showCorrect
                            ? theme.palette.success.main
                            : showIncorrect
                              ? theme.palette.error.main
                              : undefined,
                          '&.Mui-disabled': {
                            opacity: 1,
                            borderColor: showCorrect
                              ? theme.palette.success.main
                              : showIncorrect
                                ? theme.palette.error.main
                                : undefined,
                            color: showCorrect
                              ? theme.palette.success.main
                              : showIncorrect
                                ? theme.palette.error.main
                                : undefined,
                            backgroundColor: isSelected
                              ? theme.palette.action.selected
                              : 'transparent',
                          },
                        })}
                        variant="outlined"
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </Box>
              </Stack>
            </Stack>

            {isAnswered ? (
              <Stack spacing={2}>
                <Typography color={selectedOption?.isCorrect ? 'success.main' : 'error.main'}>
                  {selectedOption?.isCorrect
                    ? 'Helyes válasz.'
                    : showCorrectAnswer
                      ? `Nem ez a helyes válasz. A megoldás: ${currentQuestion.correctAnswer}.`
                      : 'Nem ez a helyes válasz.'}
                </Typography>
                {autoAdvanceAfterAnswer ? (
                  <Typography color="text.secondary">
                    {currentQuestionIndex === questions.length - 1
                      ? 'Eredmény megjelenítése 5 másodperc múlva.'
                      : 'Következő kérdés 5 másodperc múlva.'}
                  </Typography>
                ) : (
                  <Button
                    onClick={() => {
                      setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
                      setSelectedOptionId('');
                    }}
                    variant="contained"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? 'Eredmény megtekintése'
                      : 'Következő kérdés'}
                  </Button>
                )}
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Quiz;
