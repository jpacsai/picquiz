import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuizQuestionOption } from '@/types/quiz';

import QuizOptions from './QuizOptions';

type OptionButtonProps = {
  isAnswered: boolean;
  isSelected: boolean;
  onSelectOption: (optionId: string) => void;
  optionId: string;
  optionLabel: string;
  showCorrect: boolean;
  showIncorrect: boolean;
};

const optionButtonMock = vi.fn<(props: OptionButtonProps) => ReactElement>();

vi.mock('./OptionButton', () => ({
  default: (props: OptionButtonProps) => {
    optionButtonMock(props);

    return <div data-testid={`option-${props.optionId}`}>{props.optionLabel}</div>;
  },
}));

const options: QuizQuestionOption[] = [
  {
    id: 'correct',
    isCorrect: true,
    label: 'Correct answer',
  },
  {
    id: 'wrong',
    isCorrect: false,
    label: 'Wrong answer',
  },
];

describe('QuizOptions', () => {
  beforeEach(() => {
    optionButtonMock.mockClear();
  });

  it('shows the correct answer and the selected incorrect answer after a wrong guess', () => {
    render(
      <QuizOptions
        options={options}
        isAnswered
        selectedOptionId="wrong"
        showCorrectAnswer
        onSelectOption={vi.fn()}
      />,
    );

    expect(screen.getByTestId('option-correct')).toBeInTheDocument();
    expect(screen.getByTestId('option-wrong')).toBeInTheDocument();

    expect(optionButtonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        isSelected: false,
        optionId: 'correct',
        showCorrect: true,
        showIncorrect: false,
      }),
    );
    expect(optionButtonMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        isSelected: true,
        optionId: 'wrong',
        showCorrect: false,
        showIncorrect: true,
      }),
    );
  });

  it('keeps the selected correct answer green even when showing correct answers is turned off', () => {
    render(
      <QuizOptions
        options={options}
        isAnswered
        selectedOptionId="correct"
        showCorrectAnswer={false}
        onSelectOption={vi.fn()}
      />,
    );

    expect(optionButtonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        isSelected: true,
        optionId: 'correct',
        showCorrect: true,
        showIncorrect: false,
      }),
    );
    expect(optionButtonMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        isSelected: false,
        optionId: 'wrong',
        showCorrect: false,
        showIncorrect: false,
      }),
    );
  });
});
