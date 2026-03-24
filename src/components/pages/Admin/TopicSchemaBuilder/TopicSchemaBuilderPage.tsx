import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Alert, Box, Button, Card, IconButton, Stack, TextField, Typography } from '@mui/material';
import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopic, updateTopic } from '@service/topics';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import type { Topic } from '@/types/topics';
import type { TopicDraft, TopicFieldDraft } from '@/types/topicSchema';
import { validateTopicDraft } from '@/utils/topicSchemaValidation';

import FieldDialog from './FieldDialog';

type TopicSchemaBuilderPageProps = {
  mode: 'create' | 'edit';
  topic?: Topic;
};

type SelectedFieldIndex = number | 'fixed-image-upload' | null;

const IMAGE_UPLOAD_TARGET_FIELD_KEYS = {
  desktopPath: 'image_path_desktop',
  desktop: 'image_url_desktop',
  mobilePath: 'image_path_mobile',
  mobile: 'image_url_mobile',
} as const;

const IMAGE_UPLOAD_SYSTEM_FIELDS: TopicFieldDraft[] = [
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
    label: 'Kep path - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
    label: 'Kep url - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
    label: 'Kep path - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
    label: 'Kep url - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
];

const IMAGE_UPLOAD_SYSTEM_FIELD_KEYS = new Set(
  IMAGE_UPLOAD_SYSTEM_FIELDS.map((field) => field.key).filter((key): key is string => Boolean(key)),
);

const isImageUploadSystemField = (field: TopicFieldDraft) =>
  typeof field.key === 'string' && IMAGE_UPLOAD_SYSTEM_FIELD_KEYS.has(field.key);

const normalizeImageUploadField = (field: TopicFieldDraft): TopicFieldDraft =>
  field.type === 'imageUpload'
    ? {
        ...field,
        fileNameFields: field.fileNameFields ?? [],
        targetFields: {
          ...field.targetFields,
          desktopPath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
          desktop: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
          mobilePath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
          mobile: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
        },
      }
    : field;

const getPersistedFields = (fields: TopicFieldDraft[]) => {
  const normalizedFields = fields
    .filter((field) => !isImageUploadSystemField(field))
    .map((field) => normalizeImageUploadField(field));
  const hasImageUploadField = normalizedFields.some((field) => field.type === 'imageUpload');

  return hasImageUploadField ? [...normalizedFields, ...IMAGE_UPLOAD_SYSTEM_FIELDS] : normalizedFields;
};

const getInitialDraft = (topic?: Topic): TopicDraft => ({
  fields:
    topic?.fields
      ?.filter((field) => !isImageUploadSystemField(field))
      .map((field) => normalizeImageUploadField(field)) ?? [],
  id: topic?.id ?? '',
  label: topic?.label ?? '',
  slug: topic?.slug ?? '',
  storage_prefix: topic?.storage_prefix ?? '',
});

const getEmptyFieldDraft = (): TopicFieldDraft => ({
  fileNameFields: [],
  key: '',
  label: '',
  type: 'string',
});

const getFixedImageUploadFieldDraft = (): TopicFieldDraft => ({
  fileNameFields: [],
  key: 'image_upload',
  label: 'Kepfeltoltes',
  required: true,
  targetFields: {
    desktopPath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
    desktop: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
    mobilePath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
    mobile: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
  },
  type: 'imageUpload',
});

const getAvailableFileNameFieldOptions = ({
  currentFieldKey,
  fields,
}: {
  currentFieldKey?: string;
  fields: TopicDraft['fields'];
}) =>
  fields
    .filter(
      (field) =>
        field.type !== 'imageUpload' &&
        field.required &&
        typeof field.key === 'string' &&
        field.key.trim().length > 0 &&
        field.key !== currentFieldKey,
    )
    .map((field) => ({
      key: field.key!.trim(),
      label: field.label?.trim() || field.key!.trim(),
    }));

const getSelectOptionsText = (options: string[] | undefined) => (options ?? []).join('\n');

const isIgnoredCreateImageUploadError = (path: string, fieldIndex: number) =>
  path.startsWith(`fields[${fieldIndex}]`) &&
  ['.fileNameFields'].some((suffix) => path.endsWith(suffix));

const getPersistedTopicValues = (draft: TopicDraft) => ({
  fields: getPersistedFields(draft.fields) as Topic['fields'],
  label: draft.label?.trim() ?? '',
  slug: draft.slug?.trim() ?? '',
  storage_prefix: draft.storage_prefix?.trim() ?? '',
});

