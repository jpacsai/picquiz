import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import {
  getEligibleQuizFields,
  getMaxQuestionCountForFields,
  getQuestionCountOptions,
} from './utils';

type QuizConfigProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const SHOW_CORRECT_ANSWER_STORAGE_KEY = 'picquiz-quiz-show-correct-answer';
const AUTO_ADVANCE_AFTER_ANSWER_STORAGE_KEY = 'picquiz-quiz-auto-advance-after-answer';

const getStoredBoolean = (storageKey: string, fallbackValue: boolean): boolean => {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (storedValue === 'true') {
    return true;
  }

  if (storedValue === 'false') {
    return false;
  }

  return fallbackValue;
};

const QuizConfig = ({ items, topic }: QuizConfigProps) => {
  const navigate = useNavigate();
  const eligibleFields = getEligibleQuizFields({ items, topic });
  const startableFields = eligibleFields.filter((field) => field.maxQuestionCount > 0);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(() =>
    getStoredBoolean(SHOW_CORRECT_ANSWER_STORAGE_KEY, true),
  );
  const [autoAdvanceAfterAnswer, setAutoAdvanceAfterAnswer] = useState(() =>
    getStoredBoolean(AUTO_ADVANCE_AFTER_ANSWER_STORAGE_KEY, false),
  );

  useEffect(() => {
    window.localStorage.setItem(SHOW_CORRECT_ANSWER_STORAGE_KEY, String(showCorrectAnswer));
  }, [showCorrectAnswer]);

  useEffect(() => {
    window.localStorage.setItem(
      AUTO_ADVANCE_AFTER_ANSWER_STORAGE_KEY,
      String(autoAdvanceAfterAnswer),
    );
  }, [autoAdvanceAfterAnswer]);

  const effectiveSelectedFieldKeys = selectedFieldKeys.length
    ? selectedFieldKeys.filter((fieldKey) =>
        startableFields.some(({ field }) => field.key === fieldKey),
      )
    : startableFields.slice(0, 1).map(({ field }) => field.key);
  const selectedFields = startableFields.filter(({ field }) =>
    effectiveSelectedFieldKeys.includes(field.key),
  );
  const maxQuestionCount: number = getMaxQuestionCountForFields({
    fieldKeys: effectiveSelectedFieldKeys,
    items,
    topic,
  });
  const questionCountOptions = getQuestionCountOptions(maxQuestionCount);
  const questionCount = questionCountOptions.includes(selectedQuestionCount)
    ? selectedQuestionCount
    : (questionCountOptions[0] ?? 0);

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
                                  const nextFieldKeys = checked
                                    ? [...effectiveSelectedFieldKeys, field.key]
                                    : effectiveSelectedFieldKeys.filter(
                                        (fieldKey) => fieldKey !== field.key,
                                      );

                                  setSelectedFieldKeys(nextFieldKeys);
                                  setSelectedQuestionCount(0);
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
                  <InputLabel id="quiz-question-count-label">Kérdések száma</InputLabel>
                  <Select
                    id="quiz-question-count"
                    label="Kérdések száma"
                    labelId="quiz-question-count-label"
                    onChange={(event: SelectChangeEvent<string>) => {
                      setSelectedQuestionCount(Number(event.target.value));
                    }}
                    value={questionCount ? String(questionCount) : ''}
                  >
                    {questionCountOptions.map((count) => (
                      <MenuItem key={count} value={String(count)}>
                        {count} kérdés
                      </MenuItem>
                    ))}
                  </Select>
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
                  label="Automatikus továbblépés 5 mp után"
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
                  onClick={() => {
                    if (!selectedFields.length || !questionCount) {
                      return;
                    }

                    void navigate({
                      to: '/$topicId/quiz',
                      params: { topicId: topic.id },
                      search: {
                        answerFieldKeys: effectiveSelectedFieldKeys,
                        autoAdvanceAfterAnswer,
                        questionCount,
                        showCorrectAnswer,
                      },
                    });
                  }}
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

export default QuizConfig;
