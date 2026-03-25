import type { TopicFieldDraft } from '@/types/topicSchema';
import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';
import type { validateTopicDraft } from '@/utils/topicSchemaValidation';

import type { getInitialDraft } from '../hook/utils';

export type TopicSchemaBuilderStateValue = {
  canAddField: boolean;
  canConfigureFixedImageUpload: boolean;
  canSave: boolean;
  description: string;
  draft: ReturnType<typeof getInitialDraft>;
  fieldErrorsByPath: Map<string, string>;
  hasImageUploadField: boolean;
  isAddFieldDialogOpen: boolean;
  isDeleteFieldDialogOpen: boolean;
  isEditFieldDialogOpen: boolean;
  isSaving: boolean;
  metadataErrorsByPath: Map<string, string>;
  metadataFields: readonly {
    key: 'id' | 'label' | 'slug' | 'storage_prefix';
    label: string;
    value: string;
  }[];
  mode: TopicSchemaBuilderPageProps['mode'];
  newFieldAutocompleteCopyFieldOptions: Array<{ key: string; label: string }>;
  newFieldAutocompleteMatchFieldOptions: Array<{ key: string; label: string }>;
  newFieldDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  newFieldDraft: TopicFieldDraft;
  newFieldErrorsByPath: Map<string, string>;
  newFieldFileNameFieldOptions: Array<{ key: string; label: string }>;
  newFieldIndex: number;
  selectedField: TopicFieldDraft | null;
  selectedFieldAutocompleteCopyFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldAutocompleteMatchFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldFileNameFieldOptions: Array<{ key: string; label: string }>;
  selectedFieldIndex: SelectedFieldIndex;
  submitError: string;
  title: string;
  validation: ReturnType<typeof validateTopicDraft>;
};

export type TopicSchemaBuilderActionsValue = {
  getSelectOptionsText: (options: string[] | undefined) => string;
  handleAddField: () => void;
  handleCloseAddFieldDialog: () => void;
  handleCloseDeleteFieldDialog: () => void;
  handleCloseEditFieldDialog: () => void;
  handleConfirmDeleteSelectedField: () => void;
  handleEditFieldSubmit: () => void;
  handleMoveField: (params: { fromIndex: number; toIndex: number }) => void;
  handleOpenDeleteFieldDialog: () => void;
  handleSave: () => Promise<void>;
  setDraft: React.Dispatch<React.SetStateAction<ReturnType<typeof getInitialDraft>>>;
  setIsAddFieldDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditFieldDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewFieldDraft: React.Dispatch<React.SetStateAction<TopicFieldDraft>>;
  setSelectedFieldIndex: React.Dispatch<React.SetStateAction<SelectedFieldIndex>>;
  updateSelectedField: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
};
