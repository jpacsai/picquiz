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

import { useTopicSchemaBuilderState } from '../context/useTopicSchemaBuilderContext';
import { getSchemaPreview, type PreviewCell } from '../hook/schemaPreview';
import { getPersistedFields } from '../hook/utils';

const PreviewTable = ({ headers, rows }: { headers: string[]; rows: PreviewCell[][] }) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell align={header === 'Kotelezo' ? 'center' : 'left'} key={header}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                {header}
              </Typography>
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
  const { hiddenSystemFields, quizFieldCount, rows } = getSchemaPreview(persistedFields);

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Schema preview</Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`Form mezok: ${rows.length}`} variant="outlined" />
          <Chip
            color={quizFieldCount ? 'primary' : 'default'}
            label={`Quiz mezok: ${quizFieldCount}`}
            variant="outlined"
          />
          <Chip
            color={hiddenSystemFields.length ? 'warning' : 'default'}
            label={`Rendszermezok: ${hiddenSystemFields.length}`}
            variant="outlined"
          />
        </Stack>

        <Divider />

        {rows.length ? (
          <PreviewTable
            headers={['Field neve', 'Kulcs', 'Tipus', 'Kotelezo', 'Dependency field-ek', 'Kviz']}
            rows={rows}
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
