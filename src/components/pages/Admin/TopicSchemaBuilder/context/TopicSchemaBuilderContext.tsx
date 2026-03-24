import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopic, updateTopic } from '@service/topics';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { TopicFieldDraft } from '@/types/topicSchema';
import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';
import { validateTopicDraft } from '@/utils/topicSchemaValidation';

import {
  getAvailableDistractorSourceFieldOptions,
  getAvailableFileNameFieldOptions,
  getEmptyFieldDraft,
  getFixedImageUploadFieldDraft,
  getInitialDraft,
  getPersistedFields,
  getPersistedTopicValues,
  getSelectOptionsText,
  isIgnoredCreateImageUploadError,
  normalizeImageUploadField,
} from '../hook/utils';

type TopicSchemaBuilderStateValue = {
  canAddField: boolean;
  canConfigureFixedImageUpload: boolean;
  canSave: boolean;
  description: string;
  draft: ReturnType<typeof getInitialDraft>;
  fieldErrorsByPath: Map<string, string>;
  hasImageUploadField: boolean;
  isAddFieldDialogOpen: boolean;
  isEditFieldDialogOpen: boolean;
  isSaving: boolean;
  metadataErrorsByPath: Map<string, string>;
  metadataFields: readonly {
    key: 'id' | 'label' | 'slug' | 'storage_prefix';
    label: string;
    value: string;
  }[];
  mode: TopicSchemaBuilderPageProps['mode'];
  newFieldDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  newFieldDraft: TopicFieldDraft;
  newFieldErrorsByPath: Map<string, string>;
  newFieldFileNameFieldOptions: Array<{ key: string; label: string }>;
  newFieldIndex: number;
  selectedField: TopicFieldDraft | null;
  selectedFieldDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldFileNameFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldIndex: SelectedFieldIndex;
  submitError: string;
  title: string;
  validation: ReturnType<typeof validateTopicDraft>;
};

type TopicSchemaBuilderActionsValue = {
  getSelectOptionsText: (options: string[] | undefined) => string;
  handleAddField: () => void;
  handleCloseAddFieldDialog: () => void;
  handleCloseEditFieldDialog: () => void;
  handleDeleteSelectedField: () => void;
  handleEditFieldSubmit: () => void;
  handleMoveField: (params: { fromIndex: number; toIndex: number }) => void;
  handleSave: () => Promise<void>;
  setDraft: React.Dispatch<React.SetStateAction<ReturnType<typeof getInitialDraft>>>;
  setIsAddFieldDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditFieldDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewFieldDraft: React.Dispatch<React.SetStateAction<TopicFieldDraft>>;
  setSelectedFieldIndex: React.Dispatch<React.SetStateAction<SelectedFieldIndex>>;
  updateSelectedField: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
};

const TopicSchemaBuilderStateContext = createContext<TopicSchemaBuilderStateValue | null>(null);
const TopicSchemaBuilderActionsContext = createContext<TopicSchemaBuilderActionsValue | null>(null);

