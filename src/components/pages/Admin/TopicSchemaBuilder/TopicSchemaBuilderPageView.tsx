import { Alert, Box } from '@mui/material';

import FieldDialog from './components/FieldDialog';
import FieldListSection from './components/FieldListSection';
import TopicMetadataSection from './components/TopicMetadataSection';
import TopicSchemaBuilderHeader from './components/TopicSchemaBuilderHeader';
import ValidationSummary from './components/ValidationSummary';
import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from './context/TopicSchemaBuilderContext';

const TopicSchemaBuilderPageView = () => {
  const {
    canAddField,
    draft,
    fieldErrorsByPath,
    isAddFieldDialogOpen,
    isEditFieldDialogOpen,
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
  } = useTopicSchemaBuilderState();
  const {
    getSelectOptionsText,
    handleAddField,
    handleCloseAddFieldDialog,
    handleCloseEditFieldDialog,
    handleDeleteSelectedField,
    handleEditFieldSubmit,
    setNewFieldDraft,
    updateSelectedField,
  } = useTopicSchemaBuilderActions();

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TopicSchemaBuilderHeader />

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TopicMetadataSection />

      <ValidationSummary />

      <FieldListSection />

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

      {selectedField ? (
        <FieldDialog
          key={`edit-${isEditFieldDialogOpen ? 'open' : 'closed'}-${
            selectedFieldIndex === 'fixed-image-upload'
              ? 'fixed-image-upload'
              : (selectedFieldIndex ?? 'none')
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
          onDelete={
            selectedFieldIndex === 'fixed-image-upload' ? undefined : handleDeleteSelectedField
          }
          onSubmit={handleEditFieldSubmit}
          optionsText={getSelectOptionsText(selectedField.options)}
          pathPrefix={
            selectedFieldIndex === 'fixed-image-upload'
              ? `fields[${draft.fields.length}]`
              : `fields[${selectedFieldIndex}]`
          }
        />
      ) : null}
    </Box>
  );
};

export default TopicSchemaBuilderPageView;
