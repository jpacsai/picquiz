import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Topic } from '@/types/topics';

type QuizConfigProps = {
  topic: Topic;
};

const QuizConfig = ({ topic }: QuizConfigProps) => {
  const quizFields = topic.fields.filter((field) => field.quiz?.enabled);

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Kvíz beállítások</Typography>
            <Typography color="text.secondary">
              A következő lépésben itt fogjuk kiválasztani, hogy a(z) {topic.label} topikban
              melyik mezőre kérdezzen rá a kvíz, és hány kérdést tegyen fel.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">Kvízhez engedélyezett mezők</Typography>
            {quizFields.length ? (
              quizFields.map((field) => (
                <Typography key={field.key}>
                  {field.label}
                  {field.quiz?.enabled ? ` - ${field.quiz.prompt}` : ''}
                </Typography>
              ))
            ) : (
              <Typography color="text.secondary">
                Ehhez a topikhoz még nincs quizre engedélyezett mező beállítva.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizConfig;
