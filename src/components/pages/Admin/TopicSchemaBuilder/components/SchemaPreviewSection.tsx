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
import type { ReactNode } from 'react';

import BooleanValue from '@/components/ui/BooleanValue';

import { getFieldDependencyKeys } from '../context/fieldActions';
import { useTopicSchemaBuilderState } from '../context/useTopicSchemaBuilderContext';
import { getPersistedFields } from '../hook/utils';

const getFieldSummaryLabel = (label?: string, key?: string) => label || key || 'Nev nelkuli field';

const hasFieldKey = (
  entry: readonly [string | undefined, string],
): entry is readonly [string, string] => Boolean(entry[0]);

const getDependencySummaryLabel = ({
  dependencyKey,
  fieldLabelsByKey,
}: {
  dependencyKey: string;
  fieldLabelsByKey: Map<string, string>;
}) => fieldLabelsByKey.get(dependencyKey) || dependencyKey;

type PreviewCell = {
  align?: 'center' | 'left' | 'right';
  text: string;
  value: ReactNode;
};

const PreviewTable = ({ headers, rows }: { headers: string[]; rows: PreviewCell[][] }) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell align={header === 'Kotelezo' ? 'center' : 'left'} key={header}>
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${row.map((cell) => cell.text).join('-')}-${index}`}>
            {row.map((cell, cellIndex) => (
              <TableCell align={cell.align ?? 'left'} key={`${cell.text}-${cellIndex}`}>
                {cell.value}
              </TableCell>
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
      .filter(hasFieldKey),
  );
  const previewRows: PreviewCell[][] = persistedFields
    .filter((field) => !field.hideInEdit)
    .map((field) => [
      {
        text: getFieldSummaryLabel(field.label, field.key),
        value: getFieldSummaryLabel(field.label, field.key),
      },
      {
        text: field.key || '-',
        value: field.key || '-',
      },
      {
        text: field.type || '-',
        value: field.type || '-',
      },
      {
        align: 'center',
        text: field.required ? 'Igaz' : 'Hamis',
        value: (
          <BooleanValue
            ariaLabel={`${getFieldSummaryLabel(field.label, field.key)} kötelező: ${field.required ? 'Igaz' : 'Hamis'}`}
            value={field.required === true}
          />
        ),
      },
      {
        text:
          getFieldDependencyKeys(field)
            .map((dependencyKey) =>
              getDependencySummaryLabel({
                dependencyKey,
                fieldLabelsByKey,
              }),
            )
            .join(', ') || '-',
        value:
          getFieldDependencyKeys(field)
            .map((dependencyKey) =>
              getDependencySummaryLabel({
                dependencyKey,
                fieldLabelsByKey,
              }),
            )
            .join(', ') || '-',
      },
      {
        text: field.quiz?.enabled ? field.quiz.prompt || '-' : '-',
        value: field.quiz?.enabled ? field.quiz.prompt || '-' : '-',
      },
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
            color={
              previewRows.some(([, , , , , prompt]) => prompt.text !== '-') ? 'primary' : 'default'
            }
            label={`Quiz mezok: ${previewRows.filter(([, , , , , prompt]) => prompt.text !== '-').length}`}
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
