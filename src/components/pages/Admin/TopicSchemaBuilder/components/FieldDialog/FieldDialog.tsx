import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

import type { TopicFieldDraft } from '@/types/topicSchema';

import FieldDialogBasicsSection from './FieldDialogBasicsSection';
import FieldDialogImageUploadSection from './FieldDialogImageUploadSection';
import FieldDialogQuizSection from './FieldDialogQuizSection';
import FieldDialogSelectOptionsSection from './FieldDialogSelectOptionsSection';
import FieldDialogSettingsSection from './FieldDialogSettingsSection';
import FieldDialogYearSection from './FieldDialogYearSection';

type FieldDialogProps = {
  availableFileNameFieldOptions: Array<{ key: string; label: string }>;
  availableDistractorSourceFieldOptions: Array<{ key: string; label: string }>;
  canSubmit: boolean;
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  isOpen: boolean;
  mode: 'create' | 'edit';
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: () => void;
  optionsText?: string;
  pathPrefix: string;
};

const FieldDialog = ({
  availableFileNameFieldOptions,
  availableDistractorSourceFieldOptions,
  canSubmit,
  errorsByPath,
  field,
  isOpen,
  mode,
  onChange,
  onClose,
  onDelete,
  onSubmit,
  optionsText = '',
  pathPrefix,
}: FieldDialogProps) => {
  const title = mode === 'create' ? 'Uj field hozzaadasa' : 'Field szerkesztes';
  const submitLabel = mode === 'create' ? 'Field hozzaadasa' : 'Kesz';
  const [selectOptionsInputValue, setSelectOptionsInputValue] = useState(optionsText);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth={mode === 'create' ? 'sm' : 'md'}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <FieldDialogBasicsSection
          errorsByPath={errorsByPath}
          field={field}
          mode={mode}
          onChange={onChange}
          pathPrefix={pathPrefix}
        />

        <FieldDialogSelectOptionsSection
          errorsByPath={errorsByPath}
          field={field}
          onChange={onChange}
          onOptionsInputChange={setSelectOptionsInputValue}
          pathPrefix={pathPrefix}
          selectOptionsInputValue={selectOptionsInputValue}
        />

        <FieldDialogYearSection field={field} onChange={onChange} />

        <FieldDialogImageUploadSection
          availableFileNameFieldOptions={availableFileNameFieldOptions}
          errorsByPath={errorsByPath}
          field={field}
          onChange={onChange}
          pathPrefix={pathPrefix}
        />

        <FieldDialogQuizSection
          availableDistractorSourceFieldOptions={availableDistractorSourceFieldOptions}
          errorsByPath={errorsByPath}
          field={field}
          onChange={onChange}
          pathPrefix={pathPrefix}
        />

        <FieldDialogSettingsSection field={field} onChange={onChange} />
      </DialogContent>

      <DialogActions>
        {mode === 'edit' && onDelete ? (
          <Button color="error" onClick={onDelete}>
            Torles
          </Button>
        ) : null}

        <Button onClick={onClose}>Megse</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldDialog;
