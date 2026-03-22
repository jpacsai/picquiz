import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import FormField from '@/components/ui/Form/FormField';
import type { TopicField } from '@/types/topics';

import type { FormMode, UseTopicItemFormResult } from './useTopicItemForm';

type TopicItemFormViewProps = {
  derivationIndex: UseTopicItemFormResult['derivationIndex'];
  fields: TopicField[];
  form: UseTopicItemFormResult['form'];
  isRefreshingSelectOptions?: boolean;
  isSubmitting: boolean;
  mode: FormMode;
  onSelectPendingImage: UseTopicItemFormResult['handleSelectPendingImage'];
  onRefreshSelectOptions?: () => void;
  onUndo: UseTopicItemFormResult['handleUndo'];
  pendingImageSelection: UseTopicItemFormResult['pendingImageSelection'];
  submitError: string;
};

const TopicItemFormView = ({
  derivationIndex,
  fields,
  form,
  isRefreshingSelectOptions = false,
  isSubmitting,
  mode,
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
        ? [field.targetFields.desktop, field.targetFields.mobile].filter((targetKey) =>
            /url/i.test(targetKey),
          )
        : [],
    ),
  );
  const visibleFields = fields.filter((field) => !hiddenFieldKeys.has(field.key));

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
        {visibleFields.map((field) => (
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
                {isRefreshingSelectOptions ? (
                  <CircularProgress size={18} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            ) : null}

            {mode === 'edit' ? (
              <Button
                type="button"
                variant="outlined"
                disabled={isSubmitting || !isActionEnabled}
                onClick={onUndo}
              >
                Visszaállítás
              </Button>
            ) : null}

            <Button type="submit" variant="contained" disabled={isSubmitting || !isActionEnabled}>
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
