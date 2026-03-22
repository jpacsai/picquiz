import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';

import type { TopicItem } from '@/service/items';

import type { Topic } from '../../../types/topics';
import { buildQuizQuestions, getQuizAnswerField } from './utils';

type QuizProps = {
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
};

const Quiz = ({ answerFieldKey, items, questionCount, topic }: QuizProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [score, setScore] = useState(0);
  const answerField = getQuizAnswerField(topic, answerFieldKey);
  const questions = useMemo(
    () =>
      buildQuizQuestions({
        answerFieldKey,
        items,
        questionCount,
        topic,
      }),
    [answerFieldKey, items, questionCount, topic],
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

  if (!answerField?.quiz?.enabled || !questionCount) {
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
                        color={showCorrect ? 'success' : showIncorrect ? 'error' : 'primary'}
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
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                        variant={isSelected || showCorrect ? 'contained' : 'outlined'}
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
                    : `Nem ez a helyes válasz. A megoldás: ${currentQuestion.correctAnswer}.`}
                </Typography>
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
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Quiz;
