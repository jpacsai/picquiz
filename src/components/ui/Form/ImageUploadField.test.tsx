import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import ImageUploadField from './ImageUploadField';

vi.mock('../../pages/Admin/TopicPage/TopicItemForm/components/ImageUploadDialog', () => ({
  default: () => null,
}));

vi.mock('../../../data/storage', () => ({
  getResponsiveImageFileNames: () => ({
    desktop: 'desktop.jpg',
    mobile: 'mobile.jpg',
  }),
}));

const field: Extract<TopicField, { type: 'imageUpload' }> = {
  buttonLabel: 'Upload after artist and title',
  fileNameFields: { artist: 'artist', title: 'title' },
  key: 'image_upload',
  label: 'Upload image',
  targetFields: {
    desktop: 'image_url_desktop',
    mobile: 'image_url_mobile',
  },
  type: 'imageUpload',
};

describe('ImageUploadField', () => {
  it('shows a loader while the stored image preview is loading', () => {
    render(
      <ImageUploadField
        artistName="Leonardo da Vinci"
        existingImageUrl="https://example.com/existing.jpg"
        field={field}
        mode="edit"
        onSelectImage={vi.fn()}
        title="Mona Lisa"
      />,
    );

    expect(screen.getByLabelText('Kep elonezet toltese')).toBeInTheDocument();
  });

  it('shows a placeholder in edit mode when there is no stored image', () => {
    render(
      <ImageUploadField
        artistName="Leonardo da Vinci"
        field={field}
        mode="edit"
        onSelectImage={vi.fn()}
        title="Mona Lisa"
      />,
    );

    expect(screen.getByRole('img', { name: 'Hibas vagy hianyzo kep' })).toBeInTheDocument();
    expect(screen.getAllByText('Hibas vagy hianyzo kep')).toHaveLength(2);
  });

  it('falls back to the placeholder when the stored image fails to load', () => {
    render(
      <ImageUploadField
        artistName="Leonardo da Vinci"
        existingImageUrl="https://example.com/missing.jpg"
        field={field}
        mode="edit"
        onSelectImage={vi.fn()}
        title="Mona Lisa"
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Mona Lisa' }));

    expect(screen.getByRole('img', { name: 'Hibas vagy hianyzo kep' })).toBeInTheDocument();
    expect(screen.getAllByText('Hibas vagy hianyzo kep')).toHaveLength(2);
  });

  it('hides the loader after the stored image preview has loaded', () => {
    render(
      <ImageUploadField
        artistName="Leonardo da Vinci"
        existingImageUrl="https://example.com/existing.jpg"
        field={field}
        mode="edit"
        onSelectImage={vi.fn()}
        title="Mona Lisa"
      />,
    );

    fireEvent.load(screen.getByRole('img', { name: 'Mona Lisa' }));

    expect(screen.queryByLabelText('Kep elonezet toltese')).not.toBeInTheDocument();
  });
});
