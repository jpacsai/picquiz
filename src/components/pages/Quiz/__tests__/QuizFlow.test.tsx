import { CssBaseline } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('starts a quiz from multiple selected fields without falling into invalid config state', async () => {
    const user = userEvent.setup();

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    await user.click(screen.getByRole('checkbox', { name: /ev - melyik evben keszult/i }));
    await user.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      search: {
        answerFieldKeys: ['title', 'year'],
        autoAdvanceAfterAnswer: false,
        questionCount: 5,
        showCorrectAnswer: true,
      },
      to: '/$topicId/quiz',
    });

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title', 'year']}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={5}
        showCorrectAnswer
        topic={topic}
      />,
    );

    expect(screen.queryByText('Hiányos kvíz konfiguráció')).not.toBeInTheDocument();
    expect(screen.getByText(/5\s*\/\s*1/)).toBeInTheDocument();
  });

  it('automatically advances to the next question 5 seconds after answering', async () => {
    vi.useFakeTimers();

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title']}
        autoAdvanceAfterAnswer
        items={items}
        questionCount={2}
        showCorrectAnswer
        topic={topic}
      />,
    );

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.getByText(/5 másodperc múlva/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/2\s*\/\s*2/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Következő kérdés' })).not.toBeInTheDocument();
  });

  it('restores toggle settings from local storage', () => {
    window.localStorage.setItem('picquiz-quiz-show-correct-answer', 'false');
    window.localStorage.setItem('picquiz-quiz-auto-advance-after-answer', 'true');

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    expect(screen.getByRole('switch', { name: 'Helyes válasz megmutatása' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Automatikus továbblépés 5 mp után' })).toBeChecked();
  });
});
