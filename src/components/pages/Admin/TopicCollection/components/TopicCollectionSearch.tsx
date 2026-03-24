import { Autocomplete, Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

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
      <FormControl size="small">
        <InputLabel id="admin-topic-search-field-label">Keresés mező szerint</InputLabel>
        <Select
          label="Keresés mező szerint"
          labelId="admin-topic-search-field-label"
          onChange={(event) => onSearchFieldChange(event.target.value)}
          value={searchFieldKey}
        >
          {searchableFields.map((field) => (
            <MenuItem key={field.key} value={field.key}>
              {field.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
        renderInput={(params) => <TextField {...params} label="Keresett érték" size="small" />}
      />
    </Box>
  );
};

export default TopicCollectionSearch;
