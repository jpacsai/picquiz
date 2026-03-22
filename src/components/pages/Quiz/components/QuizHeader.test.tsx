import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import QuizHeader from './QuizHeader';

describe('QuizHeader', () => {
  it('renders the prompt and the current progress', () => {
    render(<QuizHeader questionLength={10} currentQuestionIndex={2} prompt="Melyik kep ez?" />);

    expect(screen.getByText('Melyik kep ez?')).toBeInTheDocument();
    expect(screen.getByText('10 / 3')).toBeInTheDocument();
  });
});
