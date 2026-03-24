import { Box, Card, Stack, TextField, Typography } from '@mui/material';

import type { TopicDraft } from '@/types/topicSchema';
import type { TopicSchemaBuilderMode } from '@/types/topicSchemaBuilder';

type TopicMetadataSectionProps = {
  errorsByPath: Map<string, string>;
  fields: ReadonlyArray<{
    key: keyof TopicDraft;
    label: string;
    value: string;
  }>;
  mode: TopicSchemaBuilderMode;
  onChange: (key: keyof TopicDraft, value: string) => void;
};

const TopicMetadataSection = ({
  errorsByPath,
  fields,
  mode,
  onChange,
}: TopicMetadataSectionProps) => (
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
        {fields.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            value={field.value}
            disabled={mode === 'edit' && field.key === 'id'}
            error={errorsByPath.has(field.key)}
            helperText={errorsByPath.get(field.key) ?? ' '}
            onChange={(event) => {
              onChange(field.key, event.target.value);
            }}
          />
        ))}
      </Box>
    </Stack>
  </Card>
);

export default TopicMetadataSection;
