import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import QuizError from '../QuizError';
import QuizFinished from '../QuizFinished';
import QuizMissingFields from '../QuizMissingFields';

const returnToConfigButtonMock = vi.fn<(topicId: string) => void>();

vi.mock('./ReturnToConfigButton', () => ({
  default: ({ topicId }: { topicId: string }) => {
    returnToConfigButtonMock(topicId);

    return <button type="button">Vissza a beállításokhoz</button>;
  },
}));

describe('Quiz state cards', () => {
  it('renders the missing-fields state with the return button', () => {
    returnToConfigButtonMock.mockClear();

    render(<QuizMissingFields topicId="art" />);

    expect(screen.getByText('Hiányos kvíz konfiguráció')).toBeInTheDocument();
    expect(
      screen.getByText('Válassz érvényes kérdezett mezőt és kérdésszámot a kvíz indításához.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vissza a beállításokhoz' })).toBeInTheDocument();
    expect(returnToConfigButtonMock).toHaveBeenCalledWith('art');
  });

  it('renders the error state with the return button', () => {
    returnToConfigButtonMock.mockClear();

    render(<QuizError topicId="art" />);

    expect(screen.getByText('Nem indítható a kvíz')).toBeInTheDocument();
    expect(
      screen.getByText('A kiválasztott mezőhöz nincs elég használható item vagy válaszlehetőség.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vissza a beállításokhoz' })).toBeInTheDocument();
    expect(returnToConfigButtonMock).toHaveBeenCalledWith('art');
  });

  it('renders the finished state and restarts the quiz', async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    returnToConfigButtonMock.mockClear();

    render(<QuizFinished score={7} questionsLength={10} onRestart={onRestart} topicId="art" />);

    expect(screen.getByText('Kvíz vége')).toBeInTheDocument();
    expect(screen.getByText('7 / 10 helyes válasz.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vissza a beállításokhoz' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Újraindítás' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(returnToConfigButtonMock).toHaveBeenCalledWith('art');
  });
});
