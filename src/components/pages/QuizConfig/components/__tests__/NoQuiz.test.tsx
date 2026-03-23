import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { QuizEligibleField } from '@/types/quiz';

import NoQuiz from '../NoQuiz';

const eligibleFields: QuizEligibleField[] = [
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
    eligibleItemCount: 8,
    maxQuestionCount: 6,
    promptsLabel: 'Ki az alkotó?',
    distinctValueCount: 5,
  },
];

describe('NoQuiz', () => {
  it('renders the fallback message when there are no eligible fields', () => {
    render(<NoQuiz eligibleFields={[]} />);

    expect(
      screen.getByText('Ehhez a topikhoz jelenleg nincs indítható quiz beállítás.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ehhez a topikhoz még nincs quizre engedélyezett mező beállítva.'),
    ).toBeInTheDocument();
  });

  it('renders the eligible field summary when quiz fields exist', () => {
    render(<NoQuiz eligibleFields={eligibleFields} />);

    expect(screen.getByText('Művész: 8 használható item, 5 különböző válasz.')).toBeInTheDocument();
  });
});
