import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { QuizItemFilterField, QuizItemFilterRow } from '@/types/quiz';

type ItemFilterSectionProps = {
  filteredItemCount: number;
  itemFilterFields: ReadonlyArray<QuizItemFilterField>;
  itemFilterRows: ReadonlyArray<QuizItemFilterRow>;
  onAddItemFilter: () => void;
  onItemFilterFieldChange: (index: number, fieldKey: string) => void;
  onItemFilterValueChange: (index: number, value: string) => void;
  onRemoveItemFilter: (index: number) => void;
  totalItemCount: number;
};

const selectFieldSx = {
  '& .MuiInputBase-root': {
    alignItems: 'stretch',
  },
  '& .MuiSelect-select': {
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    minHeight: '100% !important',
    width: '100%',
  },
} as const;

const ItemFilterSection = ({
  filteredItemCount,
  itemFilterFields,
  itemFilterRows,
  onAddItemFilter,
  onItemFilterFieldChange,
  onItemFilterValueChange,
  onRemoveItemFilter,
  totalItemCount,
}: ItemFilterSectionProps) => {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1">Item szűrés</Typography>
        <Typography color="text.secondary" variant="body2">
          {filteredItemCount} / {totalItemCount} elem
        </Typography>
      </Box>

      <Stack spacing={2}>
        {itemFilterRows.map((row, index) => (
          <Box
            key={`item-filter-row-${index}`}
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                md: 'minmax(220px, 280px) minmax(240px, 1fr) auto',
                xs: '1fr',
              },
            }}
          >
            <TextField
              select
              label={index === 0 ? 'Szűrés mező szerint' : `Szűrés mező szerint ${index + 1}.`}
              size="small"
              sx={selectFieldSx}
              value={row.fieldKey}
              onChange={(event) => onItemFilterFieldChange(index, event.target.value)}
            >
              <MenuItem value="">Összes elem</MenuItem>
              {itemFilterFields.map((field) => (
                <MenuItem key={field.key} value={field.key}>
                  {field.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              disabled={!row.fieldKey}
              label={index === 0 ? 'Szűrt érték' : `Szűrt érték ${index + 1}.`}
              size="small"
              sx={selectFieldSx}
              value={row.value}
              onChange={(event) => onItemFilterValueChange(index, event.target.value)}
            >
              <MenuItem value="">Összes érték</MenuItem>
              {row.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                alignItems: { md: 'center', xs: 'flex-start' },
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              {itemFilterRows.length > 1 ? (
                <IconButton
                  aria-label={`Szűrő feltétel ${index + 1}. törlése`}
                  onClick={() => onRemoveItemFilter(index)}
                  size="small"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              ) : (
                <Box sx={{ width: 40 }} />
              )}
            </Box>
          </Box>
        ))}

        <Box>
          <Button onClick={onAddItemFilter} size="small" startIcon={<AddIcon />} variant="text">
            Új feltétel
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default ItemFilterSection;
