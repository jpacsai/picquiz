import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { TopicField } from '@/types/topics';

import FormField from './FormField';
import { type FormMode, useAdminForm } from './useAdminForm';

type FormProps = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};

const Form = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: FormProps) => {
  const {
    derivationIndex,
    form,
    handleSelectPendingImage,
    isSubmitting,
    pendingImageSelection,
    submitError,
  } = useAdminForm({
    collectionName,
    fields,
    initialValues,
    itemId,
    mode,
    storagePrefix,
    topicId,
  });

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
            onSelectPendingImage={handleSelectPendingImage}
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

export default Form;
