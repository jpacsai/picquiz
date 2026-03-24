import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { QUERY_KEYS } from '@/queries/queryKeys';
import type { Topic } from '@/types/topics';

import TopicSchemaBuilderPage from './TopicSchemaBuilderPage';

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const createTopicMock = vi.fn();
const updateTopicMock = vi.fn();

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

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

vi.mock('@service/topics', () => ({
  createTopic: (...args: unknown[]) => createTopicMock(...args),
  updateTopic: (...args: unknown[]) => updateTopicMock(...args),
}));

const topic: Topic = {
  fields: [],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

describe('TopicSchemaBuilderPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    invalidateQueriesMock.mockReset();
    createTopicMock.mockReset();
    updateTopicMock.mockReset();

    navigateMock.mockResolvedValue(undefined);
    invalidateQueriesMock.mockResolvedValue(undefined);
    createTopicMock.mockResolvedValue(undefined);
    updateTopicMock.mockResolvedValue(undefined);
  });

  it('renders the metadata fields prefilled in edit mode', () => {
    render(<TopicSchemaBuilderPage mode="edit" topic={topic} />);

    expect(screen.getByLabelText('Topic ID')).toHaveValue('art');
    expect(screen.getByLabelText('Label')).toHaveValue('Muveszet');
    expect(screen.getByLabelText('Topic ID')).toBeDisabled();
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

  it('creates a topic schema and navigates back to admin', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.type(screen.getByLabelText('Topic ID'), 'art');
    await user.type(screen.getByLabelText('Label'), 'Muveszet');
    await user.type(screen.getByLabelText('Slug'), 'art');
    await user.type(screen.getByLabelText('Storage prefix'), 'art');
    await user.click(screen.getByRole('button', { name: 'Schema letrehozasa' }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith({
        topicId: 'art',
        values: {
          fields: [],
          label: 'Muveszet',
          slug: 'art',
          storage_prefix: 'art',
        },
      });
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.TOPICS.list(),
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.TOPICS.byId('art'),
    });
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/admin',
    });
  });

  it('updates an existing topic schema and navigates back to admin', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="edit" topic={topic} />);

    await user.clear(screen.getByLabelText('Label'));
    await user.type(screen.getByLabelText('Label'), 'Muveszet 2');
    await user.click(screen.getByRole('button', { name: 'Valtozasok mentese' }));

    await waitFor(() => {
      expect(updateTopicMock).toHaveBeenCalledWith({
        topicId: 'art',
        values: {
          fields: [],
          label: 'Muveszet 2',
          slug: 'art',
          storage_prefix: 'art',
        },
      });
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.TOPICS.list(),
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.TOPICS.byId('art'),
    });
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/admin',
    });
  });

  it('adds a new field from the dialog', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));

    expect(screen.getByRole('dialog', { name: 'Uj field hozzaadasa' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('checkbox', { name: 'Required' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    expect(screen.getByText('Ev')).toBeInTheDocument();
    expect(screen.getByText('#1 | key: year | type: string')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });
    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(editDialog).toBeInTheDocument();
    expect(within(editDialog).getByRole('checkbox', { name: 'Required' })).toBeChecked();
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

  it('allows editing the selected field basics from the edit dialog', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.clear(within(editDialog).getByLabelText('Field label'));
    await user.type(within(editDialog).getByLabelText('Field label'), 'Evszam');
    await user.click(within(editDialog).getByRole('checkbox', { name: 'Required' }));

    expect(screen.getByText('Evszam')).toBeInTheDocument();
    expect(within(editDialog).getByRole('checkbox', { name: 'Required' })).toBeChecked();
  });

  it('allows reordering fields from the field list', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Title');
    await user.type(screen.getByLabelText('Field key'), 'title');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Title mozgatasa felfele' }));

    const fieldOrderCaptions = screen.getAllByText(/key:/).map((node) => node.textContent);

    expect(fieldOrderCaptions).toEqual([
      '#1 | key: title | type: string',
      '#2 | key: artist | type: string',
    ]);
  });

  it('allows deleting the selected field', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', { name: 'Torles' }));

    expect(screen.queryByText('Ev')).not.toBeInTheDocument();
    expect(screen.getByText('Meg nincs field. Az `Uj field` gombbal tudsz uj mezot felvenni.')).toBeInTheDocument();
  });

  it('allows editing select options for a select field', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Korszak');
    await user.type(screen.getByLabelText('Field key'), 'era');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Select' }));

    const optionsInput = within(editDialog).getByLabelText('Select opciok');

    fireEvent.change(optionsInput, { target: { value: 'Barokk\nReneszansz' } });

    expect(optionsInput).toHaveValue('Barokk\nReneszansz');
    expect(screen.getByText('#1 | key: era | type: select')).toBeInTheDocument();
  });

  it('allows enabling quiz and editing the quiz prompt for eligible fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    let editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));
    await user.type(within(editDialog).getByLabelText('Quiz prompt'), 'Melyik ev?');
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Ev'));

    editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' })).toBeChecked();
    expect(within(editDialog).getByLabelText('Quiz prompt')).toHaveValue('Melyik ev?');
  });

  it('allows configuring image upload fields from the dialog', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('checkbox', { name: 'Required' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Uj field' }));

    await user.type(screen.getByLabelText('Field label'), 'Borito kep');
    await user.type(screen.getByLabelText('Field key'), 'coverImage');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Image upload' }));

    const submitButton = screen.getByRole('button', { name: 'Field hozzaadasa' });

    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'File name fields' }));
    await user.click(screen.getByRole('option', { name: 'Artist' }));
    await user.keyboard('{Escape}');
    await user.type(screen.getByLabelText('Desktop target field'), 'desktopImage');
    await user.type(screen.getByLabelText('Mobile target field'), 'mobileImage');
    await user.type(screen.getByLabelText('Desktop path field'), 'desktopPath');
    await user.type(screen.getByLabelText('Mobile path field'), 'mobilePath');

    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(screen.getByText('Borito kep')).toBeInTheDocument();
    expect(screen.getByText('#2 | key: coverImage | type: imageUpload')).toBeInTheDocument();
    expect(within(editDialog).getByLabelText('File name fields')).toHaveTextContent('Artist');
    expect(within(editDialog).getByLabelText('Desktop target field')).toHaveValue('desktopImage');
    expect(within(editDialog).getByLabelText('Desktop path field')).toHaveValue('desktopPath');
  });
});
