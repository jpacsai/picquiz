import { Card, CardContent, Typography } from '@mui/material';

const EmptyCollectionCard = () => {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="body1">
          Ebben a collectionben még nincs feltöltött item.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmptyCollectionCard;
