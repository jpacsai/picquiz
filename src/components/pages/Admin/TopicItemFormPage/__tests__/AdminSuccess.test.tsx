import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminSuccessPage from '@/components/pages/Admin/TopicItemFormPage/AdminSuccessPage';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('AdminSuccessPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    navigateMock.mockResolvedValue(undefined);
  });

  it('renders the success message and lets the user start another upload', async () => {
    const user = userEvent.setup();

    render(<AdminSuccessPage topicId="art" topicLabel="Műalkotás" />);

    expect(screen.getByText('A(z) Műalkotás elem sikeresen elmentődött.')).toBeInTheDocument();
    expect(screen.getByText('Szeretnél feltölteni még egy képet?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Igen, feltöltök még egyet' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      to: '/$topicId/items/new',
    });
  });

  it('lets the user navigate back to the collection page', async () => {
    const user = userEvent.setup();

    render(<AdminSuccessPage topicId="art" topicLabel="Műalkotás" />);

    await user.click(screen.getByRole('button', { name: 'Vissza a listához' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      search: { saved: undefined },
      to: '/$topicId/items',
    });
  });
});
