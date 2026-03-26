import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { QUERY_KEYS } from '@/queries/queryKeys';
import type { Topic } from '@/types/topics';

import TopicSchemaBuilderPage from './TopicSchemaBuilderPage';

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const setQueryDataMock = vi.fn();
const enqueueSnackbarMock = vi.fn();
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
    setQueryData: setQueryDataMock,
  }),
}));

vi.mock('@service/topics', () => ({
  createTopic: (...args: unknown[]) => createTopicMock(...args),
  updateTopic: (...args: unknown[]) => updateTopicMock(...args),
}));

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');

  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarMock,
    }),
  };
});

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
    setQueryDataMock.mockReset();
    enqueueSnackbarMock.mockReset();
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

  it('prefills a duplicated draft in create mode from a source topic', () => {
    const sourceTopic: Topic = {
      fields: [{ key: 'artist', label: 'Artist', type: 'string', required: true }],
      id: 'art',
      label: 'Muveszet',
      slug: 'art',
      storage_prefix: 'art',
    };

    render(<TopicSchemaBuilderPage mode="create" sourceTopic={sourceTopic} />);

    expect(screen.getByLabelText('Topic ID')).toHaveValue('');
    expect(screen.getByLabelText('Label')).toHaveValue('Muveszet masolat');
    expect(screen.getByLabelText('Slug')).toHaveValue('');
    expect(screen.getByLabelText('Storage prefix')).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'Artist' })).toBeInTheDocument();
  });

  it('shows the fixed image upload field in the list from the start', () => {
    render(<TopicSchemaBuilderPage mode="create" />);

    expect(screen.getByRole('heading', { name: 'Kepfeltoltes' })).toBeInTheDocument();
  });

  it('shows a live schema preview for form, quiz and system fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    expect(screen.getByText('Form mezok: 0')).toBeInTheDocument();
    expect(screen.queryByText('Field neve')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('checkbox', { name: 'Required' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Artist' }));

    const editDialog = await screen.findByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));
    await user.type(within(editDialog).getByLabelText('Quiz prompt'), 'Ki az alkoto?');
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    expect(screen.getByText('Form mezok: 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz mezok: 1')).toBeInTheDocument();
    expect(screen.getByText('Field neve')).toBeInTheDocument();
    expect(screen.getByText('Kulcs')).toBeInTheDocument();
    expect(screen.getByText('Tipus')).toBeInTheDocument();
    expect(screen.getByText('Kotelezo')).toBeInTheDocument();
    expect(screen.getByText('Dependency field-ek')).toBeInTheDocument();
    expect(screen.getByText('Kviz')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Artist' })).toBeInTheDocument();
    expect(screen.getByText('artist')).toBeInTheDocument();
    expect(screen.getByText('string')).toBeInTheDocument();
    expect(screen.getByText('Ki az alkoto?')).toBeInTheDocument();
    expect(screen.getAllByText('✓').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('heading', { name: 'Kepfeltoltes' }));

    const imageUploadDialog = await screen.findByRole('dialog', { name: 'Field szerkesztes' });
    await user.click(within(imageUploadDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Kepfeltoltes' })).toBeInTheDocument();
    expect(screen.getByText('image_upload')).toBeInTheDocument();
    expect(screen.getByText('imageUpload')).toBeInTheDocument();
    expect(screen.getByText('Rendszermezok')).toBeInTheDocument();
    expect(screen.getByText(/image_url_desktop/)).toBeInTheDocument();
  }, 10000);

  it('lists dependency fields in the schema preview table', () => {
    const topicWithDependencies: Topic = {
      fields: [
        { key: 'artist', label: 'Artist', type: 'string', required: true },
        { key: 'birth_year', label: 'Birth year', type: 'year' },
        {
          autocomplete: true,
          autocompleteCopyFields: ['birth_year'],
          key: 'artist_name',
          label: 'Artist name',
          type: 'string',
        },
        {
          fileNameFields: ['artist'],
          key: 'image_upload',
          label: 'Kepfeltoltes',
          required: true,
          targetFields: {
            desktop: 'image_url_desktop',
            desktopPath: 'image_path_desktop',
            mobile: 'image_url_mobile',
            mobilePath: 'image_path_mobile',
          },
          type: 'imageUpload',
        },
        {
          key: 'century',
          label: 'Century',
          quiz: {
            distractor: {
              deriveWith: 'yearToCentury',
              maxValue: 'todayYear',
              sourceField: 'birth_year',
              type: 'derivedRange',
            },
            enabled: true,
            prompt: 'Melyik szazad?',
          },
          type: 'yearRange',
        },
      ],
      id: 'art',
      label: 'Muveszet',
      slug: 'art',
      storage_prefix: 'art',
    };

    render(<TopicSchemaBuilderPage mode="edit" topic={topicWithDependencies} />);

    expect(screen.getByText('Dependency field-ek')).toBeInTheDocument();

    const dependencyTable = screen.getByRole('table');
    const tableRows = within(dependencyTable).getAllByRole('row');
    const artistNameRow = tableRows.find((row) => within(row).queryByText('Artist name'));
    const imageUploadRow = tableRows.find((row) => within(row).queryByText('Kepfeltoltes'));
    const centuryRow = tableRows.find((row) => within(row).queryByText('Century'));

    expect(artistNameRow).toBeDefined();
    expect(imageUploadRow).toBeDefined();
    expect(centuryRow).toBeDefined();
    expect(within(artistNameRow!).getByText('Birth year')).toBeInTheDocument();
    expect(within(imageUploadRow!).getByText('Artist')).toBeInTheDocument();
    expect(within(centuryRow!).getByText('Birth year')).toBeInTheDocument();
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
      to: '/admin/schemas',
    });
    expect(enqueueSnackbarMock).toHaveBeenCalledWith('Az uj topic schema elmentve.', {
      key: 'topic-schema-created',
      preventDuplicate: true,
      variant: 'success',
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
      params: { topicId: 'art' },
      to: '/admin/$topicId',
    });
    expect(enqueueSnackbarMock).toHaveBeenCalledWith('A topic schema modositasai elmentve.', {
      key: 'topic-schema-updated',
      preventDuplicate: true,
      variant: 'success',
    });
  });

  it('persists card display roles for fields in the schema', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.type(screen.getByLabelText('Topic ID'), 'portrait');
    await user.type(screen.getByLabelText('Label'), 'Portrek');
    await user.type(screen.getByLabelText('Slug'), 'portrait');
    await user.type(screen.getByLabelText('Storage prefix'), 'portrait');

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Name');
    await user.type(screen.getByLabelText('Field key'), 'name');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Name' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('combobox', { name: 'Card display' }));
    await user.click(screen.getByRole('option', { name: 'Title' }));
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Schema letrehozasa' }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith({
        topicId: 'portrait',
        values: {
          fields: [
            expect.objectContaining({
              display: 'title',
              key: 'name',
              label: 'Name',
              type: 'string',
            }),
          ],
          label: 'Portrek',
          slug: 'portrait',
          storage_prefix: 'portrait',
        },
      });
    });
  });

  it('persists autocomplete setting for string fields in the schema', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.type(screen.getByLabelText('Topic ID'), 'art');
    await user.type(screen.getByLabelText('Label'), 'Muveszet');
    await user.type(screen.getByLabelText('Slug'), 'art');
    await user.type(screen.getByLabelText('Storage prefix'), 'art');

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Artist' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Autocomplete' }));
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Schema letrehozasa' }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith({
        topicId: 'art',
        values: {
          fields: [
            expect.objectContaining({
              autocomplete: true,
              key: 'artist',
              label: 'Artist',
              type: 'string',
            }),
          ],
          label: 'Muveszet',
          slug: 'art',
          storage_prefix: 'art',
        },
      });
    });
  });

  it('persists autocomplete copy settings for string fields in the schema', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.type(screen.getByLabelText('Topic ID'), 'art');
    await user.type(screen.getByLabelText('Label'), 'Muveszet');
    await user.type(screen.getByLabelText('Slug'), 'art');
    await user.type(screen.getByLabelText('Storage prefix'), 'art');

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('checkbox', { name: 'Required' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Birth year');
    await user.type(screen.getByLabelText('Field key'), 'birth_year');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Year' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Death year');
    await user.type(screen.getByLabelText('Field key'), 'death_year');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Year' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Artist' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Autocomplete' }));
    await user.click(
      within(editDialog).getByRole('combobox', { name: 'Autocomplete copy fields' }),
    );
    await user.click(screen.getByRole('option', { name: 'Birth year' }));
    await user.click(screen.getByRole('option', { name: 'Death year' }));
    await user.keyboard('{Escape}');
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Schema letrehozasa' }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith({
        topicId: 'art',
        values: {
          fields: expect.arrayContaining([
            expect.objectContaining({
              autocomplete: true,
              autocompleteCopyFields: ['birth_year', 'death_year'],
              key: 'artist',
              label: 'Artist',
              required: true,
              type: 'string',
            }),
          ]),
          label: 'Muveszet',
          slug: 'art',
          storage_prefix: 'art',
        },
      });
    });
  });

  it('shows an error toast when schema save fails', async () => {
    const user = userEvent.setup();

    createTopicMock.mockRejectedValueOnce(new Error('Boom'));

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.type(screen.getByLabelText('Topic ID'), 'art');
    await user.type(screen.getByLabelText('Label'), 'Muveszet');
    await user.type(screen.getByLabelText('Slug'), 'art');
    await user.type(screen.getByLabelText('Storage prefix'), 'art');
    await user.click(screen.getByRole('button', { name: 'Schema letrehozasa' }));

    await waitFor(() => {
      expect(enqueueSnackbarMock).toHaveBeenCalledWith('Boom', {
        key: 'topic-schema-save-error',
        preventDuplicate: true,
        variant: 'error',
      });
    });

    expect(navigateMock).not.toHaveBeenCalled();
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

    expect(screen.getByRole('heading', { name: 'Ev' })).toBeInTheDocument();
    expect(screen.getByText('#1 | key: year | type: string')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

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
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Select' }));

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Select opciok'), {
      target: { value: 'Barokk, Reneszansz' },
    });

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

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.clear(within(editDialog).getByLabelText('Field label'));
    await user.type(within(editDialog).getByLabelText('Field label'), 'Evszam');
    await user.click(within(editDialog).getByRole('checkbox', { name: 'Required' }));

    expect(within(editDialog).getByLabelText('Field label')).toHaveValue('Evszam');
    expect(within(editDialog).getByRole('checkbox', { name: 'Required' })).toBeChecked();
  });

  it('allows configuring year field limits with a default todayYear maximum', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Year' }));

    expect(screen.getByLabelText('Maximum year')).toHaveValue('todayYear');

    await user.type(screen.getByLabelText('Minimum year'), '1500');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(within(editDialog).getByLabelText('Minimum year')).toHaveValue(1500);
    expect(within(editDialog).getByLabelText('Maximum year')).toHaveValue('todayYear');
  });

  it('allows configuring year range field limits with a default todayYear maximum', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Eletkor');
    await user.type(screen.getByLabelText('Field key'), 'lifespan');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Year range' }));

    expect(screen.getByLabelText('Maximum year')).toHaveValue('todayYear');

    await user.type(screen.getByLabelText('Minimum year'), '1500');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Eletkor' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(within(editDialog).getByLabelText('Minimum year')).toHaveValue(1500);
    expect(within(editDialog).getByLabelText('Maximum year')).toHaveValue('todayYear');
  });

  it('allows reordering fields from the field list with drag and drop', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Artist');
    await user.type(screen.getByLabelText('Field key'), 'artist');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Artist' }));

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Kesz',
      }),
    );

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

    await user.click(screen.getByRole('heading', { name: 'Title' }));

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Kesz',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    const dataTransfer = {
      effectAllowed: '',
      setData: vi.fn(),
    };

    fireEvent.dragStart(
      screen.getByRole('button', { name: 'Title athelyezese drag and droppal' }),
      {
        dataTransfer,
      },
    );
    fireEvent.dragOver(screen.getByTestId('field-card-artist'));
    fireEvent.drop(screen.getByTestId('field-card-artist'), {
      dataTransfer,
    });

    const fieldOrderCaptions = screen.getAllByText(/key:/).map((node) => node.textContent);

    expect(fieldOrderCaptions).toEqual([
      '#1 | key: title | type: string',
      '#2 | key: artist | type: string',
    ]);
  });

  it('keeps the fixed image upload field at the bottom of the list', () => {
    const topicWithMisorderedImageUpload: Topic = {
      fields: [
        { key: 'artist', label: 'Artist', required: true, type: 'string' },
        {
          fileNameFields: ['artist'],
          key: 'image_upload',
          label: 'Kepfeltoltes',
          required: true,
          targetFields: {
            desktop: 'image_url_desktop',
            desktopPath: 'image_path_desktop',
            mobile: 'image_url_mobile',
            mobilePath: 'image_path_mobile',
          },
          type: 'imageUpload',
        },
        { key: 'title', label: 'Title', type: 'string' },
      ],
      id: 'art',
      label: 'Muveszet',
      slug: 'art',
      storage_prefix: 'art',
    };

    render(<TopicSchemaBuilderPage mode="edit" topic={topicWithMisorderedImageUpload} />);

    const fieldOrderCaptions = screen.getAllByText(/key:/).map((node) => node.textContent);

    expect(fieldOrderCaptions).toEqual([
      '#1 | key: artist | type: string',
      '#2 | key: title | type: string',
    ]);
    expect(screen.getByTestId('fixed-image-upload-card')).toHaveTextContent(
      'Mindig a lista legaljan marad.',
    );
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

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Torles',
      }),
    );

    expect(screen.getByRole('dialog', { name: 'Field torlese' })).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field torlese' })).getByRole('button', {
        name: 'Torles',
      }),
    );

    expect(screen.queryByText('Ev')).not.toBeInTheDocument();
    expect(
      screen.getByText('Meg nincs field. Az `Uj field` gombbal tudsz uj mezot felvenni.'),
    ).toBeInTheDocument();
  });

  it('blocks deleting a field that is used by image upload file name fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Name');
    await user.type(screen.getByLabelText('Field key'), 'name');
    await user.click(screen.getByRole('checkbox', { name: 'Required' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Kepfeltoltes' }));

    const imageUploadDialog = await screen.findByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(imageUploadDialog).getByRole('combobox', { name: 'File name fields' }));
    await user.click(screen.getByRole('option', { name: 'Name' }));
    await user.keyboard('{Escape}');
    await user.click(within(imageUploadDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Name' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Torles',
      }),
    );

    expect(screen.getByRole('dialog', { name: 'Field nem torolheto' })).toBeInTheDocument();
    expect(
      screen.getByText('A(z) Name field most nem torolheto, mert mas mezok hivatkoznak ra.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Kepfeltoltes: a file-nevhez hasznalja')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Field torlese' })).not.toBeInTheDocument();
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

    await user.click(screen.getByRole('heading', { name: 'Korszak' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Select' }));

    const optionsInput = within(editDialog).getByLabelText('Select opciok');

    fireEvent.change(optionsInput, { target: { value: 'Barokk, Reneszansz' } });

    expect(optionsInput).toHaveValue('Barokk, Reneszansz');
    expect(screen.getByText('#1 | key: era | type: select')).toBeInTheDocument();
  });

  it('hides distractor type for select quiz fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Korszak');
    await user.type(screen.getByLabelText('Field key'), 'era');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Select' }));

    fireEvent.change(screen.getByLabelText('Select opciok'), {
      target: { value: 'Barokk, Reneszansz' },
    });

    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Korszak' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));

    expect(
      within(editDialog).queryByRole('combobox', { name: 'Distractor type' }),
    ).not.toBeInTheDocument();
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

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));
    await user.type(within(editDialog).getByLabelText('Quiz prompt'), 'Melyik ev?');
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const reopenedEditDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(
      within(reopenedEditDialog).getByRole('checkbox', { name: 'Quiz enabled' }),
    ).toBeChecked();
    expect(within(reopenedEditDialog).getByLabelText('Quiz prompt')).toHaveValue('Melyik ev?');
  });

  it('allows configuring numeric range distractors for number quiz fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Number' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));
    await user.type(within(editDialog).getByLabelText('Quiz prompt'), 'Melyik ev?');
    await user.click(within(editDialog).getByRole('combobox', { name: 'Distractor type' }));
    await user.click(screen.getByRole('option', { name: 'Numeric range' }));
    await user.type(within(editDialog).getByLabelText('Min offset'), '1');
    await user.type(within(editDialog).getByLabelText('Max offset'), '3');
    await user.clear(within(editDialog).getByLabelText('Max value'));
    await user.type(within(editDialog).getByLabelText('Max value'), '1900');
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    const reopenedEditDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(
      within(reopenedEditDialog).getByRole('combobox', { name: 'Distractor type' }),
    ).toHaveTextContent('Numeric range');
    expect(within(reopenedEditDialog).getByLabelText('Min offset')).toHaveValue('1');
    expect(within(reopenedEditDialog).getByLabelText('Max offset')).toHaveValue('3');
    expect(within(reopenedEditDialog).getByLabelText('Max value')).toHaveValue('1900');
  });

  it('allows configuring derived range distractors for string quiz fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Ev');
    await user.type(screen.getByLabelText('Field key'), 'year');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Number' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Ev' }));

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Kesz',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Szazad');
    await user.type(screen.getByLabelText('Field key'), 'century');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Szazad' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));
    await user.type(within(editDialog).getByLabelText('Quiz prompt'), 'Melyik szazad?');
    await user.click(within(editDialog).getByRole('combobox', { name: 'Distractor type' }));
    await user.click(screen.getByRole('option', { name: 'Derived range' }));
    await user.click(within(editDialog).getByRole('combobox', { name: 'Distractor source field' }));
    await user.click(screen.getByRole('option', { name: 'Ev' }));
    await user.click(within(editDialog).getByRole('button', { name: 'Kesz' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Szazad' }));

    const reopenedEditDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(
      within(reopenedEditDialog).getByRole('combobox', { name: 'Distractor type' }),
    ).toHaveTextContent('Derived range');
    expect(
      within(reopenedEditDialog).getByRole('combobox', { name: 'Distractor source field' }),
    ).toHaveTextContent('Ev');
  });

  it('disables distractor config when a string field has no usable source field', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Szazad');
    await user.type(screen.getByLabelText('Field key'), 'century');
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Szazad' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));

    expect(within(editDialog).getByRole('combobox', { name: 'Distractor type' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(
      within(editDialog).getByText('Ehhez a fieldhez most nincs hasznalhato distractor beallitas.'),
    ).toBeInTheDocument();
  });

  it('renders invalid numeric distractor values as empty so they stay editable', async () => {
    const invalidTopic: Topic = {
      ...topic,
      fields: [
        {
          key: 'year',
          label: 'Ev',
          type: 'number',
          quiz: {
            enabled: true,
            prompt: 'Melyik ev?',
            distractor: {
              type: 'numericRange',
              maxValue: Number.NaN,
            },
          },
        },
      ],
    };

    render(<TopicSchemaBuilderPage mode="edit" topic={invalidTopic} />);

    fireEvent.click(screen.getByRole('heading', { name: 'Ev' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(within(editDialog).getByLabelText('Max value')).toHaveValue('');
  });

  it('hides distractor type for boolean quiz fields', async () => {
    const user = userEvent.setup();

    render(<TopicSchemaBuilderPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Uj field' }));
    await user.type(screen.getByLabelText('Field label'), 'Publikalt');
    await user.type(screen.getByLabelText('Field key'), 'published');
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Boolean' }));
    await user.click(screen.getByRole('button', { name: 'Field hozzaadasa' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Uj field hozzaadasa' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Publikalt' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    await user.click(within(editDialog).getByRole('checkbox', { name: 'Quiz enabled' }));

    expect(
      within(editDialog).queryByRole('combobox', { name: 'Distractor type' }),
    ).not.toBeInTheDocument();
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

    await user.click(screen.getByRole('heading', { name: 'Artist' }));

    await user.click(
      within(screen.getByRole('dialog', { name: 'Field szerkesztes' })).getByRole('button', {
        name: 'Kesz',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('heading', { name: 'Kepfeltoltes' }));

    const editDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });
    const submitButton = within(editDialog).getByRole('button', { name: 'Kesz' });

    expect(within(editDialog).queryByLabelText('Field label')).not.toBeInTheDocument();
    expect(within(editDialog).queryByLabelText('Field key')).not.toBeInTheDocument();
    expect(within(editDialog).getByLabelText('Field type')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(
      within(editDialog).queryByRole('checkbox', { name: 'Required' }),
    ).not.toBeInTheDocument();
    expect(
      within(editDialog).queryByRole('checkbox', { name: 'Readonly' }),
    ).not.toBeInTheDocument();
    expect(
      within(editDialog).queryByRole('checkbox', { name: 'Hide in edit' }),
    ).not.toBeInTheDocument();
    expect(within(editDialog).getByLabelText('File name fields')).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.click(within(editDialog).getByRole('combobox', { name: 'File name fields' }));
    await user.click(screen.getByRole('option', { name: 'Artist' }));
    await user.keyboard('{Escape}');

    expect(
      within(editDialog).getByText(
        'A builder automatikusan kezeli a kepes rendszermezoket: `image_url_desktop`, `image_url_mobile`, `image_path_desktop`, `image_path_mobile`.',
      ),
    ).toBeInTheDocument();

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();
    });

    const persistedEditDialogTrigger = screen.getByRole('heading', { name: 'Kepfeltoltes' });

    expect(screen.getByRole('heading', { name: 'Kepfeltoltes' })).toBeInTheDocument();

    await user.click(persistedEditDialogTrigger);

    const persistedEditDialog = screen.getByRole('dialog', { name: 'Field szerkesztes' });

    expect(within(persistedEditDialog).getByLabelText('File name fields')).toHaveTextContent(
      'Artist',
    );
    expect(
      within(persistedEditDialog).getByText(
        'A builder automatikusan kezeli a kepes rendszermezoket: `image_url_desktop`, `image_url_mobile`, `image_path_desktop`, `image_path_mobile`.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the fixed image upload field disabled until it is configured', async () => {
    render(<TopicSchemaBuilderPage mode="create" />);

    expect(screen.getByTestId('fixed-image-upload-card')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('dialog', { name: 'Field szerkesztes' })).not.toBeInTheDocument();

    expect(
      screen.getByText(
        'Disabled, amig nincs keszre konfiguralva. Vegyel fel hozza legalabb egy required fieldet.',
      ),
    ).toBeInTheDocument();
  });
});
