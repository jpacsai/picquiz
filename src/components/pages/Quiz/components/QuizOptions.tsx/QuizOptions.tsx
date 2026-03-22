import { Box } from '@mui/material';

import OptionButton from '@/components/pages/Quiz/components/QuizOptions.tsx/OptionButton';
import type { QuizQuestionOption } from '@/components/pages/Quiz/utils';

type QuizOptionsProps = {
  options: QuizQuestionOption[];
  isAnswered: boolean;
  selectedOptionId: string;
  showCorrectAnswer: boolean;
  onSelectOption: (optionId: string) => void;
};

const QuizOptions = ({
  options,
  isAnswered,
  selectedOptionId,
  showCorrectAnswer,
  onSelectOption,
}: QuizOptionsProps) => {
  return (
    <Box
      sx={{
        marginTop: 'auto',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
        },
      }}
    >
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const showCorrect =
          (isAnswered && option.isCorrect && showCorrectAnswer) || (isSelected && option.isCorrect);
        const showIncorrect = isAnswered && isSelected && !option.isCorrect;

        return (
          <OptionButton
            key={option.id}
            optionId={option.id}
            optionLabel={option.label}
            isAnswered={isAnswered}
            onSelectOption={onSelectOption}
            isSelected={isSelected}
            showCorrect={showCorrect}
            showIncorrect={showIncorrect}
          />
        );
      })}
    </Box>
  );
};

export default QuizOptions;
