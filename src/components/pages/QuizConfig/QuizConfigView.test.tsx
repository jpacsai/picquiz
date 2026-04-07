import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuizEligibleField, UseQuizConfigResult } from '@/types/quiz';

import QuizConfigView from './QuizConfigView';

const noQuizMock = vi.fn();
const itemFilterSectionMock = vi.fn();
const questionFieldsInputMock = vi.fn();
const questionNumberInputMock = vi.fn();

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

vi.mock('@/components/pages/QuizConfig/components/ItemFilterSection', () => ({
  default: (props: unknown) => {
    itemFilterSectionMock(props);
    return <div data-testid="item-filter-section" />;
  },
}));

vi.mock('@/components/pages/QuizConfig/components/QuestionNumberInput', () => ({
  default: (props: unknown) => {
    questionNumberInputMock(props);
    return <div data-testid="question-number-input" />;
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

const answerDetailFields = [
  {
    key: 'artist',
    label: 'Alkotó',
    type: 'string',
  },
  {
    key: 'year',
    label: 'Év',
    type: 'number',
  },
] as const;

const createViewModel = (
  overrides: Partial<UseQuizConfigResult> = {},
): UseQuizConfigResult => ({
  answerDetailFieldKeys: [],
  answerDetailFields: [...answerDetailFields],
  answerDetailsEnabled: true,
  answerDetailsExpanded: true,
  autoAdvanceAfterAnswer: false,
  effectiveSelectedFieldKeys: ['title'],
  eligibleFields: startableFields,
  filteredItemCount: 6,
  handleAddItemFilter: vi.fn(),
  handleRemoveItemFilter: vi.fn(),
  handleToggleAnswerDetailField: vi.fn(),
  handleItemFilterFieldChange: vi.fn(),
  handleItemFilterValueChange: vi.fn(),
  handleReset: vi.fn(),
  handleStartQuiz: vi.fn(),
  handleQuestionCountBlur: vi.fn(),
  handleQuestionCountInputChange: vi.fn(),
  handleQuestionCountSliderChange: vi.fn(),
  handleToggleField: vi.fn(),
  itemFilterFields: [
    {
      key: 'artist',
      label: 'Alkotó',
      type: 'string',
    },
  ],
  itemFilterRows: [
    {
      fieldKey: '',
      options: [],
      value: '',
    },
  ],
  maxQuestionCount: 10,
  minQuestionCount: 4,
  questionCount: 10,
  selectedFields: startableFields,
  setAnswerDetailsEnabled: vi.fn(),
  setAnswerDetailsExpanded: vi.fn(),
  setAutoAdvanceAfterAnswer: vi.fn(),
  setShowCorrectAnswer: vi.fn(),
  showCorrectAnswer: true,
  startableFields,
  totalItemCount: 6,
  ...overrides,
});

describe('QuizConfigView', () => {
  beforeEach(() => {
    noQuizMock.mockClear();
    itemFilterSectionMock.mockClear();
    questionFieldsInputMock.mockClear();
    questionNumberInputMock.mockClear();
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
    expect(screen.getByTestId('item-filter-section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kvíz indítása' })).toBeEnabled();

    expect(itemFilterSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filteredItemCount: 6,
        itemFilterFields: viewModel.itemFilterFields,
        itemFilterRows: viewModel.itemFilterRows,
        onAddItemFilter: viewModel.handleAddItemFilter,
        onItemFilterFieldChange: viewModel.handleItemFilterFieldChange,
        onItemFilterValueChange: viewModel.handleItemFilterValueChange,
        onRemoveItemFilter: viewModel.handleRemoveItemFilter,
        totalItemCount: 6,
      }),
    );
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
    expect(screen.getByRole('checkbox', { name: 'Alkotó' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Év' })).not.toBeChecked();
  });

  it('hides answer detail field checkboxes when the feature is turned off', () => {
    render(
      <QuizConfigView
        {...createViewModel({
          answerDetailsEnabled: false,
        })}
      />,
    );

    expect(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    ).not.toBeChecked();
    expect(
      screen.queryByRole('button', { name: 'Plusz adatok szekció összecsukása' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Helyes válasz extra adatai')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Alkotó' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Év' })).not.toBeInTheDocument();
  });

  it('collapses and re-expands the answer details section from the icon button', async () => {
    const user = userEvent.setup();
    const setAnswerDetailsExpanded = vi.fn();

    render(
      <QuizConfigView
        {...createViewModel({
          setAnswerDetailsExpanded,
        })}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Alkotó' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Plusz adatok szekció összecsukása' }));

    expect(setAnswerDetailsExpanded).toHaveBeenCalledWith(expect.any(Function));
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
    const setAnswerDetailsEnabled = vi.fn();
    const setAnswerDetailsExpanded = vi.fn();
    const setShowCorrectAnswer = vi.fn();
    const setAutoAdvanceAfterAnswer = vi.fn();

    render(
      <QuizConfigView
        {...createViewModel({
          answerDetailsEnabled: false,
          autoAdvanceAfterAnswer: false,
          setAnswerDetailsEnabled,
          setAnswerDetailsExpanded,
          setAutoAdvanceAfterAnswer,
          setShowCorrectAnswer,
          showCorrectAnswer: true,
        })}
      />,
    );

    await user.click(
      screen.getByRole('switch', { name: 'Plusz adatok megjelenítése a válasz után' }),
    );
    await user.click(
      screen.getByRole('switch', { name: 'Helyes válasz megmutatása rossz válasz esetén' }),
    );
    await user.click(screen.getByRole('switch', { name: 'Automatikus továbblépés 3 mp után' }));

    expect(setAnswerDetailsEnabled).toHaveBeenCalledWith(true);
    expect(setAnswerDetailsExpanded).not.toHaveBeenCalled();
    expect(setShowCorrectAnswer).toHaveBeenCalledWith(false);
    expect(setAutoAdvanceAfterAnswer).toHaveBeenCalledWith(true);
  });

  it('forwards answer detail checkbox changes to the provided handler', async () => {
    const user = userEvent.setup();
    const viewModel = createViewModel({
      answerDetailFieldKeys: ['artist'],
    });

    render(<QuizConfigView {...viewModel} />);

    expect(screen.getByRole('checkbox', { name: 'Alkotó' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Év' }));

    expect(viewModel.handleToggleAnswerDetailField).toHaveBeenCalledWith('year', true);
  });
});
