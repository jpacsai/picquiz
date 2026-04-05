import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Stack } from '@mui/material';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';

const TopicSchemaBuilderHeader = () => {
  const { canSave, isSaving, mode, topic } = useTopicSchemaBuilderState();
  const { handleNavigateBack, handleSave } = useTopicSchemaBuilderActions();

  return (
    <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={2}>
      <Stack direction="row" gap={1.5}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => void handleNavigateBack()}
        >
          {mode === 'edit' && topic ? 'Vissza a topikhoz' : 'Vissza az topiklistához'}
        </Button>

        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {isSaving ? 'Mentés...' : mode === 'create' ? 'Schema létrehozása' : 'Változások mentése'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default TopicSchemaBuilderHeader;
