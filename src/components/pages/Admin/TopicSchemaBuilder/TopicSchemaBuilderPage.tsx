import { RouterLink } from '@components/ui/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionIcon from '@mui/icons-material/Construction';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import type { Topic } from '@/types/topics';
import type { TopicDraft, TopicFieldDraft } from '@/types/topicSchema';
import { validateTopicDraft } from '@/utils/topicSchemaValidation';

type TopicSchemaBuilderPageProps = {
  mode: 'create' | 'edit';
  topic?: Topic;
};

const getInitialDraft = (topic?: Topic): TopicDraft => ({
  fields: topic?.fields ?? [],
  id: topic?.id ?? '',
  label: topic?.label ?? '',
  slug: topic?.slug ?? '',
  storage_prefix: topic?.storage_prefix ?? '',
});

const getEmptyFieldDraft = (): TopicFieldDraft => ({
  key: '',
  label: '',
  type: 'string',
});

const FIELD_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Select', value: 'select' },
  { label: 'Image upload', value: 'imageUpload' },
] as const;

const TopicSchemaBuilderPage = ({ mode, topic }: TopicSchemaBuilderPageProps) => {
  const [draft, setDraft] = useState<TopicDraft>(() => getInitialDraft(topic));
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [newFieldDraft, setNewFieldDraft] = useState<TopicFieldDraft>(() => getEmptyFieldDraft());
  const validation = useMemo(() => validateTopicDraft(draft), [draft]);
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
  const newFieldValidation = useMemo(
    () =>
      validateTopicDraft({
        fields: [newFieldDraft],
        id: '__field-draft__',
        label: '__field-draft__',
        slug: '__field-draft__',
        storage_prefix: '__field-draft__',
      }),
    [newFieldDraft],
  );
  const newFieldErrorsByPath = new Map(
    newFieldValidation.errors.map((issue) => [issue.path, issue.message]),
  );
  const canAddField = !newFieldValidation.errors.length;

  const handleCloseAddFieldDialog = () => {
    setIsAddFieldDialogOpen(false);
    setNewFieldDraft(getEmptyFieldDraft());
  };

  const handleAddField = () => {
    if (!canAddField || !newFieldDraft.type) {
      return;
    }

    const normalizedField: TopicFieldDraft =
      newFieldDraft.type === 'select'
        ? {
            ...newFieldDraft,
            options: [],
          }
        : newFieldDraft.type === 'imageUpload'
          ? {
              ...newFieldDraft,
              fileNameFields: {},
              targetFields: {},
            }
          : newFieldDraft;

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: [...currentDraft.fields, normalizedField],
    }));
    handleCloseAddFieldDialog();
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>

        <RouterLink to="/admin" underline="none" preload="intent">
          <Button component="span" startIcon={<ArrowBackIcon />} variant="outlined">
            Vissza az adminhoz
          </Button>
        </RouterLink>
      </Stack>

      <Alert severity="info">
        Ez most az elso skeleton lepes. A page mar navigalhato, de a builder UI meg nincs bekotve.
      </Alert>

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
              {draft.fields.map((field, index) => (
                <Card key={`${field.key ?? 'field'}-${index}`} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                  >
                    <Box>
                      <Typography variant="subtitle1">{field.label || 'Nev nelkuli field'}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        key: {field.key || '-'} | type: {field.type || '-'}
                      </Typography>
                    </Box>

                    <Typography color="text.secondary" variant="body2">
                      Reszletes field editor a kovetkezo lepesben jon.
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">
              Meg nincs field. Az `Uj field` gombbal tudsz uj mezot felvenni.
            </Alert>
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

      <Dialog open={isAddFieldDialogOpen} onClose={handleCloseAddFieldDialog} fullWidth maxWidth="sm">
        <DialogTitle>Uj field hozzaadasa</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              label="Field label"
              value={newFieldDraft.label ?? ''}
              error={newFieldErrorsByPath.has('fields[0].label')}
              helperText={newFieldErrorsByPath.get('fields[0].label') ?? ' '}
              onChange={(event) => {
                const nextValue = event.target.value;

                setNewFieldDraft((currentField) => ({
                  ...currentField,
                  label: nextValue,
                }));
              }}
            />

            <TextField
              label="Field key"
              value={newFieldDraft.key ?? ''}
              error={newFieldErrorsByPath.has('fields[0].key')}
              helperText={newFieldErrorsByPath.get('fields[0].key') ?? ' '}
              onChange={(event) => {
                const nextValue = event.target.value;

                setNewFieldDraft((currentField) => ({
                  ...currentField,
                  key: nextValue,
                }));
              }}
            />

            <TextField
              select
              label="Field type"
              value={newFieldDraft.type ?? 'string'}
              error={newFieldErrorsByPath.has('fields[0].type')}
              helperText={newFieldErrorsByPath.get('fields[0].type') ?? ' '}
              onChange={(event) => {
                const nextValue = event.target.value as TopicFieldDraft['type'];

                setNewFieldDraft((currentField) => ({
                  ...currentField,
                  type: nextValue,
                }));
              }}
            >
              {FIELD_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAddFieldDialog}>Megse</Button>
          <Button variant="contained" onClick={handleAddField} disabled={!canAddField}>
            Field hozzaadasa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicSchemaBuilderPage;
