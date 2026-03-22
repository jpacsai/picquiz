import { Card, CardContent, Stack, Typography } from '@mui/material';

import ReturnToConfigButton from '@/components/pages/Quiz/components/ReturnToConfigButton';

type QuizMissingFieldsProps = {
  topicId: string;
};

const QuizMissingFields = ({ topicId }: QuizMissingFieldsProps) => {
  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Hiányos kvíz konfiguráció</Typography>
            <Typography color="text.secondary">
              Válassz érvényes kérdezett mezőt és kérdésszámot a kvíz indításához.
            </Typography>

            <ReturnToConfigButton topicId={topicId} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizMissingFields;
