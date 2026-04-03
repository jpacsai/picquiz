import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Topic } from '@/types/topics';

import AdminPage from './AdminPage';

const navigateMock = vi.fn();

vi.mock('@components/ui/RouterLink', () => ({
  RouterLink: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const topics: ReadonlyArray<Topic> = [
  {
    fields: [],
    id: 'art',
    label: 'Muveszet',
    slug: 'art',
    storage_prefix: 'art',
  },
  {
    fields: [],
    id: 'history',
    label: 'Tortenelem',
    slug: 'history',
    storage_prefix: 'history',
  },
];

describe('AdminPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('opens the new schema dialog from the admin page action', async () => {
    const user = userEvent.setup();

    render(
      <AdminPage
        defaultSchemaCreationMode="create"
        isCreateSchemaDialogOpen={false}
        topics={topics}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Új séma' }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/newTopic',
    });
  });

  it('starts schema creation directly from the dialog', async () => {
    const user = userEvent.setup();

    render(
      <AdminPage
        defaultSchemaCreationMode="create"
        isCreateSchemaDialogOpen
        topics={topics}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Létrehozás folytatása' }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/newTopic',
    });
  });

  it('lets the user select an existing schema before duplication', async () => {
    const user = userEvent.setup();

    render(
      <AdminPage
        defaultSchemaCreationMode="duplicate"
        isCreateSchemaDialogOpen
        topics={topics}
      />,
    );

    const continueButton = screen.getByRole('button', { name: 'Duplikálás folytatása' });

    expect(continueButton).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Meglévő séma duplikálása' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Muveszet' }));
    await user.click(continueButton);

    expect(navigateMock).toHaveBeenCalledWith({
      search: { sourceTopicId: 'art' },
      to: '/newTopic',
    });
  });
});
