import { Alert, Stack, Typography } from '@mui/material';

import { useTopicSchemaBuilderState } from '../context/useTopicSchemaBuilderContext';

const ValidationSummary = () => {
  const {
    validation: { errors, warnings },
  } = useTopicSchemaBuilderState();

  return (
    <>
      {errors.length ? (
        <Alert severity="error">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Még megoldandó hibák</Typography>
            {errors.map((issue) => (
              <Typography key={`${issue.path}-${issue.message}`} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert severity="success">A topik metadata jelenleg érvényes.</Alert>
      )}

      {warnings.length ? (
        <Alert severity="warning">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Figyelmeztetések</Typography>
            {warnings.map((issue) => (
              <Typography key={`${issue.path}-${issue.message}`} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : null}
    </>
  );
};

export default ValidationSummary;
