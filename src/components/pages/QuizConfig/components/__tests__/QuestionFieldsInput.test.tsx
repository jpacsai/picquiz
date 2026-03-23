import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { QuizEligibleField } from '@/types/quiz';

import QuestionFieldsInput from '../QuestionFieldsInput';

const startableFields: QuizEligibleField[] = [
  {
    field: {
      key: 'artist',
      label: 'Művész',
      quiz: {
        enabled: true,
        prompt: 'Ki az alkotó?',
      },
      type: 'string',
    },
    eligibleItemCount: 10,
    maxQuestionCount: 8,
    promptsLabel: 'Ki az alkotó?',
    distinctValueCount: 6,
  },
  {
    field: {
      key: 'year',
      label: 'Év',
      quiz: {
        enabled: true,
        prompt: 'Mikor készült?',
      },
      type: 'number',
    },
    eligibleItemCount: 10,
    maxQuestionCount: 8,
    promptsLabel: 'Mikor készült?',
    distinctValueCount: 6,
  },
];

describe('QuestionFieldsInput', () => {
  it('renders all startable fields and toggles the selected checkbox', async () => {
    const user = userEvent.setup();
    const onToggleField = vi.fn();

    render(
      <QuestionFieldsInput
        startableFields={startableFields}
        effectiveSelectedFieldKeys={['artist']}
        onToggleField={onToggleField}
      />,
    );

    expect(screen.getByText('Kérdezett mezők')).toBeInTheDocument();

    const artistCheckbox = screen.getByRole('checkbox', {
      name: 'Művész - Ki az alkotó? - 10 elem, 6 különböző válaszlehetőség',
    });
    const yearCheckbox = screen.getByRole('checkbox', {
      name: 'Év - Mikor készült? - 10 elem, 6 különböző válaszlehetőség',
    });

    expect(artistCheckbox).toBeChecked();
    expect(yearCheckbox).not.toBeChecked();

    await user.click(yearCheckbox);

    expect(onToggleField).toHaveBeenCalledWith('year', true);
  });
});
