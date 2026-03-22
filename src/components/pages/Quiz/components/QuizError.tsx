import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

type QuizErrorProps = {
  onReturnToConfig: () => void;
};

const QuizError = ({ onReturnToConfig }: QuizErrorProps) => {
  return (
    <Stack spacing={3}>
      <Card sx={{ width: '100%' }} variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Nem indítható a kvíz</Typography>
            <Typography color="text.secondary">
              A kiválasztott mezőhöz nincs elég használható item vagy válaszlehetőség.
            </Typography>
            <Button onClick={onReturnToConfig} variant="contained">
              Vissza a beállításokhoz
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default QuizError;
