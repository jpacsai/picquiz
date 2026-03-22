import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import OptionButton from './OptionButton';

const theme = createTheme();

const renderWithTheme = (ui: ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('OptionButton', () => {
  it('calls onSelectOption when the option is still selectable', async () => {
    const user = userEvent.setup();
    const onSelectOption = vi.fn();

    renderWithTheme(
      <OptionButton
        isAnswered={false}
        optionId="option-1"
        optionLabel="Option 1"
        onSelectOption={onSelectOption}
        isSelected={false}
        showCorrect={false}
        showIncorrect={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Option 1' }));

    expect(onSelectOption).toHaveBeenCalledWith('option-1');
  });

  it('renders as disabled after answering and applies the correct-answer styling', () => {
    renderWithTheme(
      <OptionButton
        isAnswered
        optionId="option-1"
        optionLabel="Option 1"
        onSelectOption={vi.fn()}
        isSelected={false}
        showCorrect
        showIncorrect={false}
      />,
    );

    const button = screen.getByRole('button', { name: 'Option 1' });

    expect(button).toBeDisabled();
    expect(button).toHaveStyle({
      borderColor: theme.palette.success.main,
      color: theme.palette.success.main,
    });
  });

  it('applies the incorrect-answer styling for a selected wrong answer', () => {
    renderWithTheme(
      <OptionButton
        isAnswered
        optionId="option-1"
        optionLabel="Option 1"
        onSelectOption={vi.fn()}
        isSelected
        showCorrect={false}
        showIncorrect
      />,
    );

    expect(screen.getByRole('button', { name: 'Option 1' })).toHaveStyle({
      borderColor: theme.palette.error.main,
      color: theme.palette.error.main,
    });
  });
});
