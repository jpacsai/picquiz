import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { QuizItemFilterField, QuizItemFilterOption } from '@/types/quiz';

type ItemFilterSectionProps = {
  filteredItemCount: number;
  itemFilterFieldKey: string;
  itemFilterFields: ReadonlyArray<QuizItemFilterField>;
  itemFilterOptions: ReadonlyArray<QuizItemFilterOption>;
  itemFilterValue: string;
  onItemFilterFieldChange: (fieldKey: string) => void;
  onItemFilterValueChange: (value: string) => void;
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
  itemFilterFieldKey,
  itemFilterFields,
  itemFilterOptions,
  itemFilterValue,
  onItemFilterFieldChange,
  onItemFilterValueChange,
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

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            md: 'minmax(220px, 280px) minmax(240px, 1fr)',
            xs: '1fr',
          },
        }}
      >
        <TextField
          select
          label="Szűrés mező szerint"
          size="small"
          sx={selectFieldSx}
          value={itemFilterFieldKey}
          onChange={(event) => onItemFilterFieldChange(event.target.value)}
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
          disabled={!itemFilterFieldKey}
          label="Szűrt érték"
          size="small"
          sx={selectFieldSx}
          value={itemFilterValue}
          onChange={(event) => onItemFilterValueChange(event.target.value)}
        >
          <MenuItem value="">Összes érték</MenuItem>
          {itemFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Stack>
  );
};

export default ItemFilterSection;
