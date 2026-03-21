import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { TopicField } from '@/types/topics';

import FormField from '../../../ui/Form/FormField';
import type { FormMode, UseAdminFormResult } from './useAdminForm';

type FormViewProps = {
  derivationIndex: UseAdminFormResult['derivationIndex'];
  fields: TopicField[];
  form: UseAdminFormResult['form'];
  isSubmitting: boolean;
  mode: FormMode;
  onSelectPendingImage: UseAdminFormResult['handleSelectPendingImage'];
  pendingImageSelection: UseAdminFormResult['pendingImageSelection'];
  submitError: string;
};

const FormView = ({
  derivationIndex,
  fields,
  form,
  isSubmitting,
  mode,
  onSelectPendingImage,
  pendingImageSelection,
  submitError,
}: FormViewProps) => {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {fields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            form={form}
            derivationIndex={derivationIndex}
            mode={mode}
            pendingImageSelection={pendingImageSelection}
            onSelectPendingImage={onSelectPendingImage}
          />
        ))}
      </Box>

      {pendingImageSelection ? (
        <Box
          sx={{
            marginBottom: '24px',
          }}
        >
          <Typography gutterBottom variant="subtitle2">
            Feltöltésre váró kép
          </Typography>
          <Box
            component="img"
            src={pendingImageSelection.previewUrl}
            alt={pendingImageSelection.file.name}
            sx={{
              display: 'block',
              width: 180,
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              objectFit: 'contain',
              backgroundColor: 'background.paper',
            }}
          />
          <Typography sx={{ marginTop: 1 }} variant="body2" color="text.secondary">
            {pendingImageSelection.file.name}
          </Typography>
        </Box>
      ) : null}

      {submitError ? (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {submitError}
        </Alert>
      ) : null}

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} color="inherit" />
            Mentés...
          </Box>
        ) : (
          'Mentés'
        )}
      </Button>
    </form>
  );
};

export default FormView;
