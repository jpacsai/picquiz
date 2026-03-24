import { Alert, Stack, Typography } from '@mui/material';

import { useTopicSchemaBuilderState } from '../context/TopicSchemaBuilderContext';

const ValidationSummary = () => {
  const {
    validation: { errors, warnings },
  } = useTopicSchemaBuilderState();

  return (
    <>
      {errors.length ? (
        <Alert severity="error">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Meg megoldando hibak</Typography>
            {errors.map((issue) => (
              <Typography key={`${issue.path}-${issue.message}`} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert severity="success">A topic metadata jelenleg ervenyes.</Alert>
      )}

      {warnings.length ? (
        <Alert severity="warning">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Figyelmeztetesek</Typography>
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
