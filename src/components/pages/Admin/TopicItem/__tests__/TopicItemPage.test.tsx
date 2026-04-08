import { CssBaseline } from '@mui/material';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import type { Topic, TopicItem } from '@/types/topics';

import TopicItemPage from '../TopicItemPage';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const topic: Topic = {
  fields: [
    { key: 'title', label: 'Title', required: true, type: 'string', display: 'title' },
    { key: 'artist', label: 'Artist', type: 'string', display: 'subtitle' },
    { key: 'highlighted', label: 'Highlighted', type: 'boolean' },
    { key: 'image_path_desktop', label: 'Image path - desktop', readonly: true, type: 'string' },
    { key: 'image_path_mobile', label: 'Image path - mobile', readonly: true, type: 'string' },
    {
      buttonLabel: 'Upload image',
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
  ],
  id: 'art-topic',
  label: 'Művészet',
  slug: 'art',
  storage_prefix: 'art',
};

const item: TopicItem = {
  artist: 'Leonardo da Vinci',
  highlighted: true,
  id: 'item-1',
  image_path_desktop: 'art/desktop/monalisa.jpg',
  image_path_mobile: 'art/mobile/monalisa.jpg',
  image_url_desktop: 'https://example.com/art/desktop/monalisa.jpg',
  image_url_mobile: 'https://example.com/art/mobile/monalisa.jpg',
  title: 'Mona Lisa',
};

const renderTopicItemPage = () =>
  render(
    <ThemePresetProvider>
      <CssBaseline />
      <TopicItemPage item={item} topic={topic} />
    </ThemePresetProvider>,
  );

describe('TopicItemPage', () => {
  it('renders the item details and hides internal image storage fields', () => {
    renderTopicItemPage();

    expect(screen.getByText('Leonardo da Vinci')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mona Lisa kep' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Highlighted: Igaz' })).toBeInTheDocument();
    expect(screen.queryByText('Image path - desktop')).not.toBeInTheDocument();
    expect(screen.queryByText('Image path - mobile')).not.toBeInTheDocument();
  });

  it('opens the image preview dialog and uses the screen-size dependent image source', async () => {
    const user = userEvent.setup();

    renderTopicItemPage();

    await user.click(screen.getByRole('button', { name: 'Mona Lisa kep' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Mona Lisa kep' })).toHaveAttribute(
      'src',
      'https://example.com/art/desktop/monalisa.jpg',
    );
  });

  it('navigates to the edit page from the detail page action', async () => {
    const user = userEvent.setup();

    navigateMock.mockReset();
    renderTopicItemPage();

    await user.click(screen.getByRole('button', { name: 'Szerkesztés' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { itemId: 'item-1', topicId: 'art-topic' },
      to: '/$topicId/items/$itemId/edit',
    });
  });
});
