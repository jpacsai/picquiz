import { Autocomplete, Box, MenuItem, TextField } from '@mui/material';

import type { TopicCollectionSearchField, TopicCollectionSortField } from '@/types/topics';

type TopicCollectionSearchProps = {
  searchFieldKey: string;
  searchableFields: readonly TopicCollectionSearchField[];
  searchOptions: readonly string[];
  searchQuery: string;
  sortDirection: 'asc' | 'desc';
  sortFieldKey: string;
  sortableFields: readonly TopicCollectionSortField[];
  onSearchFieldChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSortDirectionChange: (value: 'asc' | 'desc') => void;
  onSortFieldChange: (value: string) => void;
};

const TopicCollectionSearch = ({
  searchFieldKey,
  searchableFields,
  searchOptions,
  searchQuery,
  sortDirection,
  sortFieldKey,
  sortableFields,
  onSearchFieldChange,
  onSearchQueryChange,
  onSortDirectionChange,
  onSortFieldChange,
}: TopicCollectionSearchProps) => {
  const activeSearchField = searchableFields.find((field) => field.key === searchFieldKey);
  const isBooleanSearchField = activeSearchField?.type === 'boolean';
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

  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        flex: 1,
        gap: 2,
        gridTemplateColumns: {
          md: 'minmax(220px, 280px) minmax(240px, 1fr) minmax(180px, 220px) minmax(220px, 280px)',
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

      {isBooleanSearchField ? (
        <TextField
          select
          inputProps={{ 'aria-label': 'Keresett érték' }}
          placeholder="Keresett érték"
          size="small"
          sx={selectFieldSx}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        >
          <MenuItem value="">Összes</MenuItem>
          <MenuItem value="igaz">Igaz</MenuItem>
          <MenuItem value="hamis">Hamis</MenuItem>
        </TextField>
      ) : (
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
      )}

      <TextField
        select
        label="Rendezés mező szerint"
        size="small"
        sx={selectFieldSx}
        value={sortFieldKey}
        onChange={(event) => onSortFieldChange(event.target.value)}
      >
        <MenuItem value="created_at">Létrehozva</MenuItem>
        {sortableFields.map((field) => (
          <MenuItem key={field.key} value={field.key}>
            {field.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Rendezés iránya"
        size="small"
        sx={selectFieldSx}
        value={sortDirection}
        onChange={(event) => onSortDirectionChange(event.target.value as 'asc' | 'desc')}
      >
        <MenuItem value="asc">Növekvő</MenuItem>
        <MenuItem value="desc">Csökkenő</MenuItem>
      </TextField>
    </Box>
  );
};

export default TopicCollectionSearch;
