import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import Form from './Form';

const navigateMock = vi.fn();
const createTopicItemMock = vi.fn();
const uploadResponsiveTopicImagesMock = vi.fn();
const generateResponsiveImageVariantsMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@service/items', () => ({
  createTopicItem: (...args: unknown[]) => createTopicItemMock(...args),
}));

vi.mock('@data/storage', async () => {
  const actual = await vi.importActual<typeof import('@data/storage')>(
    '@data/storage',
  );

  return {
    ...actual,
    uploadResponsiveTopicImages: (...args: unknown[]) => uploadResponsiveTopicImagesMock(...args),
  };
});

vi.mock('@lib/image', () => ({
  generateResponsiveImageVariants: (...args: unknown[]) => generateResponsiveImageVariantsMock(...args),
}));

vi.mock('../../../ui/Form/ImageUploadField', () => ({
  default: ({
    onSelectImage,
  }: {
    onSelectImage: (file: File) => void;
  }) => (
    <button
      data-testid="mock-image-upload-button"
      type="button"
      onClick={() => {
        onSelectImage(new File(['image-bytes'], 'monalisa.jpg', { type: 'image/jpeg' }));
      }}
    >
      Mock image upload
    </button>
  ),
}));

describe('Admin Form saving', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    createTopicItemMock.mockReset();
    uploadResponsiveTopicImagesMock.mockReset();
    generateResponsiveImageVariantsMock.mockReset();

    createTopicItemMock.mockResolvedValue({ id: 'doc-1' });
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
      <Form
        collectionName="art"
        fields={fields}
        storagePrefix="art"
        topicId="art"
      />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
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

  it('uploads responsive image variants on submit and persists their URLs', async () => {
    const user = userEvent.setup();
    const desktopBlob = new Blob(['desktop'], { type: 'image/jpeg' });
    const mobileBlob = new Blob(['mobile'], { type: 'image/jpeg' });
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Desktop URL', hideInEdit: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Mobile URL', hideInEdit: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: { artist: 'artist', title: 'title' },
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
      <Form
        collectionName="art"
        fields={fields}
        storagePrefix="art"
        topicId="art"
      />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
    await user.click(screen.getByTestId('mock-image-upload-button'));
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    await waitFor(() => {
      expect(generateResponsiveImageVariantsMock).toHaveBeenCalledTimes(1);
    });

    expect(uploadResponsiveTopicImagesMock).toHaveBeenCalledWith({
      artistName: 'Leonardo da Vinci',
      desktopBlob,
      mobileBlob,
      storagePrefix: 'art',
      title: 'Mona Lisa',
    });

    expect(createTopicItemMock).toHaveBeenCalledWith({
      collectionName: 'art',
      values: {
        artist: 'Leonardo da Vinci',
        image_url_desktop: 'https://example.com/desktop.jpg',
        image_url_mobile: 'https://example.com/mobile.jpg',
        title: 'Mona Lisa',
      },
    });
  });

  it('blocks submit when a required imageUpload field has no selected image', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      { key: 'artist', label: 'Artist', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'image_url_desktop', label: 'Desktop URL', hideInEdit: true, type: 'string' },
      { key: 'image_url_mobile', label: 'Mobile URL', hideInEdit: true, type: 'string' },
      {
        buttonLabel: 'Upload after artist and title',
        fileNameFields: { artist: 'artist', title: 'title' },
        key: 'image_upload',
        label: 'Upload image',
        required: true,
        targetFields: { desktop: 'image_url_desktop', mobile: 'image_url_mobile' },
        type: 'imageUpload',
      },
    ];

    render(
      <Form
        collectionName="art"
        fields={fields}
        storagePrefix="art"
        topicId="art"
      />,
    );

    await user.type(screen.getByTestId('form-input-artist'), 'Leonardo da Vinci');
    await user.type(screen.getByTestId('form-input-title'), 'Mona Lisa');
    await user.click(screen.getByRole('button', { name: 'Mentés' }));

    expect(await screen.findByText('Upload image kötelező.')).toBeInTheDocument();
    expect(createTopicItemMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
