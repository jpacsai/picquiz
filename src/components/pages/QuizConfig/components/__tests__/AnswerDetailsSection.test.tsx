import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { QuizValueField } from '@/types/quiz';

import AnswerDetailsSection from '../AnswerDetailsSection';

const answerDetailFields: QuizValueField[] = [
  {
    key: 'artist',
    label: 'Alkotó',
    type: 'string',
  },
  {
    key: 'year',
    label: 'Év',
    quiz: {
      enabled: true,
      prompt: 'Melyik évben készült?',
    },
    type: 'number',
  },
];

describe('AnswerDetailsSection', () => {
  it('does not render field checkboxes when disabled', () => {
    render(
      <AnswerDetailsSection
        answerDetailsEnabled={false}
        answerDetailFieldKeys={[]}
        answerDetailFields={answerDetailFields}
        onToggleAnswerDetailField={vi.fn()}
      />,
    );

    expect(screen.queryByText('Helyes válasz extra adatai')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Alkotó' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Év' })).not.toBeInTheDocument();
  });

  it('renders all available fields and forwards checkbox changes', async () => {
    const user = userEvent.setup();
    const onToggleAnswerDetailField = vi.fn();

    render(
      <AnswerDetailsSection
        answerDetailsEnabled
        answerDetailFieldKeys={['artist']}
        answerDetailFields={answerDetailFields}
        onToggleAnswerDetailField={onToggleAnswerDetailField}
      />,
    );

    expect(screen.getByText('Helyes válasz extra adatai')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Alkotó' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Év' })).not.toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Év' }));

    expect(onToggleAnswerDetailField).toHaveBeenCalledWith('year', true);
  });
});
