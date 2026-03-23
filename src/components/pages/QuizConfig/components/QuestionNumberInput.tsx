import { Box, FormControl, Input, Slider, Typography } from '@mui/material';

type QuestionNumberInputProps = {
  questionCount: number;
  maxQuestionCount: number;
  minQuestionCount: number;
  onQuestionCountInputChange: (value: string) => void;
  onQuestionCountBlur: () => void;
  onQuestionCountSliderChange: (value: number) => void;
};

const QuestionNumberInput = ({
  questionCount,
  maxQuestionCount,
  minQuestionCount,
  onQuestionCountInputChange,
  onQuestionCountBlur,
  onQuestionCountSliderChange,
}: QuestionNumberInputProps) => {
  const sliderMax = Math.max(maxQuestionCount, 1);

  const sliderMin =
    maxQuestionCount > 0 ? (minQuestionCount < sliderMax ? minQuestionCount : sliderMax) : 1;

  const sliderMarks = Array.from(
    new Set([
      sliderMin,
      sliderMax,
      ...Array.from({ length: Math.floor(sliderMax / 5) }, (_, index) => (index + 1) * 5).filter(
        (value) => value >= sliderMin && value <= sliderMax,
      ),
    ]),
  )
    .sort((left, right) => left - right)
    .map((value) => ({ value }));

  return (
    <FormControl fullWidth>
      <Typography id="quiz-question-count-label" variant="subtitle2">
        Kérdések száma (max: {maxQuestionCount})
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Input
          id="quiz-question-count-input"
          value={questionCount}
          size="small"
          onChange={(event) => {
            onQuestionCountInputChange(event.target.value);
          }}
          onBlur={onQuestionCountBlur}
          inputProps={{
            step: 1,
            min: minQuestionCount,
            max: sliderMax,
            type: 'number',
            'aria-labelledby': 'quiz-question-count-label',
          }}
          disabled={maxQuestionCount <= 0}
          sx={{ width: 56 }}
        />
        <Slider
          aria-label="Kérdések száma"
          value={typeof questionCount === 'number' ? questionCount : 0}
          onChange={(_event, value) => onQuestionCountSliderChange(value)}
          marks={sliderMarks}
          min={sliderMin}
          max={sliderMax}
          step={null}
          disabled={maxQuestionCount <= 0}
          sx={{ mr: 2 }}
        />
      </Box>
    </FormControl>
  );
};

export default QuestionNumberInput;
