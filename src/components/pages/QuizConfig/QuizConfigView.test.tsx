import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuizEligibleField, UseQuizConfigResult } from '@/types/quiz';

import QuizConfigView from './QuizConfigView';

const noQuizMock = vi.fn();
const questionFieldsInputMock = vi.fn();
const questionNumberInputMock = vi.fn();
const selectedFieldsSummaryMock = vi.fn();

vi.mock('@/components/pages/QuizConfig/components/NoQuiz', () => ({
  default: (props: unknown) => {
    noQuizMock(props);
    return <div data-testid="no-quiz" />;
  },
}));

vi.mock('@/components/pages/QuizConfig/components/QuestionFieldsInput', () => ({
  default: (props: unknown) => {
    questionFieldsInputMock(props);
    return <div data-testid="question-fields-input" />;
  },
}));

vi.mock('@/components/pages/QuizConfig/components/QuestionNumberInput', () => ({
  default: (props: unknown) => {
    questionNumberInputMock(props);
    return <div data-testid="question-number-input" />;
  },
}));

vi.mock('@/components/pages/QuizConfig/components/SelectedFieldsSummary', () => ({
  default: (props: unknown) => {
    selectedFieldsSummaryMock(props);
    return <div data-testid="selected-fields-summary" />;
  },
}));

const startableFields: QuizEligibleField[] = [
  {
    field: {
      key: 'title',
      label: 'Cim',
      quiz: {
        enabled: true,
        prompt: 'Melyik cim tartozik a kephez?',
      },
      type: 'string',
    },
    eligibleItemCount: 6,
    maxQuestionCount: 6,
    promptsLabel: 'Melyik cim tartozik a kephez?',
    distinctValueCount: 6,
  },
];

const createViewModel = (
  overrides: Partial<UseQuizConfigResult> = {},
): UseQuizConfigResult => ({
  autoAdvanceAfterAnswer: false,
  effectiveSelectedFieldKeys: ['title'],
  eligibleFields: startableFields,
  handleReset: vi.fn(),
  handleStartQuiz: vi.fn(),
  handleQuestionCountBlur: vi.fn(),
  handleQuestionCountInputChange: vi.fn(),
  handleQuestionCountSliderChange: vi.fn(),
  handleToggleField: vi.fn(),
  maxQuestionCount: 10,
  minQuestionCount: 4,
  questionCount: 10,
  selectedFields: startableFields,
  setAutoAdvanceAfterAnswer: vi.fn(),
  setShowCorrectAnswer: vi.fn(),
  showCorrectAnswer: true,
  startableFields,
  ...overrides,
});

describe('QuizConfigView', () => {
  beforeEach(() => {
    noQuizMock.mockClear();
    questionFieldsInputMock.mockClear();
    questionNumberInputMock.mockClear();
    selectedFieldsSummaryMock.mockClear();
  });

  it('renders the no-quiz branch when there are no startable fields', () => {
    render(
      <QuizConfigView
        {...createViewModel({
          eligibleFields: [],
          selectedFields: [],
          startableFields: [],
        })}
      />,
    );

    expect(screen.getByText('Kvíz beállításai')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alaphelyzet' })).toBeInTheDocument();
    expect(screen.getByTestId('no-quiz')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kvíz indítása' })).not.toBeInTheDocument();
    expect(noQuizMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eligibleFields: [],
      }),
    );
  });

  it('renders the configurable branch and passes the expected props to child components', () => {
    const viewModel = createViewModel();

    render(<QuizConfigView {...viewModel} />);

    expect(screen.getByTestId('question-fields-input')).toBeInTheDocument();
    expect(screen.getByTestId('question-number-input')).toBeInTheDocument();
    expect(screen.getByTestId('selected-fields-summary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kvíz indítása' })).toBeEnabled();

    expect(questionFieldsInputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        effectiveSelectedFieldKeys: ['title'],
        onToggleField: viewModel.handleToggleField,
        startableFields: viewModel.startableFields,
      }),
    );
    expect(questionNumberInputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        questionCount: 10,
        maxQuestionCount: 10,
        minQuestionCount: 4,
        onQuestionCountBlur: viewModel.handleQuestionCountBlur,
        onQuestionCountInputChange: viewModel.handleQuestionCountInputChange,
        onQuestionCountSliderChange: viewModel.handleQuestionCountSliderChange,
      }),
    );
    expect(selectedFieldsSummaryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedFields: viewModel.selectedFields,
      }),
    );
  });

  it('disables quiz start when there are no selected fields or question count', () => {
    const { rerender } = render(
      <QuizConfigView
        {...createViewModel({
          questionCount: 10,
          selectedFields: [],
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Kvíz indítása' })).toBeDisabled();

    rerender(
      <QuizConfigView
        {...createViewModel({
          questionCount: 0,
          selectedFields: startableFields,
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Kvíz indítása' })).toBeDisabled();
  });

  it('calls the reset and start handlers from the action buttons', async () => {
    const user = userEvent.setup();
    const viewModel = createViewModel();

    render(<QuizConfigView {...viewModel} />);

    await user.click(screen.getByRole('button', { name: 'Alaphelyzet' }));
    await user.click(screen.getByRole('button', { name: 'Kvíz indítása' }));

    expect(viewModel.handleReset).toHaveBeenCalledTimes(1);
    expect(viewModel.handleStartQuiz).toHaveBeenCalledTimes(1);
  });

  it('forwards switch changes to the provided setters', async () => {
    const user = userEvent.setup();
    const setShowCorrectAnswer = vi.fn();
    const setAutoAdvanceAfterAnswer = vi.fn();

    render(
      <QuizConfigView
        {...createViewModel({
          autoAdvanceAfterAnswer: false,
          setAutoAdvanceAfterAnswer,
          setShowCorrectAnswer,
          showCorrectAnswer: true,
        })}
      />,
    );

    await user.click(screen.getByRole('switch', { name: 'Helyes válasz megmutatása' }));
    await user.click(screen.getByRole('switch', { name: 'Automatikus továbblépés 3 mp után' }));

    expect(setShowCorrectAnswer).toHaveBeenCalledWith(false);
    expect(setAutoAdvanceAfterAnswer).toHaveBeenCalledWith(true);
  });
});
