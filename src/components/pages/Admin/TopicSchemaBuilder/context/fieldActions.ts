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

export type FieldDeletionDependency = {
  fieldKey: string;
  fieldLabel: string;
  reason: string;
};

const getFieldDisplayName = (field: TopicFieldDraft) => field.label?.trim() || field.key?.trim() || 'Ismeretlen field';

export const getFieldDeletionDependencies = ({
  fieldKey,
  fields,
}: {
  fieldKey: string;
  fields: TopicDraft['fields'];
}): FieldDeletionDependency[] => {
  const trimmedFieldKey = fieldKey.trim();

  if (!trimmedFieldKey) {
    return [];
  }

  return fields.flatMap((field) => {
    const dependencies: FieldDeletionDependency[] = [];
    const fieldDisplayName = getFieldDisplayName(field);
    const normalizedFieldKey = field.key?.trim();

    if (normalizedFieldKey === trimmedFieldKey) {
      return dependencies;
    }

    if (field.type === 'imageUpload' && (field.fileNameFields ?? []).includes(trimmedFieldKey)) {
      dependencies.push({
        fieldKey: normalizedFieldKey ?? fieldDisplayName,
        fieldLabel: fieldDisplayName,
        reason: 'a file-nevhez hasznalja',
      });
    }

    if (field.fn?.source?.trim() === trimmedFieldKey) {
      dependencies.push({
        fieldKey: normalizedFieldKey ?? fieldDisplayName,
        fieldLabel: fieldDisplayName,
        reason: 'derived sourcekent hasznalja',
      });
    }

    if (
      field.quiz?.enabled &&
      field.quiz.distractor?.type === 'derivedRange' &&
      field.quiz.distractor.sourceField.trim() === trimmedFieldKey
    ) {
      dependencies.push({
        fieldKey: normalizedFieldKey ?? fieldDisplayName,
        fieldLabel: fieldDisplayName,
        reason: 'quiz distractor sourcekent hasznalja',
      });
    }

    return dependencies;
  });
};
