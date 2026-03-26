import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Alert, Box, Button, Card, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';
import FixedImageUploadCard from './FixedImageUploadCard';

const FieldListSection = () => {
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null);
  const {
    canConfigureFixedImageUpload,
    draft,
    hasImageUploadField,
    selectedFieldIndex,
    validation,
  } = useTopicSchemaBuilderState();
  const {
    handleMoveField,
    setIsAddFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setSelectedFieldIndex,
  } = useTopicSchemaBuilderActions();
  const fields = draft.fields;
  const draggableFields = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.type !== 'imageUpload');
  const imageUploadFieldIndex = fields.findIndex((field) => field.type === 'imageUpload');
  const validationErrors = validation.errors;

  return (
    <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Typography variant="h6">Field lista</Typography>

          <Button variant="contained" onClick={() => setIsAddFieldDialogOpen(true)}>
            Uj field
          </Button>
        </Stack>

        {fields.length ? (
          <Stack spacing={1.5}>
            {draggableFields.map(({ field, index }, visibleIndex) => {
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
                  data-testid={`field-card-${field.key ?? index}`}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: index === selectedFieldIndex ? 'primary.main' : undefined,
                    boxShadow: index === selectedFieldIndex ? 1 : 0,
                    opacity: isIncomplete ? 0.72 : 1,
                    backgroundColor: isIncomplete ? 'action.hover' : undefined,
                    outline:
                      dragOverFieldIndex === index && draggedFieldIndex !== index
                        ? '2px dashed'
                        : undefined,
                    outlineColor:
                      dragOverFieldIndex === index && draggedFieldIndex !== index
                        ? 'primary.main'
                        : undefined,
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();

                    if (draggedFieldIndex !== null && draggedFieldIndex !== index) {
                      setDragOverFieldIndex(index);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverFieldIndex === index) {
                      setDragOverFieldIndex(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();

                    if (draggedFieldIndex !== null && draggedFieldIndex !== index) {
                      handleMoveField({
                        fromIndex: draggedFieldIndex,
                        toIndex: index,
                      });
                    }

                    setDraggedFieldIndex(null);
                    setDragOverFieldIndex(null);
                  }}
                  onClick={() => {
                    setSelectedFieldIndex(index);
                    setIsEditFieldDialogOpen(true);
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {field.label || 'Nev nelkuli field'}
                      </Typography>
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
                      <IconButton
                        aria-label={`${field.label || field.key || 'field'} mozgatasa felfele`}
                        size="small"
                        disabled={visibleIndex === 0}
                        onClick={() => {
                          handleMoveField({
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
                        disabled={visibleIndex === draggableFields.length - 1}
                        onClick={() => {
                          handleMoveField({
                            fromIndex: index,
                            toIndex: index + 1,
                          });
                        }}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        aria-label={`${field.label || field.key || 'field'} athelyezese drag and droppal`}
                        size="small"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', String(index));
                          setDraggedFieldIndex(index);
                        }}
                        onDragEnd={() => {
                          setDraggedFieldIndex(null);
                          setDragOverFieldIndex(null);
                        }}
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}

            {hasImageUploadField ? (
              <FixedImageUploadCard
                canConfigure
                helperText="Fix képfeltöltés mező. Mindig a lista legaljan marad."
                onClick={() => {
                  setSelectedFieldIndex(
                    imageUploadFieldIndex >= 0 ? imageUploadFieldIndex : 'fixed-image-upload',
                  );
                  setIsEditFieldDialogOpen(true);
                }}
              />
            ) : null}

            {!hasImageUploadField ? (
              <FixedImageUploadCard
                canConfigure={canConfigureFixedImageUpload}
                onClick={
                  canConfigureFixedImageUpload
                    ? () => {
                        setSelectedFieldIndex('fixed-image-upload');
                        setIsEditFieldDialogOpen(true);
                      }
                    : undefined
                }
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
                onClick={
                  canConfigureFixedImageUpload
                    ? () => {
                        setSelectedFieldIndex('fixed-image-upload');
                        setIsEditFieldDialogOpen(true);
                      }
                    : undefined
                }
              />
            ) : null}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default FieldListSection;
