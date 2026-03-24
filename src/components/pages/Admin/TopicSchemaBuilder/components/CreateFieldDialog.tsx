import FieldDialog from './FieldDialog';
import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/TopicSchemaBuilderContext';

const CreateFieldDialog = () => {
  const {
    canAddField,
    isAddFieldDialogOpen,
    newFieldDistractorSourceFieldOptions,
    newFieldDraft,
    newFieldErrorsByPath,
    newFieldFileNameFieldOptions,
    newFieldIndex,
  } = useTopicSchemaBuilderState();
  const {
    getSelectOptionsText,
    handleAddField,
    handleCloseAddFieldDialog,
    setNewFieldDraft,
  } = useTopicSchemaBuilderActions();

  return (
    <FieldDialog
      key={`create-${isAddFieldDialogOpen ? 'open' : 'closed'}`}
      canSubmit={canAddField}
      errorsByPath={newFieldErrorsByPath}
      field={newFieldDraft}
      isOpen={isAddFieldDialogOpen}
      mode="create"
      availableFileNameFieldOptions={newFieldFileNameFieldOptions}
      availableDistractorSourceFieldOptions={newFieldDistractorSourceFieldOptions}
      onChange={(updater) => setNewFieldDraft((currentField) => updater(currentField))}
      onClose={handleCloseAddFieldDialog}
      onSubmit={handleAddField}
      optionsText={getSelectOptionsText(newFieldDraft.options)}
      pathPrefix={`fields[${newFieldIndex}]`}
    />
  );
};

export default CreateFieldDialog;
