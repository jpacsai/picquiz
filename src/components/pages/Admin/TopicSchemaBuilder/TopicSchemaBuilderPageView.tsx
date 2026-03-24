import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Alert, Box, Button, Card, IconButton, Stack, TextField, Typography } from '@mui/material';

import type { Topic } from '@/types/topics';
import type { TopicSchemaBuilderMode } from '@/types/topicSchemaBuilder';

import FieldDialog from './components/FieldDialog';
import FixedImageUploadCard from './components/FixedImageUploadCard';
import type { useTopicSchemaBuilder } from './hook/useTopicSchemaBuilder';

type TopicSchemaBuilderPageViewProps = {
  builder: ReturnType<typeof useTopicSchemaBuilder>;
  mode: TopicSchemaBuilderMode;
  topic?: Topic;
};

const TopicSchemaBuilderPageView = ({ builder, mode, topic }: TopicSchemaBuilderPageViewProps) => {
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

      <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
        <Stack spacing={2.5}>
          <Typography variant="h6">Topic metadata</Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            {metadataFields.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                value={field.value}
                disabled={mode === 'edit' && field.key === 'id'}
                error={metadataErrorsByPath.has(field.key)}
                helperText={metadataErrorsByPath.get(field.key) ?? ' '}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    [field.key]: nextValue,
                  }));
                }}
              />
            ))}
          </Box>
        </Stack>
      </Card>

      {validation.errors.length ? (
        <Alert severity="error">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Meg megoldando hibak</Typography>
            {validation.errors.map((issue) => (
              <Typography key={`${issue.path}-${issue.message}`} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert severity="success">A topic metadata jelenleg ervenyes.</Alert>
      )}

      {validation.warnings.length ? (
        <Alert severity="warning">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Figyelmeztetesek</Typography>
            {validation.warnings.map((issue) => (
              <Typography key={`${issue.path}-${issue.message}`} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Typography variant="h6">Field lista</Typography>

            <Button variant="contained" onClick={() => setIsAddFieldDialogOpen(true)}>
              Uj field
            </Button>
          </Stack>

          {draft.fields.length ? (
            <Stack spacing={1.5}>
              {draft.fields.map((field, index) => {
                const fieldIssues = validation.errors.filter((issue) =>
                  issue.path.startsWith(`fields[${index}]`),
                );
                const isIncomplete = fieldIssues.length > 0;
                const fieldHelperText =
                  field.type === 'imageUpload' && !(field.fileNameFields?.length ?? 0)
                    ? 'Vegyel fel hozza legalabb egy required fieldet.'
                    : fieldIssues[0]?.message;

                return (
                  <Card
                    key={`${field.key ?? 'field'}-${index}`}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderColor: index === selectedFieldIndex ? 'primary.main' : undefined,
                      boxShadow: index === selectedFieldIndex ? 1 : 0,
                      opacity: isIncomplete ? 0.72 : 1,
                      backgroundColor: isIncomplete ? 'action.hover' : undefined,
                    }}
                    onClick={() => {
                      setSelectedFieldIndex(index);
                      setIsEditFieldDialogOpen(true);
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      gap={1}
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {field.label || 'Nev nelkuli field'}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          #{index + 1} | key: {field.key || '-'} | type: {field.type || '-'}
                        </Typography>
                        {isIncomplete ? (
                          <Typography color="text.secondary" variant="body2">
                            Disabled, amig nincs keszre konfiguralva. {fieldHelperText}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Typography color="text.secondary" variant="body2">
                          Kattints a szerkeszteshez
                        </Typography>

                        <IconButton
                          aria-label={`${field.label || field.key || 'field'} mozgatasa felfele`}
                          size="small"
                          disabled={index === 0}
                          onClick={() => {
                            handleMoveField({
                              fromIndex: index,
                              toIndex: index - 1,
                            });
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          aria-label={`${field.label || field.key || 'field'} mozgatasa lefele`}
                          size="small"
                          disabled={index === draft.fields.length - 1}
                          onClick={() => {
                            handleMoveField({
                              fromIndex: index,
                              toIndex: index + 1,
                            });
                          }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}

              {!hasImageUploadField ? (
                <FixedImageUploadCard
                  canConfigure={canConfigureFixedImageUpload}
                  onClick={
                    canConfigureFixedImageUpload
                      ? () => {
                          setSelectedFieldIndex('fixed-image-upload');
                          setIsEditFieldDialogOpen(true);
                        }
                      : undefined
                  }
                />
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="info">
                Meg nincs field. Az `Uj field` gombbal tudsz uj mezot felvenni.
              </Alert>

              {!hasImageUploadField ? (
                <FixedImageUploadCard
                  canConfigure={canConfigureFixedImageUpload}
                  showClickHint={false}
                  onClick={
                    canConfigureFixedImageUpload
                      ? () => {
                          setSelectedFieldIndex('fixed-image-upload');
                          setIsEditFieldDialogOpen(true);
                        }
                      : undefined
                  }
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ConstructionIcon color="action" />
            <Typography variant="h6">Kovetkezo szeletek</Typography>
          </Stack>

          <Typography color="text.secondary">
            A kovetkezo review-barat lepesekben ide kerul majd a topic metadata editor, a field
            lista, a field editor es a validation panel.
          </Typography>

          {topic ? (
            <Box>
              <Typography variant="subtitle2">Betoltott topic</Typography>
              <Typography color="text.secondary">
                {topic.label} ({topic.id})
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Card>

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
