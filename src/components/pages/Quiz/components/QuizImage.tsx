import { Box, useTheme } from '@mui/material';

type QuizImageProps = {
  topicLabel: string;
  currentQuestionCorrectAnswer: string;
  currentImageUrl: string;
};

const QuizImage = ({
  topicLabel,
  currentQuestionCorrectAnswer,
  currentImageUrl,
}: QuizImageProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 600,
      }}
    >
      <Box
        alt={`${topicLabel} - ${currentQuestionCorrectAnswer}`}
        component="img"
        src={currentImageUrl}
        sx={{
          width: '100%',
          maxHeight: 600,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default QuizImage;
