import { CssBaseline } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Quiz from '@/components/pages/Quiz/Quiz';
import QuizConfig from '@/components/pages/QuizConfig/QuizConfig';
import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import type { Topic, TopicItem } from '@/types/topics';

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
      key: 'artist',
      label: 'Alkoto',
      type: 'string',
    },
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
    artist: 'Leonardo da Vinci',
    id: 'item-1',
    image_url_desktop: 'https://example.com/1-desktop.jpg',
    image_url_mobile: 'https://example.com/1-mobile.jpg',
    title: 'Mona Lisa',
    year: 1503,
  },
  {
    artist: 'Leonardo da Vinci',
    id: 'item-2',
    image_url_desktop: 'https://example.com/2-desktop.jpg',
    image_url_mobile: 'https://example.com/2-mobile.jpg',
    title: 'The Last Supper',
    year: 1498,
  },
  {
    artist: 'Johannes Vermeer',
    id: 'item-3',
    image_url_desktop: 'https://example.com/3-desktop.jpg',
    image_url_mobile: 'https://example.com/3-mobile.jpg',
    title: 'Girl with a Pearl Earring',
    year: 1665,
  },
  {
    artist: 'Rembrandt',
    id: 'item-4',
    image_url_desktop: 'https://example.com/4-desktop.jpg',
    image_url_mobile: 'https://example.com/4-mobile.jpg',
    title: 'The Night Watch',
    year: 1642,
  },
  {
    artist: 'Pablo Picasso',
    id: 'item-5',
    image_url_desktop: 'https://example.com/5-desktop.jpg',
    image_url_mobile: 'https://example.com/5-mobile.jpg',
    title: 'Guernica',
    year: 1937,
  },
  {
    artist: 'Gustav Klimt',
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

const getCurrentCorrectAnswer = () => {
  const image = screen.getByRole('img');
  const [_, correctAnswer = ''] = image.getAttribute('alt')?.split(' - ') ?? [];

  return correctAnswer;
};

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
        answerDetailFieldKeys: [],
        answerFieldKeys: ['title', 'year'],
        autoAdvanceAfterAnswer: false,
        questionCount: 10,
        showCorrectAnswer: true,
      },
      to: '/$topicId/quiz',
    });

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title', 'year']}
        answerDetailFieldKeys={[]}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={10}
        showCorrectAnswer
        topic={topic}
      />,
    );

    expect(screen.queryByText('Hiányos kvíz konfiguráció')).not.toBeInTheDocument();
    expect(screen.getByText(/10\s*\/\s*1/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vissza a beállításokhoz' })).toBeInTheDocument();
  });

  it('returns to the current topic quiz config page from a running quiz', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title']}
        answerDetailFieldKeys={[]}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={2}
        showCorrectAnswer
        topic={topic}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Vissza a beállításokhoz' }));

    expect(navigateMock).toHaveBeenCalledWith({
      params: { topicId: 'art' },
      to: '/$topicId/quiz-config',
    });
  });

  it('automatically advances to the next question 3 seconds after answering', async () => {
    vi.useFakeTimers();

    renderWithTheme(
      <Quiz
        answerFieldKeys={['title']}
        answerDetailFieldKeys={[]}
        autoAdvanceAfterAnswer
        items={items}
        questionCount={2}
        showCorrectAnswer
        topic={topic}
      />,
    );

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.getByText(/3 másodperc múlva/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/2 másodperc múlva/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/1 másodperc múlva/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/2\s*\/\s*2/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Következő kérdés' })).not.toBeInTheDocument();
  });

  it('restores toggle settings from local storage', () => {
    window.localStorage.setItem('picquiz-quiz-selected-field-keys-art', JSON.stringify(['year']));
    window.localStorage.setItem('picquiz-quiz-answer-details-enabled-art', 'true');
    window.localStorage.setItem('picquiz-quiz-question-count-art', '6');
    window.localStorage.setItem('picquiz-quiz-show-correct-answer', 'false');
    window.localStorage.setItem('picquiz-quiz-auto-advance-after-answer', 'true');

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    expect(
      screen.getByRole('switch', { name: 'Helyes válasz megmutatása rossz válasz esetén' }),
    ).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Automatikus továbblépés 3 mp után' })).toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    ).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ev' })).toBeInTheDocument();
  });

  it('keeps answer detail field checkboxes hidden while the feature toggle is off', () => {
    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    expect(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    ).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Cim' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Ev' })).not.toBeInTheDocument();
  });

  it('persists selected filters and restores them when returning to quiz config', async () => {
    const user = userEvent.setup();

    const configView = renderWithTheme(<QuizConfig items={items} topic={topic} />);

    await user.click(screen.getByRole('checkbox', { name: /ev - melyik evben keszult/i }));
    await user.click(screen.getByRole('checkbox', { name: /cim - melyik cim tartozik a kephez/i }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Kérdések száma (max: 6)' }), {
      target: { value: '6' },
    });
    await user.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(window.localStorage.getItem('picquiz-quiz-selected-field-keys-art')).toBe(
      JSON.stringify(['year']),
    );
    expect(window.localStorage.getItem('picquiz-quiz-question-count-art')).toBe('6');

    configView.unmount();

    const quizView = renderWithTheme(
      <Quiz
        answerFieldKeys={['year']}
        answerDetailFieldKeys={[]}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={6}
        showCorrectAnswer
        topic={topic}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Vissza a beállításokhoz' })[0]);

    expect(navigateMock).toHaveBeenLastCalledWith({
      params: { topicId: 'art' },
      to: '/$topicId/quiz-config',
    });

    quizView.unmount();

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    fireEvent.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(navigateMock).toHaveBeenLastCalledWith({
      params: { topicId: 'art' },
      search: {
        answerDetailFieldKeys: [],
        answerFieldKeys: ['year'],
        autoAdvanceAfterAnswer: false,
        questionCount: 6,
        showCorrectAnswer: true,
      },
      to: '/$topicId/quiz',
    });
  });

  it('resets quiz config controls to their defaults', async () => {
    const user = userEvent.setup();

    renderWithTheme(<QuizConfig items={items} topic={topic} />);

    await user.click(screen.getByRole('checkbox', { name: /ev - melyik evben keszult/i }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Kérdések száma (max: 12)' }), {
      target: { value: '6' },
    });
    await user.click(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    );
    await user.click(
      screen.getByRole('switch', { name: 'Helyes válasz megmutatása rossz válasz esetén' }),
    );
    await user.click(screen.getByRole('switch', { name: 'Automatikus továbblépés 3 mp után' }));

    await user.click(screen.getByRole('button', { name: 'Alaphelyzet' }));

    expect(
      screen.getByRole('switch', { name: 'Helyes válasz megmutatása rossz válasz esetén' }),
    ).toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Automatikus továbblépés 3 mp után' }),
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(navigateMock).toHaveBeenLastCalledWith({
      params: { topicId: 'art' },
      search: {
        answerDetailFieldKeys: [],
        answerFieldKeys: ['title'],
        autoAdvanceAfterAnswer: false,
        questionCount: 6,
        showCorrectAnswer: true,
      },
      to: '/$topicId/quiz',
    });
  });

  it('shows selected extra answer details after a correct answer even when correct answers are otherwise hidden', async () => {
    const user = userEvent.setup();

    const configView = renderWithTheme(<QuizConfig items={items} topic={topic} />);

    await user.click(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    );
    await user.click(screen.getByRole('checkbox', { name: 'Ev' }));
    await user.click(
      screen.getByRole('switch', { name: 'Helyes válasz megmutatása rossz válasz esetén' }),
    );
    await user.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(navigateMock).toHaveBeenLastCalledWith({
      params: { topicId: 'art' },
      search: {
        answerDetailFieldKeys: ['year'],
        answerFieldKeys: ['title'],
        autoAdvanceAfterAnswer: false,
        questionCount: 6,
        showCorrectAnswer: false,
      },
      to: '/$topicId/quiz',
    });

    configView.unmount();

    renderWithTheme(
      <Quiz
        answerDetailFieldKeys={['year']}
        answerFieldKeys={['title']}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={6}
        showCorrectAnswer={false}
        topic={topic}
      />,
    );

    await user.click(screen.getByRole('button', { name: getCurrentCorrectAnswer() }));

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent?.includes('Ev:'),
      ),
    ).toBeInTheDocument();
  });

  it('hides selected extra answer details after a wrong answer when correct answers are hidden', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Quiz
        answerDetailFieldKeys={['year']}
        answerFieldKeys={['title']}
        autoAdvanceAfterAnswer={false}
        items={items}
        questionCount={6}
        showCorrectAnswer={false}
        topic={topic}
      />,
    );

    const correctAnswer = getCurrentCorrectAnswer();
    const wrongAnswerButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent !== correctAnswer && button.textContent !== 'Vissza a beállításokhoz');

    expect(wrongAnswerButton).toBeDefined();

    await user.click(wrongAnswerButton!);

    expect(screen.queryByText((_, element) => element?.textContent === 'Ev:')).not.toBeInTheDocument();
    expect(screen.queryByText('1503')).not.toBeInTheDocument();
  });
});
