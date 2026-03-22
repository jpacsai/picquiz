import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TopicItem } from '@/service/items';

import type { Topic } from '../../../types/topics';

type QuizProps = {
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
};

const Quiz = ({ answerFieldKey, items, questionCount, topic }: QuizProps) => {
  const selectedField =
    topic.fields.find(
      (field) =>
        field.key === answerFieldKey && field.type !== 'imageUpload' && field.quiz?.enabled,
    ) ?? null;

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Kvíz előkészítve</Typography>
            {selectedField?.quiz?.enabled ? (
              <>
                <Typography color="text.secondary">{selectedField.quiz.prompt}</Typography>
                <Typography color="text.secondary">
                  A beállított kvíz {questionCount} kérdéssel indul majd a(z) {selectedField.label}{' '}
                  mezőre.
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                A kvíz konfigurációja hiányos vagy érvénytelen.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            {items.length} item van betöltve a(z) {topic.label} topikhoz. A következő lépésben erre
            a route-ra építjük rá a tényleges kérdésgenerálást.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Quiz;
