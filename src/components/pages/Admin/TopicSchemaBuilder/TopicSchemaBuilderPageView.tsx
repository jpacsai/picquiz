import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

import type { Topic } from '@/types/topics';
import type { TopicSchemaBuilderMode } from '@/types/topicSchemaBuilder';

import FieldDialog from './components/FieldDialog';
import FieldListSection from './components/FieldListSection';
import TopicMetadataSection from './components/TopicMetadataSection';
import ValidationSummary from './components/ValidationSummary';
import type { useTopicSchemaBuilder } from './hook/useTopicSchemaBuilder';

type TopicSchemaBuilderPageViewProps = {
  builder: ReturnType<typeof useTopicSchemaBuilder>;
  mode: TopicSchemaBuilderMode;
  topic?: Topic;
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>

        <Stack direction="row" gap={1.5}>
          <RouterLink to="/admin" underline="none" preload="intent">
            <Button component="span" startIcon={<ArrowBackIcon />} variant="outlined">
              Vissza az adminhoz
            </Button>
          </RouterLink>

          <Button variant="contained" onClick={handleSave} disabled={!canSave}>
            {isSaving
              ? 'Mentes...'
              : mode === 'create'
                ? 'Schema letrehozasa'
                : 'Valtozasok mentese'}
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info">
        Ez most az elso skeleton lepes. A page mar navigalhato, de a builder UI meg nincs bekotve.
      </Alert>

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
