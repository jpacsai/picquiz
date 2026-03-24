import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Alert, Box, Button, Card, IconButton, Stack, Typography } from '@mui/material';

import type { TopicFieldDraft, TopicSchemaIssue } from '@/types/topicSchema';
import type { SelectedFieldIndex } from '@/types/topicSchemaBuilder';

import FixedImageUploadCard from './FixedImageUploadCard';

type FieldListSectionProps = {
  canConfigureFixedImageUpload: boolean;
  fields: TopicFieldDraft[];
  hasImageUploadField: boolean;
  onAddField: () => void;
  onConfigureFixedImageUpload: () => void;
  onEditField: (index: number) => void;
  onMoveField: (params: { fromIndex: number; toIndex: number }) => void;
  selectedFieldIndex: SelectedFieldIndex;
  validationErrors: TopicSchemaIssue[];
};

const FieldListSection = ({
  canConfigureFixedImageUpload,
  fields,
  hasImageUploadField,
  onAddField,
  onConfigureFixedImageUpload,
  onEditField,
  onMoveField,
  selectedFieldIndex,
  validationErrors,
}: FieldListSectionProps) => (
  <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Typography variant="h6">Field lista</Typography>

        <Button variant="contained" onClick={onAddField}>
          Uj field
        </Button>
      </Stack>

      {fields.length ? (
        <Stack spacing={1.5}>
          {fields.map((field, index) => {
            const fieldIssues = validationErrors.filter((issue) =>
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
                onClick={() => onEditField(index)}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1}
                >
                  <Box>
                    <Typography variant="subtitle1">{field.label || 'Nev nelkuli field'}</Typography>
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
                        onMoveField({
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
                      disabled={index === fields.length - 1}
                      onClick={() => {
                        onMoveField({
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
              onClick={canConfigureFixedImageUpload ? onConfigureFixedImageUpload : undefined}
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
              onClick={canConfigureFixedImageUpload ? onConfigureFixedImageUpload : undefined}
            />
          ) : null}
        </Stack>
      )}
    </Stack>
  </Card>
);

export default FieldListSection;
