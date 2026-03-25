import { Card, Chip, Stack, Typography } from '@mui/material';

import { useTopicSchemaBuilderState } from '../context/useTopicSchemaBuilderContext';
import { getPersistedFields } from '../hook/utils';

const SchemaPreviewSection = () => {
  const { draft } = useTopicSchemaBuilderState();
  const persistedFields = getPersistedFields(draft.fields);
  const quizEnabledFields = persistedFields.filter((field) => field.quiz?.enabled);
  const hiddenSystemFields = persistedFields.filter((field) => field.hideInEdit);

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Schema preview</Typography>
          <Typography color="text.secondary" variant="body2">
            Gyors osszefoglalo arrol, hogy a builder pillanatnyilag milyen item formot es quiz
            mezoket fog menteni.
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Item form mezok</Typography>
          {persistedFields.length ? (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {persistedFields
                .filter((field) => !field.hideInEdit)
                .map((field) => (
                  <Chip
                    key={field.key ?? field.label}
                    label={`${field.label || field.key || 'Nev nelkuli field'} (${field.type || '-'})`}
                    variant="outlined"
                  />
                ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" variant="body2">
              Meg nincs user altal szerkesztheto mezod.
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Quiz mezok</Typography>
          {quizEnabledFields.length ? (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {quizEnabledFields.map((field) => (
                <Chip
                  key={field.key ?? field.label}
                  color="primary"
                  label={`${field.label || field.key || 'Nev nelkuli field'}${field.quiz?.enabled && field.quiz.prompt ? ` | ${field.quiz.prompt}` : ''}`}
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" variant="body2">
              Meg nincs quizre hasznalt mezod.
            </Typography>
          )}
        </Stack>

        {hiddenSystemFields.length ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Rendszermezok</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {hiddenSystemFields.map((field) => (
                <Chip
                  key={field.key ?? field.label}
                  label={field.key || field.label || 'Rendszermezo'}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
};

export default SchemaPreviewSection;
