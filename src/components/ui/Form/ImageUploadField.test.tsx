import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import ImageUploadField from './ImageUploadField';

const imageUploadDialogMock = vi.fn();

vi.mock(
  '@/components/pages/Admin/TopicItemFormPage/TopicItemForm/components/ImageUploadDialog',
  () => ({
    default: (props: unknown) => {
      imageUploadDialogMock(props);

      return null;
    },
  }),
);

vi.mock('../../../data/storage', () => ({
  createImageFileUniqueSuffix: () => 'unique1234',
  getResponsiveImageFileNames: () => ({
    desktop: 'desktop.jpg',
    mobile: 'mobile.jpg',
  }),
}));

const field: Extract<TopicField, { type: 'imageUpload' }> = {
  buttonLabel: 'Upload after artist and title',
  fileNameFields: ['artist', 'title'],
  key: 'image_upload',
  label: 'Upload image',
  targetFields: {
    desktop: 'image_url_desktop',
    mobile: 'image_url_mobile',
  },
  type: 'imageUpload',
};

describe('ImageUploadField', () => {
  it('opens the native file chooser directly when there is no image yet', () => {
    const clickMock = vi.fn();
    const onSelectImage = vi.fn();

    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(clickMock);

    render(
      <ImageUploadField
        field={field}
        fileNameParts={['Pablo Picasso']}
        isReadyForUpload
        onSelectImage={onSelectImage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload image' }));

    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(imageUploadDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false }),
    );
    expect(onSelectImage).not.toHaveBeenCalled();
  });

  it('uses the directly selected file without opening the dialog first', () => {
    const onSelectImage = vi.fn();

    render(
      <ImageUploadField
        field={field}
        fileNameParts={['Pablo Picasso']}
        isReadyForUpload
        onSelectImage={onSelectImage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload image' }));
    fireEvent.change(screen.getByTestId('direct-image-upload-input'), {
      target: {
        files: [new File(['image'], 'picasso.jpg', { type: 'image/jpeg' })],
      },
    });

    expect(onSelectImage).toHaveBeenCalledWith({
      file: expect.any(File),
      uniqueSuffix: 'unique1234',
    });
    expect(imageUploadDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false }),
    );
  });

  it('keeps opening the dialog when an image already exists', () => {
    render(
      <ImageUploadField
        existingImageUrl="https://example.com/existing.jpg"
        field={field}
        fileNameParts={['Pablo Picasso']}
        isReadyForUpload
        mode="edit"
        onSelectImage={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload image' }));

    expect(imageUploadDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: true }),
    );
  });

  it('shows the fixed helper text while upload is blocked', () => {
    render(
      <ImageUploadField
        field={field}
        fileNameParts={[]}
        helperText="Add meg a kötelező mezők értékeit: Artist, Title"
        isReadyForUpload={false}
        onSelectImage={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Add meg a kötelező mezők értékeit: Artist, Title'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload image' })).toBeDisabled();
  });

  it('shows a loader while the stored image preview is loading', () => {
    render(
      <ImageUploadField
        existingImageUrl="https://example.com/existing.jpg"
        field={field}
        fileNameParts={['Leonardo da Vinci', 'Mona Lisa']}
        isReadyForUpload
        mode="edit"
        onSelectImage={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Kep elonezet toltese')).toBeInTheDocument();
  });

  it('shows a placeholder in edit mode when there is no stored image', () => {
    render(
      <ImageUploadField
        field={field}
        fileNameParts={['Leonardo da Vinci', 'Mona Lisa']}
        isReadyForUpload
        mode="edit"
        onSelectImage={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Hibas vagy hianyzo kep' })).toBeInTheDocument();
    expect(screen.getAllByText('Hibas vagy hianyzo kep')).toHaveLength(2);
  });

  it('falls back to the placeholder when the stored image fails to load', () => {
    render(
      <ImageUploadField
        existingImageUrl="https://example.com/missing.jpg"
        field={field}
        fileNameParts={['Leonardo da Vinci', 'Mona Lisa']}
        isReadyForUpload
        mode="edit"
        onSelectImage={vi.fn()}
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Leonardo da Vinci Mona Lisa' }));

    expect(screen.getByRole('img', { name: 'Hibas vagy hianyzo kep' })).toBeInTheDocument();
    expect(screen.getAllByText('Hibas vagy hianyzo kep')).toHaveLength(2);
  });

  it('hides the loader after the stored image preview has loaded', () => {
    render(
      <ImageUploadField
        existingImageUrl="https://example.com/existing.jpg"
        field={field}
        fileNameParts={['Leonardo da Vinci', 'Mona Lisa']}
        isReadyForUpload
        mode="edit"
        onSelectImage={vi.fn()}
      />,
    );

    fireEvent.load(screen.getByRole('img', { name: 'Leonardo da Vinci Mona Lisa' }));

    expect(screen.queryByLabelText('Kep elonezet toltese')).not.toBeInTheDocument();
  });
});
