import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { QuizEligibleField } from '@/types/quiz';

import SelectedFieldsSummary from '../SelectedFieldsSummary';

const selectedFields: QuizEligibleField[] = [
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
    eligibleItemCount: 12,
    maxQuestionCount: 10,
    promptsLabel: 'Ki az alkotó?',
    distinctValueCount: 7,
  },
];

describe('SelectedFieldsSummary', () => {
  it('renders nothing when no fields are selected', () => {
    const { container } = render(<SelectedFieldsSummary selectedFields={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the selected field summary rows', () => {
    render(<SelectedFieldsSummary selectedFields={selectedFields} />);

    expect(
      screen.getByText('Művész: 12 használható item, 7 különböző válaszlehetőség.'),
    ).toBeInTheDocument();
  });
});
