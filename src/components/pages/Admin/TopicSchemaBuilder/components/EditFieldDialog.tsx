import { useState } from 'react';

import DeleteFieldBlockedDialog from './DeleteFieldBlockedDialog';
import FieldDialog from './FieldDialog/FieldDialog';
import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';
import { getFieldDeletionDependencies } from '../context/fieldActions';

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
    handleEditFieldSubmit,
    handleOpenDeleteFieldDialog,
    updateSelectedField,
  } = useTopicSchemaBuilderActions();
  const [isDeleteBlockedDialogOpen, setIsDeleteBlockedDialogOpen] = useState(false);

  if (!selectedField) {
    return null;
  }

  const deletionDependencies =
    selectedFieldIndex !== 'fixed-image-upload' && selectedField.key
      ? getFieldDeletionDependencies({
          fieldKey: selectedField.key,
          fields: draft.fields,
        })
      : [];
  const fieldLabel = selectedField.label?.trim() || selectedField.key?.trim() || 'ismeretlen field';

  return (
    <>
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
          selectedFieldIndex === 'fixed-image-upload'
            ? undefined
            : () => {
                if (deletionDependencies.length > 0) {
                  setIsDeleteBlockedDialogOpen(true);
                  return;
                }

                handleOpenDeleteFieldDialog();
              }
        }
        onSubmit={handleEditFieldSubmit}
        optionsText={getSelectOptionsText(selectedField.options)}
        pathPrefix={
          selectedFieldIndex === 'fixed-image-upload'
            ? `fields[${draft.fields.length}]`
            : `fields[${selectedFieldIndex}]`
        }
      />

      <DeleteFieldBlockedDialog
        dependencies={deletionDependencies}
        fieldLabel={fieldLabel}
        isOpen={isDeleteBlockedDialogOpen}
        onClose={() => setIsDeleteBlockedDialogOpen(false)}
      />
    </>
  );
};

export default EditFieldDialog;