export const TopicSchemaBuilderProvider = ({
  children,
  mode,
  topic,
}: PropsWithChildren<TopicSchemaBuilderPageProps>) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => getInitialDraft(topic));
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fixedImageUploadFieldDraft, setFixedImageUploadFieldDraft] = useState(
    () =>
      draft.fields.find((field) => field.type === 'imageUpload') ??
      getFixedImageUploadFieldDraft(),
  );
  const [newFieldDraft, setNewFieldDraft] = useState(() => getEmptyFieldDraft());
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<SelectedFieldIndex>(null);
  const [submitError, setSubmitError] = useState('');

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
  const imageUploadFieldIndex = draft.fields.findIndex((field) => field.type === 'imageUpload');
  const hasImageUploadField = imageUploadFieldIndex >= 0;
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
  const selectedFieldDistractorSourceFieldOptions = getAvailableDistractorSourceFieldOptions({
    currentFieldKey: selectedField?.key,
    fields: draft.fields,
  });

  const handleCloseAddFieldDialog = () => {
    setIsAddFieldDialogOpen(false);
    setNewFieldDraft(getEmptyFieldDraft());
  };

  const handleCloseEditFieldDialog = () => {
    setIsEditFieldDialogOpen(false);
  };

  const handleAddField = () => {
    if (!canAddField || !newFieldDraft.type) {
      return;
    }

    const normalizedField: TopicFieldDraft =
      newFieldDraft.type === 'select'
        ? {
            ...newFieldDraft,
            options: newFieldDraft.options ?? [],
          }
        : newFieldDraft;

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: [...currentDraft.fields, normalizedField],
    }));
    setSelectedFieldIndex(draft.fields.length);
    setIsEditFieldDialogOpen(true);
    handleCloseAddFieldDialog();
  };

  const updateSelectedField = (updater: (field: TopicFieldDraft) => TopicFieldDraft) => {
    if (selectedFieldIndex === null) {
      return;
    }

    if (selectedFieldIndex === 'fixed-image-upload') {
      setFixedImageUploadFieldDraft((currentField) => updater(currentField));
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.map((field, index) =>
        index === selectedFieldIndex ? updater(field) : field,
      ),
    }));
  };

  const handleDeleteSelectedField = () => {
    if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.filter((_, index) => index !== selectedFieldIndex),
    }));
    setIsEditFieldDialogOpen(false);
    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (draft.fields.length <= 1) {
        return null;
      }

      return Math.max(0, currentIndex - 1);
    });
  };

  const handleEditFieldSubmit = () => {
    if (selectedFieldIndex === 'fixed-image-upload') {
      setDraft((currentDraft) => ({
        ...currentDraft,
        fields: [...currentDraft.fields, normalizeImageUploadField(fixedImageUploadFieldDraft)],
      }));
      setSelectedFieldIndex(draft.fields.length);
    }

    setIsEditFieldDialogOpen(false);
  };

  const handleMoveField = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    setDraft((currentDraft) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentDraft.fields.length ||
        toIndex >= currentDraft.fields.length
      ) {
        return currentDraft;
      }

      const nextFields = [...currentDraft.fields];
      const [movedField] = nextFields.splice(fromIndex, 1);

      nextFields.splice(toIndex, 0, movedField);

      return {
        ...currentDraft,
        fields: nextFields,
      };
    });

    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (currentIndex === fromIndex) {
        return toIndex;
      }

      if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
        return currentIndex - 1;
      }

      if (toIndex < fromIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
        return currentIndex + 1;
      }

      return currentIndex;
    });
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSubmitError('');
    setIsSaving(true);

    try {
      const topicId = mode === 'edit' ? topic?.id : draft.id?.trim();

      if (!topicId) {
        throw new Error('Hianyzik a topic azonosito a menteshez.');
      }

      const values = getPersistedTopicValues(draft);

      if (mode === 'edit') {
        await updateTopic({
          topicId,
          values,
        });
      } else {
        await createTopic({
          topicId,
          values,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.list(),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.byId(topicId),
      });

      await navigate({
        to: '/admin',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen mentesi hiba.';
      console.error('Sikertelen topic schema mentes', error);
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const stateValue: TopicSchemaBuilderStateValue = {
    canAddField,
    canConfigureFixedImageUpload,
    canSave,
    description,
    draft,
    fieldErrorsByPath,
    hasImageUploadField,
    isAddFieldDialogOpen,
    isEditFieldDialogOpen,
    isSaving,
    metadataErrorsByPath,
    metadataFields,
    mode,
    newFieldDistractorSourceFieldOptions,
    newFieldDraft,
    newFieldErrorsByPath,
    newFieldFileNameFieldOptions,
    newFieldIndex,
    selectedField,
    selectedFieldDistractorSourceFieldOptions,
    selectedFieldFileNameFieldOptions,
    selectedFieldIndex,
    submitError,
    title,
    validation,
  };

  const actionsValue: TopicSchemaBuilderActionsValue = {
    getSelectOptionsText,
    handleAddField,
    handleCloseAddFieldDialog,
    handleCloseEditFieldDialog,
    handleDeleteSelectedField,
    handleEditFieldSubmit,
    handleMoveField,
    handleSave,
    setDraft,
    setIsAddFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setNewFieldDraft,
    setSelectedFieldIndex,
    updateSelectedField,
  };

  return (
    <TopicSchemaBuilderStateContext.Provider value={stateValue}>
      <TopicSchemaBuilderActionsContext.Provider value={actionsValue}>
        {children}
      </TopicSchemaBuilderActionsContext.Provider>
    </TopicSchemaBuilderStateContext.Provider>
  );
};

const useTopicSchemaBuilderState = () => {
  const context = useContext(TopicSchemaBuilderStateContext);

  if (!context) {
    throw new Error('useTopicSchemaBuilderState must be used within TopicSchemaBuilderProvider.');
  }

  return context;
};

const useTopicSchemaBuilderActions = () => {
  const context = useContext(TopicSchemaBuilderActionsContext);

  if (!context) {
    throw new Error('useTopicSchemaBuilderActions must be used within TopicSchemaBuilderProvider.');
  }

  return context;
};

export { useTopicSchemaBuilderActions, useTopicSchemaBuilderState };
