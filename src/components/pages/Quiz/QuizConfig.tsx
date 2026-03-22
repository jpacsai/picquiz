import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import { getEligibleQuizFields, getQuestionCountOptions } from './utils';

type QuizConfigProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const QuizConfig = ({ items, topic }: QuizConfigProps) => {
  const navigate = useNavigate();
  const eligibleFields = getEligibleQuizFields({ items, topic });
  const startableFields = eligibleFields.filter((field) => field.maxQuestionCount > 0);
  const [selectedFieldKey, setSelectedFieldKey] = useState('');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(true);

  const selectedField =
    startableFields.find((field) => field.field.key === selectedFieldKey) ??
    startableFields[0] ??
    null;
  const questionCountOptions = getQuestionCountOptions(selectedField?.maxQuestionCount ?? 0);
  const questionCount = questionCountOptions.includes(selectedQuestionCount)
    ? selectedQuestionCount
    : (questionCountOptions[0] ?? 0);

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Kvíz beállítások</Typography>
            <Typography color="text.secondary">
              A következő lépésben itt fogjuk kiválasztani, hogy a(z) {topic.label} topikban melyik
              mezőre kérdezzen rá a kvíz, és hány kérdést tegyen fel.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">Kvíz beállításai</Typography>

            {startableFields.length ? (
              <>
                <FormControl fullWidth>
                  <InputLabel id="quiz-answer-field-label">Kérdezett mező</InputLabel>
                  <Select
                    id="quiz-answer-field"
                    label="Kérdezett mező"
                    labelId="quiz-answer-field-label"
                    onChange={(event: SelectChangeEvent<string>) => {
                      setSelectedFieldKey(event.target.value);
                      setSelectedQuestionCount(0);
                    }}
                    value={selectedField?.field.key ?? ''}
                  >
                    {startableFields.map(({ field, promptsLabel }) => (
                      <MenuItem key={field.key} value={field.key}>
                        {field.label} - {promptsLabel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

                {selectedField ? (
                  <Typography color="text.secondary">
                    {selectedField.eligibleItemCount} használható item,{' '}
                    {selectedField.distinctValueCount} különböző válaszlehetőség érhető el a(z){' '}
                    {selectedField.field.label} mezőhöz.
                  </Typography>
                ) : null}

                <Button
                  disabled={!selectedField || !questionCount}
                  onClick={() => {
                    if (!selectedField || !questionCount) {
                      return;
                    }

                    void navigate({
                      to: '/$topicId/quiz',
                      params: { topicId: topic.id },
                      search: {
                        answerFieldKey: selectedField.field.key,
                        questionCount,
                        showCorrectAnswer,
                      },
                    });
                  }}
                  size="large"
                  variant="contained"
                >
                  Start kvíz
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
