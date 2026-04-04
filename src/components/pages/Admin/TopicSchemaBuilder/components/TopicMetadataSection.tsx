import { Box, Card, Stack, TextField, Typography } from '@mui/material';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';

const TopicMetadataSection = () => {
  const { metadataErrorsByPath, metadataFields, mode } = useTopicSchemaBuilderState();
  const { setDraft } = useTopicSchemaBuilderActions();

  return (
    <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
      <Stack spacing={2.5}>
        <Typography variant="h6">Topik metaadatok</Typography>

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
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  [field.key]: event.target.value,
                }));
              }}
            />
          ))}
        </Box>
      </Stack>
    </Card>
  );
};

export default TopicMetadataSection;
