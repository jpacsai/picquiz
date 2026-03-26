import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import QuizAnswered from '../QuizAnswered';

describe('QuizAnswered', () => {
  it('renders a continue button before the last question and calls the handler', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();

    render(
      <QuizAnswered
        autoAdvanceAfterAnswer={false}
        autoAdvanceCountdownSeconds={3}
        answerDetails={[]}
        currentQuestionIndex={0}
        questionsLength={3}
        showAnswerDetails={false}
        onContinue={onContinue}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Következő kérdés' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders the result button on the last question when auto-advance is off', () => {
    render(
      <QuizAnswered
        autoAdvanceAfterAnswer={false}
        autoAdvanceCountdownSeconds={3}
        answerDetails={[]}
        currentQuestionIndex={2}
        questionsLength={3}
        showAnswerDetails={false}
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Eredmény megtekintése' })).toBeInTheDocument();
  });

  it('renders the auto-advance message before the last question', () => {
    render(
      <QuizAnswered
        autoAdvanceAfterAnswer
        autoAdvanceCountdownSeconds={3}
        answerDetails={[]}
        currentQuestionIndex={0}
        questionsLength={3}
        showAnswerDetails={false}
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByText('Következő kérdés 3 másodperc múlva.')).toBeInTheDocument();
  });

  it('renders the result auto-advance message on the last question', () => {
    render(
      <QuizAnswered
        autoAdvanceAfterAnswer
        autoAdvanceCountdownSeconds={1}
        answerDetails={[]}
        currentQuestionIndex={2}
        questionsLength={3}
        showAnswerDetails={false}
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByText('Eredmény megjelenítése 1 másodperc múlva.')).toBeInTheDocument();
  });

  it('renders answer details when they should be shown', () => {
    render(
      <QuizAnswered
        autoAdvanceAfterAnswer={false}
        autoAdvanceCountdownSeconds={3}
        answerDetails={[
          {
            key: 'artist',
            label: 'Alkotó',
            value: 'Leonardo da Vinci',
          },
        ]}
        currentQuestionIndex={0}
        questionsLength={3}
        showAnswerDetails
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByText(/Leonardo da Vinci/i)).toBeInTheDocument();
  });

  it('renders boolean answer details with the shared icon component', () => {
    render(
      <QuizAnswered
        autoAdvanceAfterAnswer={false}
        autoAdvanceCountdownSeconds={3}
        answerDetails={[
          {
            booleanValue: false,
            key: 'self_portrait',
            label: 'Önarckép',
            value: 'Hamis',
          },
        ]}
        currentQuestionIndex={0}
        questionsLength={3}
        showAnswerDetails
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Önarckép: Hamis' })).toBeInTheDocument();
  });
});
