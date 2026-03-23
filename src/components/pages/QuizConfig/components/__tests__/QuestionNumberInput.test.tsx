import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import QuestionNumberInput from '../QuestionNumberInput';

describe('QuestionNumberInput', () => {
  it('renders the input and forwards input callbacks', () => {
    const onQuestionCountInputChange = vi.fn();
    const onQuestionCountBlur = vi.fn();
    const onQuestionCountSliderChange = vi.fn();

    render(
      <QuestionNumberInput
        questionCount={10}
        maxQuestionCount={12}
        minQuestionCount={4}
        onQuestionCountInputChange={onQuestionCountInputChange}
        onQuestionCountBlur={onQuestionCountBlur}
        onQuestionCountSliderChange={onQuestionCountSliderChange}
      />,
    );

    const input = screen.getByRole('spinbutton', { name: 'Kérdések száma' });

    expect(input).toHaveValue(10);
    expect(screen.getByRole('slider', { name: 'Kérdések száma' })).toHaveAttribute(
      'aria-valuemin',
      '4',
    );
    expect(screen.getByRole('slider', { name: 'Kérdések száma' })).toHaveAttribute(
      'aria-valuemax',
      '12',
    );
    expect(document.querySelectorAll('.MuiSlider-mark')).toHaveLength(4);

    fireEvent.change(input, {
      target: { value: '7' },
    });
    fireEvent.blur(input);

    expect(onQuestionCountInputChange).toHaveBeenCalledWith('7');
    expect(onQuestionCountBlur).toHaveBeenCalledTimes(1);
  });

  it('disables the controls when no question can be selected', () => {
    render(
      <QuestionNumberInput
        questionCount={0}
        maxQuestionCount={0}
        minQuestionCount={4}
        onQuestionCountInputChange={vi.fn()}
        onQuestionCountBlur={vi.fn()}
        onQuestionCountSliderChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('spinbutton', { name: 'Kérdések száma' })).toBeDisabled();
    expect(screen.getByRole('slider', { name: 'Kérdések száma' })).toBeDisabled();
  });
});