const TopicSchemaBuilderPage = ({ mode, topic }: TopicSchemaBuilderPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<TopicDraft>(() => getInitialDraft(topic));
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fixedImageUploadFieldDraft, setFixedImageUploadFieldDraft] = useState<TopicFieldDraft>(
    () =>
      draft.fields.find((field) => field.type === 'imageUpload') ??
      getFixedImageUploadFieldDraft(),
  );
  const [newFieldDraft, setNewFieldDraft] = useState<TopicFieldDraft>(() => getEmptyFieldDraft());
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<SelectedFieldIndex>(null);
  const [submitError, setSubmitError] = useState('');
  const validationDraft = useMemo(
    () => ({
      ...draft,
      fields: getPersistedFields(draft.fields),
    }),
    [draft],
  );
  const validation = useMemo(() => validateTopicDraft(validationDraft), [validationDraft]);
  const canSave = validation.errors.length === 0 && !isSaving;
  const title = mode === 'create' ? 'Uj topic schema' : `${topic?.label ?? 'Topic'} schema`;
  const description =
    mode === 'create'
      ? 'Itt lesz a topic schema builder. A kovetkezo lepesben jon a metadata es field editor.'
      : 'Itt lesz a topic schema szerkeszto. A kovetkezo lepesben jon a metadata es field editor.';
  const metadataFields = [
    {
      key: 'id',
      label: 'Topic ID',
      value: draft.id ?? '',
    },
    {
      key: 'label',
      label: 'Label',
      value: draft.label ?? '',
    },
    {
      key: 'slug',
      label: 'Slug',
      value: draft.slug ?? '',
    },
    {
      key: 'storage_prefix',
      label: 'Storage prefix',
      value: draft.storage_prefix ?? '',
    },
  ] as const;
  const metadataErrorsByPath = new Map(
    validation.errors.map((issue) => [issue.path, issue.message]),
  );
  const fieldErrorsByPath = new Map(validation.errors.map((issue) => [issue.path, issue.message]));
  const newFieldIndex = draft.fields.length;
  const newFieldValidation = useMemo(
    () =>
      validateTopicDraft({
        ...draft,
        fields: getPersistedFields([...draft.fields, newFieldDraft]),
      }),
    [draft, newFieldDraft],
  );
  const newFieldErrorsByPath = new Map(
    newFieldValidation.errors
      .filter((issue) => issue.path.startsWith(`fields[${newFieldIndex}]`))
      .filter(
        (issue) =>
          !(
            newFieldDraft.type === 'imageUpload' &&
            isIgnoredCreateImageUploadError(issue.path, newFieldIndex)
          ),
      )
      .filter((issue) => issue.path !== `fields[${newFieldIndex}].options`)
      .map((issue) => [issue.path, issue.message]),
  );
  const canAddField = newFieldErrorsByPath.size === 0;
  const imageUploadFieldIndex = draft.fields.findIndex((field) => field.type === 'imageUpload');
  const hasImageUploadField = imageUploadFieldIndex >= 0;
  const selectedField =
    selectedFieldIndex === 'fixed-image-upload'
      ? fixedImageUploadFieldDraft
      : selectedFieldIndex !== null
        ? (draft.fields[selectedFieldIndex] ?? null)
        : null;
  const newFieldFileNameFieldOptions = getAvailableFileNameFieldOptions({
    fields: draft.fields,
  });
  const canConfigureFixedImageUpload = newFieldFileNameFieldOptions.length > 0;
  const selectedFieldFileNameFieldOptions = getAvailableFileNameFieldOptions({
    currentFieldKey: selectedField?.key,
    fields: draft.fields,
  });

  const handleCloseAddFieldDialog = () => {
    setIsAddFieldDialogOpen(false);
    setNewFieldDraft(getEmptyFieldDraft());
  };

  const handleCloseEditFieldDialog = () => {
    setIsEditFieldDialogOpen(false);
  };

  const handleAddField = () => {
    if (!canAddField || !newFieldDraft.type) {
      return;
    }

    const normalizedField: TopicFieldDraft =
      newFieldDraft.type === 'select'
        ? {
            ...newFieldDraft,
            options: newFieldDraft.options ?? [],
          }
        : newFieldDraft;

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: [...currentDraft.fields, normalizedField],
    }));
    setSelectedFieldIndex(draft.fields.length);
    setIsEditFieldDialogOpen(true);
    handleCloseAddFieldDialog();
  };

  const updateSelectedField = (updater: (field: TopicFieldDraft) => TopicFieldDraft) => {
    if (selectedFieldIndex === null) {
      return;
    }

    if (selectedFieldIndex === 'fixed-image-upload') {
      setFixedImageUploadFieldDraft((currentField) => updater(currentField));
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.map((field, index) =>
        index === selectedFieldIndex ? updater(field) : field,
      ),
    }));
  };

  const handleDeleteSelectedField = () => {
    if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.filter((_, index) => index !== selectedFieldIndex),
    }));
    setIsEditFieldDialogOpen(false);
    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (draft.fields.length <= 1) {
        return null;
      }

      return Math.max(0, currentIndex - 1);
    });
  };

  const handleEditFieldSubmit = () => {
    if (selectedFieldIndex === 'fixed-image-upload') {
      setDraft((currentDraft) => ({
        ...currentDraft,
        fields: [...currentDraft.fields, normalizeImageUploadField(fixedImageUploadFieldDraft)],
      }));
      setSelectedFieldIndex(draft.fields.length);
    }

    setIsEditFieldDialogOpen(false);
  };

  const handleMoveField = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    setDraft((currentDraft) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentDraft.fields.length ||
        toIndex >= currentDraft.fields.length
      ) {
        return currentDraft;
      }

      const nextFields = [...currentDraft.fields];
      const [movedField] = nextFields.splice(fromIndex, 1);

      nextFields.splice(toIndex, 0, movedField);

      return {
        ...currentDraft,
        fields: nextFields,
      };
    });

    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (currentIndex === fromIndex) {
        return toIndex;
      }

      if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
        return currentIndex - 1;
      }

      if (toIndex < fromIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
        return currentIndex + 1;
      }

      return currentIndex;
    });
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSubmitError('');
    setIsSaving(true);

    try {
      const topicId = mode === 'edit' ? topic?.id : draft.id?.trim();

      if (!topicId) {
        throw new Error('Hianyzik a topic azonosito a menteshez.');
      }

      const values = getPersistedTopicValues(draft);

      if (mode === 'edit') {
        await updateTopic({
          topicId,
          values,
        });
      } else {
        await createTopic({
          topicId,
          values,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.list(),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.byId(topicId),
      });

      await navigate({
        to: '/admin',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen mentesi hiba.';
      console.error('Sikertelen topic schema mentes', error);
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

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
                <Card
                  variant="outlined"
                  data-testid="fixed-image-upload-card"
                  aria-disabled={!canConfigureFixedImageUpload}
                  sx={{
                    p: 2,
                    cursor: canConfigureFixedImageUpload ? 'pointer' : 'not-allowed',
                    opacity: 0.72,
                    backgroundColor: 'action.hover',
                  }}
                  onClick={
                    canConfigureFixedImageUpload
                      ? () => {
                          setSelectedFieldIndex('fixed-image-upload');
                          setIsEditFieldDialogOpen(true);
                        }
                      : undefined
                  }
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                  >
                    <Box>
                      <Typography variant="subtitle1">Kepfeltoltes</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Fix image upload field
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Disabled, amig nincs keszre konfiguralva. Vegyel fel hozza legalabb egy
                        required fieldet.
                      </Typography>
                    </Box>

                    <Typography color="text.secondary" variant="body2">
                      Kattints a szerkeszteshez
                    </Typography>
                  </Stack>
                </Card>
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="info">
                Meg nincs field. Az `Uj field` gombbal tudsz uj mezot felvenni.
              </Alert>

              {!hasImageUploadField ? (
                <Card
                  variant="outlined"
                  data-testid="fixed-image-upload-card"
                  aria-disabled={!canConfigureFixedImageUpload}
                  sx={{
                    p: 2,
                    cursor: canConfigureFixedImageUpload ? 'pointer' : 'not-allowed',
                    opacity: 0.72,
                    backgroundColor: 'action.hover',
                  }}
                  onClick={
                    canConfigureFixedImageUpload
                      ? () => {
                          setSelectedFieldIndex('fixed-image-upload');
                          setIsEditFieldDialogOpen(true);
                        }
                      : undefined
                  }
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                  >
                    <Box>
                      <Typography variant="subtitle1">Kepfeltoltes</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Fix image upload field
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Disabled, amig nincs keszre konfiguralva. Vegyel fel hozza legalabb egy
                        required fieldet.
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
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
        canSubmit={canAddField}
        errorsByPath={newFieldErrorsByPath}
        field={newFieldDraft}
        isOpen={isAddFieldDialogOpen}
        mode="create"
        availableFileNameFieldOptions={newFieldFileNameFieldOptions}
        onChange={(updater) => setNewFieldDraft((currentField) => updater(currentField))}
        onClose={handleCloseAddFieldDialog}
        onSubmit={handleAddField}
        pathPrefix={`fields[${newFieldIndex}]`}
      />

      {selectedField ? (
        <FieldDialog
          canSubmit
          availableFileNameFieldOptions={selectedFieldFileNameFieldOptions}
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

export default TopicSchemaBuilderPage;
