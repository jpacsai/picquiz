import { Button } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

type ReturnToConfigButtonProps = {
  topicId: string;
};

const ReturnToConfigButton = ({ topicId }: ReturnToConfigButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        void navigate({
          to: '/$topicId/quiz-config',
          params: { topicId },
        });
      }}
      variant="outlined"
    >
      Vissza a beállításokhoz
    </Button>
  );
};

export default ReturnToConfigButton;
