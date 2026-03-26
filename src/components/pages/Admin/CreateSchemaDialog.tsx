import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import type { Topic } from '@/types/topics';

type SchemaCreationMode = 'create' | 'duplicate';

type CreateSchemaDialogProps = {
  duplicateSourceTopicId?: string;
  initialMode: SchemaCreationMode;
  onClose: () => void;
  open: boolean;
  topics: ReadonlyArray<Topic>;
};

const CreateSchemaDialog = ({
  duplicateSourceTopicId,
  initialMode,
  onClose,
  open,
  topics,
}: CreateSchemaDialogProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SchemaCreationMode>(initialMode);
  const [selectedTopicId, setSelectedTopicId] = useState(duplicateSourceTopicId ?? '');

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(initialMode);
    setSelectedTopicId(duplicateSourceTopicId ?? '');
  }, [duplicateSourceTopicId, initialMode, open]);

  const isSubmitDisabled = mode === 'duplicate' && selectedTopicId.length === 0;

  const handleSubmit = async () => {
    if (mode === 'duplicate') {
      if (!selectedTopicId) {
        return;
      }

      await navigate({
        params: { topicId: selectedTopicId },
        to: '/admin/schemas/$topicId/duplicate',
      });

      return;
    }

    await navigate({
      to: '/admin/schemas/new',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Új séma</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Válaszd ki, hogy teljesen új sémát szeretnél létrehozni, vagy egy meglévőt
            duplikálnál kiindulásnak.
          </Typography>

          <FormControl>
            <FormLabel id="schema-creation-mode-label">Létrehozás módja</FormLabel>
            <RadioGroup
              aria-labelledby="schema-creation-mode-label"
              name="schema-creation-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as SchemaCreationMode)}
            >
              <FormControlLabel
                value="create"
                control={<Radio />}
                label="Új séma létrehozása"
              />
              <FormControlLabel
                value="duplicate"
                control={<Radio />}
                label="Meglévő séma duplikálása"
              />
            </RadioGroup>
          </FormControl>

          {mode === 'duplicate' ? (
            <FormControl fullWidth>
              <FormLabel id="schema-source-topic-label">Melyik sémát duplikálod?</FormLabel>
              <Select
                aria-labelledby="schema-source-topic-label"
                displayEmpty
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
              >
                <MenuItem value="" disabled>
                  Válassz meglévő sémát
                </MenuItem>
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Mégse</Button>
        <Button
          variant="contained"
          startIcon={mode === 'duplicate' ? <ContentCopyIcon /> : <AddIcon />}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {mode === 'duplicate' ? 'Duplikálás folytatása' : 'Létrehozás folytatása'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSchemaDialog;
