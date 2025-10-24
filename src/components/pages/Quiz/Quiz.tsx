import { Box } from '@mui/material';
import type { Topic } from '../../../types/topics';

type QuizProps = {
  topic: Topic;
};

const Quiz = ({ topic }: QuizProps) => {
  return <Box>{topic.id}</Box>;
};

export default Quiz;
