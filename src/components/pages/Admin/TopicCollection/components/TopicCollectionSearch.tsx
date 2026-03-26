import { Autocomplete, Box, MenuItem, TextField } from '@mui/material';

import type { TopicCollectionSearchField } from '@/types/topics';

type TopicCollectionSearchProps = {
  searchFieldKey: string;
  searchableFields: readonly TopicCollectionSearchField[];
  searchOptions: readonly string[];
  searchQuery: string;
  onSearchFieldChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
};

const TopicCollectionSearch = ({
  searchFieldKey,
  searchableFields,
  searchOptions,
  searchQuery,
  onSearchFieldChange,
  onSearchQueryChange,
}: TopicCollectionSearchProps) => {
  const selectFieldSx = {
    '& .MuiSelect-select': {
      alignItems: 'center',
      display: 'flex',
      minHeight: 'auto',
    },
  } as const;

  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        flex: 1,
        gap: 2,
        gridTemplateColumns: {
          md: 'minmax(220px, 280px) minmax(240px, 1fr)',
          xs: '1fr',
        },
      }}
    >
      <TextField
        select
        label="Keresés mező szerint"
        size="small"
        onChange={(event) => onSearchFieldChange(event.target.value)}
        sx={selectFieldSx}
        value={searchFieldKey}
      >
        {searchableFields.map((field) => (
          <MenuItem key={field.key} value={field.key}>
            {field.label}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        freeSolo
        options={searchOptions}
        value={searchQuery}
        onChange={(_, nextValue) => {
          onSearchQueryChange(nextValue ?? '');
        }}
        onInputChange={(_, nextValue, reason) => {
          if (reason === 'input' || reason === 'clear') {
            onSearchQueryChange(nextValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            inputProps={{
              ...params.inputProps,
              'aria-label': 'Keresett érték',
            }}
            placeholder="Keresett érték"
            size="small"
          />
        )}
      />
    </Box>
  );
};

export default TopicCollectionSearch;
