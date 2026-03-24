import FieldDialog from './FieldDialog';
import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/TopicSchemaBuilderContext';

const EditFieldDialog = () => {
  const {
    draft,
    fieldErrorsByPath,
    isEditFieldDialogOpen,
    selectedField,
    selectedFieldDistractorSourceFieldOptions,
    selectedFieldFileNameFieldOptions,
    selectedFieldIndex,
  } = useTopicSchemaBuilderState();
  const {
    getSelectOptionsText,
    handleCloseEditFieldDialog,
    handleDeleteSelectedField,
    handleEditFieldSubmit,
    updateSelectedField,
  } = useTopicSchemaBuilderActions();

  if (!selectedField) {
    return null;
  }

  return (
    <FieldDialog
      key={`edit-${isEditFieldDialogOpen ? 'open' : 'closed'}-${
        selectedFieldIndex === 'fixed-image-upload'
          ? 'fixed-image-upload'
          : selectedFieldIndex ?? 'none'
      }`}
      canSubmit
      availableFileNameFieldOptions={selectedFieldFileNameFieldOptions}
      availableDistractorSourceFieldOptions={selectedFieldDistractorSourceFieldOptions}
      errorsByPath={fieldErrorsByPath}
      field={selectedField}
      isOpen={isEditFieldDialogOpen}
      mode="edit"
      onChange={updateSelectedField}
      onClose={handleCloseEditFieldDialog}
      onDelete={selectedFieldIndex === 'fixed-image-upload' ? undefined : handleDeleteSelectedField}
      onSubmit={handleEditFieldSubmit}
      optionsText={getSelectOptionsText(selectedField.options)}
      pathPrefix={
        selectedFieldIndex === 'fixed-image-upload'
          ? `fields[${draft.fields.length}]`
          : `fields[${selectedFieldIndex}]`
      }
    />
  );
};

export default EditFieldDialog;
