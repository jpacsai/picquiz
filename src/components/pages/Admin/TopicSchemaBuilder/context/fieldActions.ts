import type { TopicDraft, TopicFieldDraft } from '@/types/topicSchema';
import type { SelectedFieldIndex } from '@/types/topicSchemaBuilder';

import { normalizeImageUploadField } from '../hook/utils';

export const getFieldToAdd = (field: TopicFieldDraft): TopicFieldDraft => {
  if (field.type === 'select') {
    return {
      ...field,
      options: field.options ?? [],
    };
  }

  return field;
};

export const appendFieldToDraft = (draft: TopicDraft, field: TopicFieldDraft): TopicDraft => ({
  ...draft,
  fields: [...draft.fields, getFieldToAdd(field)],
});

export const updateDraftFieldAtIndex = (
  draft: TopicDraft,
  index: number,
  updater: (field: TopicFieldDraft) => TopicFieldDraft,
): TopicDraft => ({
  ...draft,
  fields: draft.fields.map((field, fieldIndex) => (fieldIndex === index ? updater(field) : field)),
});

export const removeDraftFieldAtIndex = (draft: TopicDraft, index: number): TopicDraft => ({
  ...draft,
  fields: draft.fields.filter((_, fieldIndex) => fieldIndex !== index),
});

export const insertNormalizedFixedImageUploadField = (
  draft: TopicDraft,
  field: TopicFieldDraft,
): TopicDraft => ({
  ...draft,
  fields: [...draft.fields, normalizeImageUploadField(field)],
});

export const moveDraftField = (
  draft: TopicDraft,
  { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
): TopicDraft => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= draft.fields.length ||
    toIndex >= draft.fields.length
  ) {
    return draft;
  }

  const nextFields = [...draft.fields];
  const [movedField] = nextFields.splice(fromIndex, 1);

  nextFields.splice(toIndex, 0, movedField);

  return {
    ...draft,
    fields: nextFields,
  };
};

export const getSelectedFieldIndexAfterDelete = ({
  fieldCount,
  selectedFieldIndex,
}: {
  fieldCount: number;
  selectedFieldIndex: SelectedFieldIndex;
}): SelectedFieldIndex => {
  if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
    return selectedFieldIndex;
  }

  if (fieldCount <= 1) {
    return null;
  }

  return Math.max(0, selectedFieldIndex - 1);
};

export const getSelectedFieldIndexAfterMove = ({
  fromIndex,
  selectedFieldIndex,
  toIndex,
}: {
  fromIndex: number;
  selectedFieldIndex: SelectedFieldIndex;
  toIndex: number;
}): SelectedFieldIndex => {
  if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
    return selectedFieldIndex;
  }

  if (selectedFieldIndex === fromIndex) {
    return toIndex;
  }

  if (fromIndex < toIndex && selectedFieldIndex > fromIndex && selectedFieldIndex <= toIndex) {
    return selectedFieldIndex - 1;
  }

  if (toIndex < fromIndex && selectedFieldIndex >= toIndex && selectedFieldIndex < fromIndex) {
    return selectedFieldIndex + 1;
  }

  return selectedFieldIndex;
};
