import { TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogYearSectionProps = {
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
};

const FieldDialogYearSection = ({ field, onChange }: FieldDialogYearSectionProps) => {
  if (field.type !== 'year' && field.type !== 'yearRange') {
    return null;
  }

  return (
    <>
      <TextField
        label="Minimum year"
        type="number"
        value={typeof field.min === 'number' && !Number.isNaN(field.min) ? field.min : ''}
        helperText=" "
        onChange={(event) => {
          const nextValue = event.target.value;

          onChange((currentField) => ({
            ...currentField,
            min: nextValue === '' ? undefined : Number(nextValue),
          }));
        }}
        fullWidth
        margin="dense"
        sx={{ mt: 0, mb: 0.25 }}
      />

      <TextField
        label="Maximum year"
        value={
          field.max === 'todayYear'
            ? 'todayYear'
            : typeof field.max === 'number' && !Number.isNaN(field.max)
              ? field.max
              : ''
        }
        helperText="Adj meg egy evszamot vagy a `todayYear` erteket."
        onChange={(event) => {
          const nextValue = event.target.value;

          onChange((currentField) => ({
            ...currentField,
            max:
              nextValue === ''
                ? undefined
                : nextValue === 'todayYear'
                  ? 'todayYear'
                  : Number(nextValue),
          }));
        }}
        fullWidth
        margin="dense"
        sx={{ mt: 0, mb: 0.25 }}
      />
    </>
  );
};

export default FieldDialogYearSection;
