import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import FormField from '@/components/ui/Form/FormField';
import type { FormMode, UseTopicItemFormResult } from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

type TopicItemFormViewProps = {
  autocompleteCopyWarning: string;
  autocompleteOptionsByField?: Record<string, string[]>;
  derivationIndex: UseTopicItemFormResult['derivationIndex'];
  fields: TopicField[];
  form: UseTopicItemFormResult['form'];
  isRefreshingSelectOptions?: boolean;
  isSubmitting: boolean;
  mode: FormMode;
  onAutocompleteCopy: UseTopicItemFormResult['handleAutocompleteCopy'];
  onRefreshSelectOptions?: () => void;
  onSelectPendingImage: UseTopicItemFormResult['handleSelectPendingImage'];
  onUndo: UseTopicItemFormResult['handleUndo'];
  pendingImageSelection: UseTopicItemFormResult['pendingImageSelection'];
  submitError: string;
};

const TopicItemFormView = ({
  autocompleteCopyWarning,
  autocompleteOptionsByField,
  derivationIndex,
  fields,
  form,
  isRefreshingSelectOptions = false,
  isSubmitting,
  mode,
  onAutocompleteCopy,
  onSelectPendingImage,
  onRefreshSelectOptions,
  onUndo,
  pendingImageSelection,
  submitError,
}: TopicItemFormViewProps) => {
  const hasRefreshableSelectFields = fields.some((field) => field.type === 'select');
  const hiddenFieldKeys = new Set(
    fields.flatMap((field) =>
      field.type === 'imageUpload'
        ? [
            field.targetFields.desktop,
            field.targetFields.mobile,
            field.targetFields.desktopPath,
            field.targetFields.mobilePath,
          ].filter(
            (targetKey): targetKey is string =>
              typeof targetKey === 'string' && targetKey.length > 0,
          )
        : [],
    ),
  );
  const visibleFields = fields.filter((field) => !hiddenFieldKeys.has(field.key));
  const regularFields = visibleFields.filter((field) => field.type !== 'imageUpload');
  const imageUploadFields = visibleFields.filter((field) => field.type === 'imageUpload');

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state: { values: Record<string, string | number | boolean> }) => state.values}>
        {(formValues: Record<string, string | number | boolean>) => (
          <>
            {regularFields.length > 0 ? (
              <Box
                sx={{
                  alignItems: 'end',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px',
                  marginBottom: imageUploadFields.length > 0 ? '20px' : '30px',
                }}
                data-testid="topic-item-form-fields-container"
              >
                {regularFields.map((field) => (
                  <FormField
                    key={field.key}
                    autocompleteOptions={autocompleteOptionsByField?.[field.key]}
                    fields={fields}
                    field={field}
                    form={form}
                    formValues={formValues}
                    derivationIndex={derivationIndex}
                    mode={mode}
                    onAutocompleteCopy={onAutocompleteCopy}
                    pendingImageSelection={pendingImageSelection}
                    onSelectPendingImage={onSelectPendingImage}
                  />
                ))}
              </Box>
            ) : null}

            {imageUploadFields.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gap: '20px',
                  gridTemplateColumns: pendingImageSelection
                    ? {
                        md: 'minmax(280px, 1fr) minmax(220px, auto)',
                        xs: '1fr',
                      }
                    : '1fr',
                  alignItems: 'start',
                  marginBottom: '30px',
                }}
                data-testid="topic-item-form-image-upload-container"
              >
                <Box
                  sx={{
                    display: 'grid',
                    gap: '20px',
                  }}
                >
                  {imageUploadFields.map((field) => (
                    <FormField
                      key={field.key}
                      autocompleteOptions={autocompleteOptionsByField?.[field.key]}
                      fields={fields}
                      field={field}
                      form={form}
                      formValues={formValues}
                      derivationIndex={derivationIndex}
                      mode={mode}
                      onAutocompleteCopy={onAutocompleteCopy}
                      pendingImageSelection={pendingImageSelection}
                      onSelectPendingImage={onSelectPendingImage}
                    />
                  ))}
                </Box>

                {pendingImageSelection ? (
                  <Box
                    sx={{
                      minWidth: 0,
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
              </Box>
            ) : null}
          </>
        )}
      </form.Subscribe>

      {autocompleteCopyWarning ? (
        <Alert severity="warning" sx={{ marginBottom: '16px' }}>
          {autocompleteCopyWarning}
        </Alert>
      ) : null}

      {submitError ? (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {submitError}
        </Alert>
      ) : null}

      <form.Subscribe selector={(state: { isDirty: boolean }) => state.isDirty}>
        {(isDirty: boolean) => (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {(() => {
              const isActionEnabled = isDirty || Boolean(pendingImageSelection);

              return (
                <>
                  {hasRefreshableSelectFields && onRefreshSelectOptions ? (
                    <IconButton
                      type="button"
                      aria-label="Selectek frissítése"
                      disabled={isSubmitting || isRefreshingSelectOptions}
                      onClick={onRefreshSelectOptions}
                    >
                      {isRefreshingSelectOptions ? <CircularProgress size={18} /> : <RefreshIcon />}
                    </IconButton>
                  ) : null}

                  <Button
                    type="button"
                    variant="outlined"
                    disabled={isSubmitting || !isActionEnabled}
                    onClick={onUndo}
                  >
                    Visszaállítás
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !isActionEnabled}
                  >
                    {isSubmitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} color="inherit" />
                        Mentés...
                      </Box>
                    ) : (
                      'Mentés'
                    )}
                  </Button>
                </>
              );
            })()}
          </Box>
        )}
      </form.Subscribe>
    </form>
  );
};

export default TopicItemFormView;
