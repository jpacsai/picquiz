import { useMemo } from 'react';

import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';
import { validateTopicDraft } from '@/utils/topicSchemaValidation';

import {
  getAvailableAutocompleteCopyFieldOptions,
  getAvailableDistractorSourceFieldOptions,
  getAvailableFileNameFieldOptions,
  getPersistedFields,
  isIgnoredCreateImageUploadError,
} from '../hook/utils';
import type { TopicSchemaBuilderStateValue } from './types';

type BuildStateValueParams = {
  draft: TopicSchemaBuilderStateValue['draft'];
  fixedImageUploadFieldDraft: NonNullable<TopicSchemaBuilderStateValue['selectedField']>;
  isAddFieldDialogOpen: boolean;
  isDeleteFieldDialogOpen: boolean;
  isEditFieldDialogOpen: boolean;
  isSaving: boolean;
  mode: TopicSchemaBuilderPageProps['mode'];
  newFieldDraft: TopicSchemaBuilderStateValue['newFieldDraft'];
  selectedFieldIndex: SelectedFieldIndex;
  submitError: string;
  topic: TopicSchemaBuilderPageProps['topic'];
};

export const useTopicSchemaBuilderStateValue = ({
  draft,
  fixedImageUploadFieldDraft,
  isAddFieldDialogOpen,
  isDeleteFieldDialogOpen,
  isEditFieldDialogOpen,
  isSaving,
  mode,
  newFieldDraft,
  selectedFieldIndex,
  submitError,
  topic,
}: BuildStateValueParams): TopicSchemaBuilderStateValue => {
  const validationDraft = useMemo(
    () => ({
      ...draft,
      fields: getPersistedFields(draft.fields),
    }),
    [draft],
  );
  const validation = useMemo(() => validateTopicDraft(validationDraft), [validationDraft]);
  const canSave = validation.errors.length === 0 && !isSaving;
  const title = mode === 'create' ? 'Uj topic schema' : `${topic?.label ?? 'Topic'} schema`;
  const description =
    mode === 'create'
      ? 'Itt lesz a topic schema builder. A kovetkezo lepesben jon a metadata es field editor.'
      : 'Itt lesz a topic schema szerkeszto. A kovetkezo lepesben jon a metadata es field editor.';

  const metadataFields = [
    {
      key: 'id',
      label: 'Topic ID',
      value: draft.id ?? '',
    },
    {
      key: 'label',
      label: 'Label',
      value: draft.label ?? '',
    },
    {
      key: 'slug',
      label: 'Slug',
      value: draft.slug ?? '',
    },
    {
      key: 'storage_prefix',
      label: 'Storage prefix',
      value: draft.storage_prefix ?? '',
    },
  ] as const;
  const metadataErrorsByPath = new Map(
    validation.errors.map((issue) => [issue.path, issue.message]),
  );
  const fieldErrorsByPath = new Map(validation.errors.map((issue) => [issue.path, issue.message]));
  const newFieldIndex = draft.fields.length;
  const newFieldValidation = useMemo(
    () =>
      validateTopicDraft({
        ...draft,
        fields: getPersistedFields([...draft.fields, newFieldDraft]),
      }),
    [draft, newFieldDraft],
  );
  const newFieldErrorsByPath = new Map(
    newFieldValidation.errors
      .filter((issue) => issue.path.startsWith(`fields[${newFieldIndex}]`))
      .filter(
        (issue) =>
          !(
            newFieldDraft.type === 'imageUpload' &&
            isIgnoredCreateImageUploadError(issue.path, newFieldIndex)
          ),
      )
      .map((issue) => [issue.path, issue.message]),
  );
  const canAddField = newFieldErrorsByPath.size === 0;
  const hasImageUploadField = draft.fields.some((field) => field.type === 'imageUpload');
  const selectedField =
    selectedFieldIndex === 'fixed-image-upload'
      ? fixedImageUploadFieldDraft
      : selectedFieldIndex !== null
        ? (draft.fields[selectedFieldIndex] ?? null)
        : null;
  const newFieldFileNameFieldOptions = getAvailableFileNameFieldOptions({
    fields: draft.fields,
  });
  const canConfigureFixedImageUpload = newFieldFileNameFieldOptions.length > 0;
  const selectedFieldFileNameFieldOptions = getAvailableFileNameFieldOptions({
    currentFieldKey: selectedField?.key,
    fields: draft.fields,
  });
  const newFieldDistractorSourceFieldOptions = getAvailableDistractorSourceFieldOptions({
    currentFieldKey: newFieldDraft.key,
    fields: draft.fields,
  });
  const newFieldAutocompleteCopyFieldOptions = getAvailableAutocompleteCopyFieldOptions({
    currentFieldKey: newFieldDraft.key,
    fields: draft.fields,
  });
  const selectedFieldDistractorSourceFieldOptions = getAvailableDistractorSourceFieldOptions({
    currentFieldKey: selectedField?.key,
    fields: draft.fields,
  });
  const selectedFieldAutocompleteCopyFieldOptions = getAvailableAutocompleteCopyFieldOptions({
    currentFieldKey: selectedField?.key,
    fields: draft.fields,
  });

  return {
    canAddField,
    canConfigureFixedImageUpload,
    canSave,
    description,
    draft,
    fieldErrorsByPath,
    hasImageUploadField,
    isAddFieldDialogOpen,
    isDeleteFieldDialogOpen,
    isEditFieldDialogOpen,
    isSaving,
    metadataErrorsByPath,
    metadataFields,
    mode,
    newFieldAutocompleteCopyFieldOptions,
    newFieldDistractorSourceFieldOptions,
    newFieldDraft,
    newFieldErrorsByPath,
    newFieldFileNameFieldOptions,
    newFieldIndex,
    selectedField,
    selectedFieldAutocompleteCopyFieldOptions,
    selectedFieldDistractorSourceFieldOptions,
    selectedFieldFileNameFieldOptions,
    selectedFieldIndex,
    submitError,
    title,
    validation,
  };
};
