import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import TopicItemForm from '../TopicItemForm';

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const setQueryDataMock = vi.fn();
const createTopicItemMock = vi.fn();
const updateTopicItemMock = vi.fn();
const uploadResponsiveTopicImagesMock = vi.fn();
const deleteTopicImageByPathMock = vi.fn();
const generateResponsiveImageVariantsMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
    setQueryData: setQueryDataMock,
  }),
}));

vi.mock('@tanstack/react-router', async () => {
  return {
    useNavigate: () => navigateMock,
  };
});

vi.mock('@service/items', () => ({
  createTopicItem: (...args: unknown[]) => createTopicItemMock(...args),
  updateTopicItem: (...args: unknown[]) => updateTopicItemMock(...args),
}));

vi.mock('@data/storage', async () => {
  const actual = await vi.importActual('@data/storage');

  return {
    ...actual,
    deleteTopicImageByPath: (...args: unknown[]) => deleteTopicImageByPathMock(...args),
    uploadResponsiveTopicImages: (...args: unknown[]) => uploadResponsiveTopicImagesMock(...args),
  };
});

vi.mock('@lib/image', () => ({
  generateResponsiveImageVariants: (...args: unknown[]) =>
    generateResponsiveImageVariantsMock(...args),
}));

vi.mock('@/components/ui/Form/ImageUploadField', () => ({
  default: ({
    onSelectImage,
  }: {
    onSelectImage: (selection: { file: File; uniqueSuffix: string }) => void;
  }) => (
    <button
      data-testid="mock-image-upload-button"
      type="button"
      onClick={() => {
        onSelectImage({
          file: new File(['image-bytes'], 'monalisa.jpg', { type: 'image/jpeg' }),
          uniqueSuffix: 'unique1234',
        });
      }}
    >
      Mock image upload
    </button>
  ),
}));

