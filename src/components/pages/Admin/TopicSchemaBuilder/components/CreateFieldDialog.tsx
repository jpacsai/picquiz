import type { TopicFieldDraft } from '@/types/topicSchema';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';
import FieldDialog from './FieldDialog/FieldDialog';

const CreateFieldDialog = () => {
  const {
    canAddField,
    isAddFieldDialogOpen,
    newFieldAutocompleteCopyFieldOptions,
    newFieldDistractorSourceFieldOptions,
    newFieldDraft,
    newFieldErrorsByPath,
    newFieldFileNameFieldOptions,
    newFieldIndex,
  } = useTopicSchemaBuilderState();
  const { getSelectOptionsText, handleAddField, handleCloseAddFieldDialog, setNewFieldDraft } =
    useTopicSchemaBuilderActions();

  return (
    <FieldDialog
      key={`create-${isAddFieldDialogOpen ? 'open' : 'closed'}`}
      canSubmit={canAddField}
      errorsByPath={newFieldErrorsByPath}
      field={newFieldDraft}
      isOpen={isAddFieldDialogOpen}
      mode="create"
      availableAutocompleteCopyFieldOptions={newFieldAutocompleteCopyFieldOptions}
      availableFileNameFieldOptions={newFieldFileNameFieldOptions}
      availableDistractorSourceFieldOptions={newFieldDistractorSourceFieldOptions}
      onChange={(updater) =>
        setNewFieldDraft((currentField: TopicFieldDraft) => updater(currentField))
      }
      onClose={handleCloseAddFieldDialog}
      onSubmit={handleAddField}
      optionsText={getSelectOptionsText(newFieldDraft.options)}
      pathPrefix={`fields[${newFieldIndex}]`}
    />
  );
};

export default CreateFieldDialog;
