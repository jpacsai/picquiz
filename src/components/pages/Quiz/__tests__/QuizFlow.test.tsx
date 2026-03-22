import { CssBaseline } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Quiz from '@/components/pages/Quiz/Quiz';
import QuizConfig from '@/components/pages/Quiz/QuizConfig';
import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

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
    {
      key: 'title',
      label: 'Cim',
      quiz: {
        enabled: true,
        prompt: 'Melyik cim tartozik a kephez?',
      },
      type: 'string',
    },
    {
      key: 'year',
      label: 'Ev',
      quiz: {
        enabled: true,
        prompt: 'Melyik evben keszult?',
      },
      type: 'number',
    },
    {
      buttonLabel: 'Upload image',
      fileNameFields: { artist: 'artist', title: 'title' },
      key: 'image_upload',
      label: 'Upload image',
      targetFields: {
        desktop: 'image_url_desktop',
        mobile: 'image_url_mobile',
      },
      type: 'imageUpload',
    },
  ],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

const items: ReadonlyArray<TopicItem> = [
  {
    id: 'item-1',
    image_url_desktop: 'https://example.com/1-desktop.jpg',
    image_url_mobile: 'https://example.com/1-mobile.jpg',
    title: 'Mona Lisa',
    year: 1503,
  },
  {
    id: 'item-2',
    image_url_desktop: 'https://example.com/2-desktop.jpg',
    image_url_mobile: 'https://example.com/2-mobile.jpg',
    title: 'The Last Supper',
    year: 1498,
  },
  {
    id: 'item-3',
    image_url_desktop: 'https://example.com/3-desktop.jpg',
    image_url_mobile: 'https://example.com/3-mobile.jpg',
    title: 'Girl with a Pearl Earring',
    year: 1665,
  },
  {
    id: 'item-4',
    image_url_desktop: 'https://example.com/4-desktop.jpg',
    image_url_mobile: 'https://example.com/4-mobile.jpg',
    title: 'The Night Watch',
    year: 1642,
  },
  {
    id: 'item-5',
    image_url_desktop: 'https://example.com/5-desktop.jpg',
    image_url_mobile: 'https://example.com/5-mobile.jpg',
    title: 'Guernica',
    year: 1937,
  },
  {
    id: 'item-6',
    image_url_desktop: 'https://example.com/6-desktop.jpg',
    image_url_mobile: 'https://example.com/6-mobile.jpg',
    title: 'The Kiss',
    year: 1908,
  },
];

const renderWithTheme = (ui: ReactNode) =>
  render(
    <ThemePresetProvider>
      <CssBaseline />
      {ui}
    </ThemePresetProvider>,
  );

describe('Quiz flow integration', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    navigateMock.mockResolvedValue(undefined);
  });

  it('starts a quiz from multiple selected fields without falling into invalid config state', async () => {
    const user = userEvent.setup();

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    await user.click(screen.getByRole('checkbox', { name: /ev - melyik evben keszult/i }));
    await user.click(screen.getByRole('button', { name: 'Start kvíz' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      search: {
        answerFieldKeys: ['title', 'year'],
        questionCount: 5,
        showCorrectAnswer: true,
      },
      to: '/$topicId/quiz',
    });

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title', 'year']}
        items={items}
        questionCount={5}
        showCorrectAnswer
        topic={topic}
      />,
    );

    expect(screen.queryByText('Hiányos kvíz konfiguráció')).not.toBeInTheDocument();
    expect(screen.getByText(/1\. kérdés \/ 5/)).toBeInTheDocument();
  });
});