describe('TopicItemForm saving', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    invalidateQueriesMock.mockReset();
    setQueryDataMock.mockReset();
    createTopicItemMock.mockReset();
    updateTopicItemMock.mockReset();
    uploadResponsiveTopicImagesMock.mockReset();
    deleteTopicImageByPathMock.mockReset();
    generateResponsiveImageVariantsMock.mockReset();

    createTopicItemMock.mockResolvedValue({ id: 'doc-1' });
    updateTopicItemMock.mockResolvedValue(undefined);
    invalidateQueriesMock.mockResolvedValue(undefined);
    setQueryDataMock.mockReturnValue(undefined);
    deleteTopicImageByPathMock.mockResolvedValue(undefined);
    navigateMock.mockResolvedValue(undefined);
  });

  it('omits empty optional fields from the Firestore payload', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'year', label: 'Year', type: 'number' },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    expect(screen.getByRole('button', { name: 'Mentés' })).toBeDisabled();

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(createTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        values: {
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
        },
      });
    });

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      to: '/admin/$topicId/success',
    });
  });

  it('renders boolean fields as toggles and persists their boolean value', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'published', label: 'Published', type: 'boolean' },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.click(screen.getByRole('switch', { name: 'Published' }));
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(createTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        values: {
          artist: 'Leonardo da Vinci',
          published: true,
        },
      });
    });
  });

  it('validates year fields against configured minimum and maximum values', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'year', label: 'Year', type: 'year', min: 1500, max: 1600 },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-year'), '1490');

    expect(await screen.findByText('Must be at least 1500')).toBeInTheDocument();

    await user.clear(screen.getByTestId('form-input-year'));
    await user.type(screen.getByTestId('form-input-year'), '1605');

    expect(await screen.findByText('Must be at most 1600')).toBeInTheDocument();
  });

  it('renders year range fields as from-to inputs and persists the derived string value', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'lifespan', label: 'Szuletes-halal', type: 'yearRange', min: 1500, max: 2000 },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-lifespan-from'), '1452');
    await user.type(screen.getByTestId('form-input-lifespan-to'), '1519');

    expect(await screen.findByText('From year must be at least 1500')).toBeInTheDocument();

    await user.clear(screen.getByTestId('form-input-lifespan-from'));
    await user.type(screen.getByTestId('form-input-lifespan-from'), '1500');
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(createTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        values: {
          artist: 'Leonardo da Vinci',
          lifespan: '1500 - 1519',
        },
      });
    });
  });

  it('trims all string inputs before create submit', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'movement', label: 'Movement', required: false, type: 'string' },
      { key: 'year', label: 'Year', type: 'number' },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), '  Leonardo da Vinci  ');
    await user.type(screen.getByTestId('form-input-title'), '  Mona Lisa  ');
    await user.type(screen.getByTestId('form-input-movement'), '  Renaissance  ');
    await user.type(screen.getByTestId('form-input-year'), '1503');
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(createTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        values: {
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
          movement: 'Renaissance',
          year: 1503,
        },
      });
    });
  });

  it('uploads responsive image variants on submit and persists their URLs', async () => {
    const user = userEvent.setup();
    const desktopBlob = new Blob(['desktop'], { type: 'image/jpeg' });
    const mobileBlob = new Blob(['mobile'], { type: 'image/jpeg' });
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Image url - desktop', readonly: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Image url - mobile', readonly: true, type: 'string' },
      { key: 'image_path_desktop', label: 'Image path - desktop', readonly: true, type: 'string' },
      { key: 'image_path_mobile', label: 'Image path - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        targetFields: {
          desktop: 'image_url_desktop',
          mobile: 'image_url_mobile',
          desktopPath: 'image_path_desktop',
          mobilePath: 'image_path_mobile',
        },
        type: 'imageUpload',
      },
    ];

    generateResponsiveImageVariantsMock.mockResolvedValue({
      desktop: { blob: desktopBlob, height: 600, width: 800 },
      mobile: { blob: mobileBlob, height: 400, width: 330 },
    });
    uploadResponsiveTopicImagesMock.mockResolvedValue({
      desktop: { path: 'art/desktop/test.jpg', url: 'https://example.com/desktop.jpg' },
      mobile: { path: 'art/mobile/test.jpg', url: 'https://example.com/mobile.jpg' },
    });

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
    await user.click(screen.getByTestId('mock-image-upload-button'));
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(generateResponsiveImageVariantsMock).toHaveBeenCalledTimes(1);
    });

    expect(uploadResponsiveTopicImagesMock).toHaveBeenCalledWith({
      desktopBlob,
      fileNameParts: ['Leonardo da Vinci', 'Mona Lisa'],
      mobileBlob,
      storagePrefix: 'art',
      uniqueSuffix: expect.any(String),
    });

    expect(createTopicItemMock).toHaveBeenCalledWith({
      collectionName: 'art',
      values: {
        artist: 'Leonardo da Vinci',
        image_path_desktop: 'art/desktop/test.jpg',
        image_path_mobile: 'art/mobile/test.jpg',
        image_url_desktop: 'https://example.com/desktop.jpg',
        image_url_mobile: 'https://example.com/mobile.jpg',
        title: 'Mona Lisa',
      },
    });
  });

  it('trims artist and title before uploading images', async () => {
    const user = userEvent.setup();
    const desktopBlob = new Blob(['desktop'], { type: 'image/jpeg' });
    const mobileBlob = new Blob(['mobile'], { type: 'image/jpeg' });
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Image url - desktop', readonly: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Image url - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        targetFields: { desktop: 'image_url_desktop', mobile: 'image_url_mobile' },
        type: 'imageUpload',
      },
    ];

    generateResponsiveImageVariantsMock.mockResolvedValue({
      desktop: { blob: desktopBlob, height: 600, width: 800 },
      mobile: { blob: mobileBlob, height: 400, width: 330 },
    });
    uploadResponsiveTopicImagesMock.mockResolvedValue({
      desktop: { path: 'art/desktop/test.jpg', url: 'https://example.com/desktop.jpg' },
      mobile: { path: 'art/mobile/test.jpg', url: 'https://example.com/mobile.jpg' },
    });

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), '  Leonardo da Vinci  ');
    await user.type(screen.getByTestId('form-input-title'), '  Mona Lisa  ');
    await user.click(screen.getByTestId('mock-image-upload-button'));
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(uploadResponsiveTopicImagesMock).toHaveBeenCalledWith({
        desktopBlob,
        fileNameParts: ['Leonardo da Vinci', 'Mona Lisa'],
        mobileBlob,
        storagePrefix: 'art',
        uniqueSuffix: expect.any(String),
      });
    });
  });

  it('blocks submit when a required imageUpload field has no selected image', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Image url - desktop', readonly: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Image url - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        required: true,
        targetFields: { desktop: 'image_url_desktop', mobile: 'image_url_mobile' },
        type: 'imageUpload',
      },
    ];

    render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    expect(await screen.findByText('Upload image kötelező.')).toBeInTheDocument();
    expect(createTopicItemMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows hideInEdit fields on create but hides them on edit', () => {
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'internal_note', label: 'Internal note', hideInEdit: true, type: 'string' },
    ];

    const { rerender } = render(
      <TopicItemForm collectionName="art" fields={fields} storagePrefix="art" topicId="art" />,
    );

    expect(screen.getByTestId('form-input-internal_note')).toBeInTheDocument();

    rerender(
      <TopicItemForm
        collectionName="art"
        fields={fields}
        initialValues={{ artist: 'Leonardo da Vinci', internal_note: 'Hidden in edit' }}
        itemId="item-1"
        mode="edit"
        storagePrefix="art"
        topicId="art"
      />,
    );

    expect(screen.queryByTestId('form-input-internal_note')).not.toBeInTheDocument();
  });

  it('renders a styled autocomplete for autocomplete-enabled string fields', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string', autocomplete: true },
      { key: 'title', label: 'Title', required: true, type: 'string' },
    ];

    render(
      <TopicItemForm
        autocompleteOptionsByField={{ artist: ['Leonardo da Vinci', 'Michelangelo'] }}
        collectionName="art"
        fields={fields}
        storagePrefix="art"
        topicId="art"
      />,
    );

    const artistInput = screen.getByTestId('form-input-artist');

    expect(artistInput).toHaveAttribute('role', 'combobox');

    await user.click(artistInput);

    expect(await screen.findByText('Leonardo da Vinci')).toBeInTheDocument();
    expect(screen.getByText('Michelangelo')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBe(screen.getByTestId('form-input-title'));
  });

  it('prefills edit values, hides image upload system fields, and updates an item', async () => {
    const user = userEvent.setup();
    const desktopBlob = new Blob(['desktop'], { type: 'image/jpeg' });
    const mobileBlob = new Blob(['mobile'], { type: 'image/jpeg' });
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Image url - desktop', readonly: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Image url - mobile', readonly: true, type: 'string' },
      { key: 'image_path_desktop', label: 'Image path - desktop', readonly: true, type: 'string' },
      { key: 'image_path_mobile', label: 'Image path - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        targetFields: {
          desktop: 'image_url_desktop',
          mobile: 'image_url_mobile',
          desktopPath: 'image_path_desktop',
          mobilePath: 'image_path_mobile',
        },
        type: 'imageUpload',
      },
    ];

    generateResponsiveImageVariantsMock.mockResolvedValue({
      desktop: { blob: desktopBlob, height: 600, width: 800 },
      mobile: { blob: mobileBlob, height: 400, width: 330 },
    });
    uploadResponsiveTopicImagesMock.mockResolvedValue({
      desktop: { path: 'art/desktop/new.jpg', url: 'https://example.com/new-desktop.jpg' },
      mobile: { path: 'art/mobile/new.jpg', url: 'https://example.com/new-mobile.jpg' },
    });

    render(
      <TopicItemForm
        collectionName="art"
        fields={fields}
        initialValues={{
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
          image_url_desktop: 'https://example.com/old-desktop.jpg',
          image_url_mobile: 'https://example.com/old-mobile.jpg',
          image_path_desktop: 'art/desktop/old.jpg',
          image_path_mobile: 'art/mobile/old.jpg',
        }}
        itemId="item-1"
        mode="edit"
        storagePrefix="art"
        topicId="art"
      />,
    );

    expect(screen.queryByDisplayValue('art/desktop/old.jpg')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('art/mobile/old.jpg')).not.toBeInTheDocument();

    await user.clear(screen.getByTestId('form-input-title'));
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa Restored');
    await user.click(screen.getByTestId('mock-image-upload-button'));
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(updateTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        itemId: 'item-1',
        values: {
          artist: 'Leonardo da Vinci',
          image_path_desktop: 'art/desktop/new.jpg',
          image_path_mobile: 'art/mobile/new.jpg',
          image_url_desktop: 'https://example.com/new-desktop.jpg',
          image_url_mobile: 'https://example.com/new-mobile.jpg',
          title: 'Mona Lisa Restored',
        },
      });
    });

    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/desktop/old.jpg');
    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/mobile/old.jpg');
    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      search: { saved: 'edited' },
      to: '/admin/$topicId',
    });
  });

  it('restores the original edit values when undo is clicked', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_path_desktop', label: 'Image path - desktop', readonly: true, type: 'string' },
      { key: 'image_path_mobile', label: 'Image path - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        targetFields: {
          desktop: 'image_path_desktop',
          mobile: 'image_path_mobile',
        },
        type: 'imageUpload',
      },
    ];

    render(
      <TopicItemForm
        collectionName="art"
        fields={fields}
        initialValues={{
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
          image_path_desktop: 'art/desktop/original.jpg',
          image_path_mobile: 'art/mobile/original.jpg',
        }}
        itemId="item-1"
        mode="edit"
        storagePrefix="art"
        topicId="art"
      />,
    );

    expect(screen.getByRole('button', { name: 'Visszaállítás' })).toBeDisabled();

    await user.clear(screen.getByTestId('form-input-title'));
    await user.type(screen.getByTestId('form-input-title'), 'Changed title');
    await user.click(screen.getByTestId('mock-image-upload-button'));

    expect(screen.getByText('Feltöltésre váró kép')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visszaállítás' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Visszaállítás' }));

    expect(screen.getByTestId('form-input-title')).toHaveValue('Mona Lisa');
    expect(screen.queryByDisplayValue('art/desktop/original.jpg')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('art/mobile/original.jpg')).not.toBeInTheDocument();
    expect(screen.queryByText('Feltöltésre váró kép')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visszaállítás' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeDisabled();
  });

  it('enables edit actions when only a new image is selected', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Image url - desktop', readonly: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Image url - mobile', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: ['artist', 'title'],
        key: 'image_upload',
        label: 'Upload image',
        targetFields: {
          desktop: 'image_url_desktop',
          mobile: 'image_url_mobile',
        },
        type: 'imageUpload',
      },
    ];

    render(
      <TopicItemForm
        collectionName="art"
        fields={fields}
        initialValues={{
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
          image_url_desktop: 'https://example.com/old-desktop.jpg',
          image_url_mobile: 'https://example.com/old-mobile.jpg',
        }}
        itemId="item-1"
        mode="edit"
        storagePrefix="art"
        topicId="art"
      />,
    );

    expect(screen.getByRole('button', { name: 'Visszaállítás' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeDisabled();

    await user.click(screen.getByTestId('mock-image-upload-button'));

    expect(screen.getByRole('button', { name: 'Visszaállítás' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeEnabled();
  });
});
