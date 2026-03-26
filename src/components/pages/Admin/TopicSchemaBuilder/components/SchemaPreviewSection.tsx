import {
  Alert,
  Card,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { getFieldDependencyKeys } from '../context/fieldActions';
import { useTopicSchemaBuilderState } from '../context/useTopicSchemaBuilderContext';
import { getPersistedFields } from '../hook/utils';

const getFieldSummaryLabel = (label?: string, key?: string) => label || key || 'Nev nelkuli field';

const getDependencySummaryLabel = ({
  dependencyKey,
  fieldLabelsByKey,
}: {
  dependencyKey: string;
  fieldLabelsByKey: Map<string, string>;
}) => fieldLabelsByKey.get(dependencyKey) || dependencyKey;

const PreviewTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${row.join('-')}-${index}`}>
            {row.map((cell, cellIndex) => (
              <TableCell key={`${cell}-${cellIndex}`}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const SchemaPreviewSection = () => {
  const { draft } = useTopicSchemaBuilderState();
  const persistedFields = getPersistedFields(draft.fields);
  const hiddenSystemFields = persistedFields.filter((field) => field.hideInEdit);
  const fieldLabelsByKey = new Map(
    persistedFields
      .map((field) => [field.key?.trim(), getFieldSummaryLabel(field.label, field.key)] as const)
      .filter(([fieldKey]) => Boolean(fieldKey)),
  );
  const previewRows = persistedFields
    .filter((field) => !field.hideInEdit)
    .map((field) => [
      getFieldSummaryLabel(field.label, field.key),
      field.key || '-',
      field.type || '-',
      field.hideInEdit ? 'n/a' : field.required ? '✓' : 'X',
      getFieldDependencyKeys(field)
        .map((dependencyKey) =>
          getDependencySummaryLabel({
            dependencyKey,
            fieldLabelsByKey,
          }),
        )
        .join(', ') || '-',
      field.quiz?.enabled ? field.quiz.prompt || '-' : '-',
    ]);

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Schema preview</Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`Form mezok: ${previewRows.length}`} variant="outlined" />
          <Chip
            color={previewRows.some(([, , , , , prompt]) => prompt !== '-') ? 'primary' : 'default'}
            label={`Quiz mezok: ${previewRows.filter(([, , , , , prompt]) => prompt !== '-').length}`}
            variant="outlined"
          />
          <Chip
            color={hiddenSystemFields.length ? 'warning' : 'default'}
            label={`Rendszermezok: ${hiddenSystemFields.length}`}
            variant="outlined"
          />
        </Stack>

        <Divider />

        {previewRows.length ? (
          <PreviewTable
            headers={['Field neve', 'Kulcs', 'Tipus', 'Kotelezo', 'Dependency field-ek', 'Kviz']}
            rows={previewRows}
          />
        ) : null}

        {hiddenSystemFields.length ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Rendszermezok</Typography>
            <Alert severity="info">
              {hiddenSystemFields
                .map((field) => field.key || field.label || 'Rendszermezo')
                .join(', ')}
            </Alert>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
};

export default SchemaPreviewSection;
