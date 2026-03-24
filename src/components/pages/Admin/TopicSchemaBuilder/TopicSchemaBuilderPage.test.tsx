import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Topic } from '@/types/topics';

import TopicSchemaBuilderPage from './TopicSchemaBuilderPage';

vi.mock('@components/ui/RouterLink', () => ({
  RouterLink: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const topic: Topic = {
  fields: [],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

describe('TopicSchemaBuilderPage', () => {
  it('renders the metadata fields prefilled in edit mode', () => {
    render(<TopicSchemaBuilderPage mode="edit" topic={topic} />);

    expect(screen.getByLabelText('Topic ID')).toHaveValue('art');
    expect(screen.getByLabelText('Label')).toHaveValue('Muveszet');
  });

  it('shows metadata validation errors in create mode until required fields are filled', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    expect(screen.getAllByText('Topic id is required.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Topic label is required.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Topic slug is required.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Topic storage prefix is required.').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Topic ID'), 'art');
    await user.type(screen.getByLabelText('Label'), 'Muveszet');
    await user.type(screen.getByLabelText('Slug'), 'art');
    await user.type(screen.getByLabelText('Storage prefix'), 'art');

    expect(screen.getByText('A topic metadata jelenleg ervenyes.')).toBeInTheDocument();
  });

  it('adds a new field from the dialog', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));

    expect(screen.getByRole('dialog', { name: 'Uj field hozzaadasa' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    expect(screen.getByText('Ev')).toBeInTheDocument();
    expect(screen.getByText('key: year | type: string')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });
  });

  it('keeps the add field action disabled until the dialog fields are valid', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));

    const submitButton = screen.getByRole('button', { name: 'Field hozzaadasa' });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('Field label'), 'Korszak');
    await user.type(screen.getByLabelText('Field key'), 'era');

    expect(submitButton).toBeEnabled();
  });
});
