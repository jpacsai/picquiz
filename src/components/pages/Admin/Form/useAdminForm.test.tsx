import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import { useAdminForm } from './useAdminForm';

const navigateMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const setQueryDataMock = vi.fn();
const createTopicItemMock = vi.fn();
const updateTopicItemMock = vi.fn();
const uploadResponsiveTopicImagesMock = vi.fn();
const deleteTopicImageByPathMock = vi.fn();
const generateResponsiveImageVariantsMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
    setQueryData: setQueryDataMock,
  }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@service/items', () => ({
  createTopicItem: (...args: unknown[]) => createTopicItemMock(...args),
  updateTopicItem: (...args: unknown[]) => updateTopicItemMock(...args),
}));

vi.mock('@data/storage', () => ({
  deleteTopicImageByPath: (...args: unknown[]) => deleteTopicImageByPathMock(...args),
  uploadResponsiveTopicImages: (...args: unknown[]) => uploadResponsiveTopicImagesMock(...args),
}));

vi.mock('@lib/image', () => ({
  generateResponsiveImageVariants: (...args: unknown[]) => generateResponsiveImageVariantsMock(...args),
}));

const baseFields: TopicField[] = [
  { key: 'artist', label: 'Artist', required: true, type: 'string' },
  { key: 'title', label: 'Title', required: true, type: 'string' },
];

const imageFields: TopicField[] = [
  ...baseFields,
  { key: 'image_url_desktop', label: 'Desktop URL', readonly: true, type: 'string' },
  { key: 'image_url_mobile', label: 'Mobile URL', readonly: true, type: 'string' },
  { key: 'image_path_desktop', label: 'Desktop path', readonly: true, type: 'string' },
  { key: 'image_path_mobile', label: 'Mobile path', readonly: true, type: 'string' },
  {
    buttonLabel: 'Upload after artist and title',
    fileNameFields: { artist: 'artist', title: 'title' },
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

const setFormValues = async (
  form: ReturnType<typeof useAdminForm>['form'],
  values: Record<string, string | number>,
) => {
  await act(async () => {
    Object.entries(values).forEach(([key, value]) => {
      form.setFieldValue(key, value);
    });
  });
};

describe('useAdminForm', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    invalidateQueriesMock.mockReset();
    setQueryDataMock.mockReset();
    createTopicItemMock.mockReset();
    updateTopicItemMock.mockReset();
    uploadResponsiveTopicImagesMock.mockReset();
    deleteTopicImageByPathMock.mockReset();
    generateResponsiveImageVariantsMock.mockReset();
    createObjectUrlMock.mockReset();
    revokeObjectUrlMock.mockReset();

    navigateMock.mockResolvedValue(undefined);
    invalidateQueriesMock.mockResolvedValue(undefined);
    setQueryDataMock.mockReturnValue(undefined);
    createTopicItemMock.mockResolvedValue({ id: 'doc-1' });
    updateTopicItemMock.mockResolvedValue(undefined);
    uploadResponsiveTopicImagesMock.mockResolvedValue({
      desktop: { path: 'art/desktop/new.jpg', url: 'https://example.com/new-desktop.jpg' },
      mobile: { path: 'art/mobile/new.jpg', url: 'https://example.com/new-mobile.jpg' },
    });
    deleteTopicImageByPathMock.mockResolvedValue(undefined);
    generateResponsiveImageVariantsMock.mockResolvedValue({
      desktop: { blob: new Blob(['desktop'], { type: 'image/jpeg' }), height: 600, width: 800 },
      mobile: { blob: new Blob(['mobile'], { type: 'image/jpeg' }), height: 400, width: 330 },
    });

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrlMock.mockReturnValue('blob:preview'),
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrlMock,
      writable: true,
    });
  });

  it('sets a submit error when edit mode is missing an itemId', async () => {
    const { result } = renderHook(() =>
      useAdminForm({
        collectionName: 'art',
        fields: baseFields,
        mode: 'edit',
        storagePrefix: 'art',
        topicId: 'art',
      }),
    );

    await setFormValues(result.current.form, {
      artist: 'Leonardo da Vinci',
      title: 'Mona Lisa',
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).toBe('Hiányzó item azonosító az edit mentéshez.');
    });

    expect(updateTopicItemMock).not.toHaveBeenCalled();
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });

  it('updates item caches and invalidates topic and detail queries after a successful edit', async () => {
    const { result } = renderHook(() =>
      useAdminForm({
        collectionName: 'art',
        fields: baseFields,
        itemId: 'item-1',
        mode: 'edit',
        storagePrefix: 'art',
        topicId: 'art',
      }),
    );

    await setFormValues(result.current.form, {
      artist: 'Leonardo da Vinci',
      title: 'Mona Lisa',
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(updateTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        itemId: 'item-1',
        values: {
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
        },
      });
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['items', 'byTopic', 'art'],
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['items', 'detail', { topic: 'art', id: 'item-1' }],
    });
    expect(setQueryDataMock).toHaveBeenCalledWith(['items', 'detail', { topic: 'art', id: 'item-1' }], {
      artist: 'Leonardo da Vinci',
      id: 'item-1',
      title: 'Mona Lisa',
    });
    expect(setQueryDataMock).toHaveBeenCalledWith(
      ['items', 'byTopic', 'art'],
      expect.any(Function),
    );
    expect(navigateMock).toHaveBeenCalledWith({
      search: { saved: 'edited' },
      params: { topicId: 'art' },
      to: '/admin/$topicId',
    });
  });

  it('deletes only changed image paths after replacing an image in edit mode', async () => {
    uploadResponsiveTopicImagesMock.mockResolvedValue({
      desktop: { path: 'art/desktop/old.jpg', url: 'https://example.com/new-desktop.jpg' },
      mobile: { path: 'art/mobile/new.jpg', url: 'https://example.com/new-mobile.jpg' },
    });

    const { result } = renderHook(() =>
      useAdminForm({
        collectionName: 'art',
        fields: imageFields,
        initialValues: {
          artist: 'Leonardo da Vinci',
          title: 'Mona Lisa',
          image_url_desktop: 'https://example.com/old-desktop.jpg',
          image_url_mobile: 'https://example.com/old-mobile.jpg',
          image_path_desktop: 'art/desktop/old.jpg',
          image_path_mobile: 'art/mobile/old.jpg',
        },
        itemId: 'item-1',
        mode: 'edit',
        storagePrefix: 'art',
        topicId: 'art',
      }),
    );

    await act(async () => {
      result.current.handleSelectPendingImage({
        field: imageFields[6] as Extract<TopicField, { type: 'imageUpload' }>,
        file: new File(['image'], 'replacement.jpg', { type: 'image/jpeg' }),
      });
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(updateTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        itemId: 'item-1',
        values: {
          artist: 'Leonardo da Vinci',
          image_path_desktop: 'art/desktop/old.jpg',
          image_path_mobile: 'art/mobile/new.jpg',
          image_url_desktop: 'https://example.com/new-desktop.jpg',
          image_url_mobile: 'https://example.com/new-mobile.jpg',
          title: 'Mona Lisa',
        },
      });
    });

    expect(deleteTopicImageByPathMock).toHaveBeenCalledTimes(1);
    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/mobile/old.jpg');
    expect(deleteTopicImageByPathMock).not.toHaveBeenCalledWith('art/desktop/old.jpg');
  });
});
