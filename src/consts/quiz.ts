export const QUESTION_COUNT_STEP = 5;
export const MIN_OPTION_COUNT = 4;
export const DISTRACTOR_COUNT = MIN_OPTION_COUNT - 1;

export const QUIZ_CONFIG_STORAGE_KEYS = {
  answerDetailFieldKeys: (topicId: string) => `picquiz-quiz-answer-detail-field-keys-${topicId}`,
  answerDetailsEnabled: (topicId: string) => `picquiz-quiz-answer-details-enabled-${topicId}`,
  answerDetailsExpanded: (topicId: string) => `picquiz-quiz-answer-details-expanded-${topicId}`,
  autoAdvanceAfterAnswer: 'picquiz-quiz-auto-advance-after-answer',
  itemFilterFieldKey: (topicId: string) => `picquiz-quiz-item-filter-field-key-${topicId}`,
  itemFilterValue: (topicId: string) => `picquiz-quiz-item-filter-value-${topicId}`,
  showCorrectAnswer: 'picquiz-quiz-show-correct-answer',
  questionCount: (topicId: string) => `picquiz-quiz-question-count-${topicId}`,
  selectedFieldKeys: (topicId: string) => `picquiz-quiz-selected-field-keys-${topicId}`,
} as const;

export const MIN_QUESTION_COUNT = 4;
export const DEFAULT_QUESTION_COUNT = 10;
export const DEFAULT_SHOW_CORRECT_ANSWER = true;
export const DEFAULT_AUTO_ADVANCE_AFTER_ANSWER = false;
export const DEFAULT_ANSWER_DETAILS_ENABLED = false;
export const DEFAULT_ANSWER_DETAILS_EXPANDED = true;

export const AUTO_ADVANCE_DELAY_MS = 3000;
export const AUTO_ADVANCE_INTERVAL_MS = 1000;
export const INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS =
  AUTO_ADVANCE_DELAY_MS / AUTO_ADVANCE_INTERVAL_MS;
