import { Alert, Box } from '@mui/material';

import type { TopicSchemaBuilderMode } from '@/types/topicSchemaBuilder';

import FieldDialog from './components/FieldDialog';
import FieldListSection from './components/FieldListSection';
import TopicMetadataSection from './components/TopicMetadataSection';
import TopicSchemaBuilderHeader from './components/TopicSchemaBuilderHeader';
import ValidationSummary from './components/ValidationSummary';
import type { useTopicSchemaBuilder } from './hook/useTopicSchemaBuilder';

type TopicSchemaBuilderPageViewProps = {
  builder: ReturnType<typeof useTopicSchemaBuilder>;
  mode: TopicSchemaBuilderMode;
};

const TopicSchemaBuilderPageView = ({ builder, mode }: TopicSchemaBuilderPageViewProps) => {
  const {
    canAddField,
    canConfigureFixedImageUpload,
    canSave,
    description,
    draft,
    fieldErrorsByPath,
    handleAddField,
    handleCloseAddFieldDialog,
    handleCloseEditFieldDialog,
    handleDeleteSelectedField,
    handleEditFieldSubmit,
    handleMoveField,
    handleSave,
    hasImageUploadField,
    isAddFieldDialogOpen,
    isEditFieldDialogOpen,
    isSaving,
    metadataErrorsByPath,
    metadataFields,
    newFieldDistractorSourceFieldOptions,
    newFieldDraft,
    newFieldErrorsByPath,
    newFieldFileNameFieldOptions,
    newFieldIndex,
    selectedField,
    selectedFieldDistractorSourceFieldOptions,
    selectedFieldFileNameFieldOptions,
    selectedFieldIndex,
    setDraft,
    setIsAddFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setNewFieldDraft,
    setSelectedFieldIndex,
    submitError,
    title,
    updateSelectedField,
    validation,
    getSelectOptionsText,
  } = builder;

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TopicSchemaBuilderHeader
        canSave={canSave}
        description={description}
        isSaving={isSaving}
        mode={mode}
        onSave={handleSave}
        title={title}
      />

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TopicMetadataSection
        errorsByPath={metadataErrorsByPath}
        fields={metadataFields}
        mode={mode}
        onChange={(key, value) => {
          setDraft((currentDraft) => ({
            ...currentDraft,
            [key]: value,
          }));
        }}
      />

      <ValidationSummary errors={validation.errors} warnings={validation.warnings} />

      <FieldListSection
        canConfigureFixedImageUpload={canConfigureFixedImageUpload}
        fields={draft.fields}
        hasImageUploadField={hasImageUploadField}
        onAddField={() => setIsAddFieldDialogOpen(true)}
        onConfigureFixedImageUpload={() => {
          setSelectedFieldIndex('fixed-image-upload');
          setIsEditFieldDialogOpen(true);
        }}
        onEditField={(index) => {
          setSelectedFieldIndex(index);
          setIsEditFieldDialogOpen(true);
        }}
        onMoveField={handleMoveField}
        selectedFieldIndex={selectedFieldIndex}
        validationErrors={validation.errors}
      />

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
