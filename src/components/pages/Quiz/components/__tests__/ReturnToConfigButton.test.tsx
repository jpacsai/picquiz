import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ReturnToConfigButton from '../ReturnToConfigButton';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('ReturnToConfigButton', () => {
  it('navigates back to the quiz config page for the topic', async () => {
    const user = userEvent.setup();
    navigateMock.mockReset();
    navigateMock.mockResolvedValue(undefined);

    render(<ReturnToConfigButton topicId="art" />);

    await user.click(screen.getByRole('button', { name: 'Vissza a beállításokhoz' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      to: '/$topicId/quiz-config',
    });
  });
});
