import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AdminTopicItemCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/AdminTopicItemCard';
import EmptyCollectionCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/EmptyCollectionCard';

import type { UseTopicCollectionPageResult } from './useTopicCollectionPage';

const TopicCollectionPageView = ({
  items,
  noResultsQuery,
  onCreateNewItem,
  onSearchFieldChange,
  onSearchQueryChange,
  searchFieldKey,
  searchOptions,
  searchQuery,
  searchableFields,
  topic,
}: UseTopicCollectionPageResult) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          alignItems: { md: 'center', xs: 'stretch' },
          display: 'flex',
          flexDirection: { md: 'row', xs: 'column' },
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        {searchableFields.length ? (
          <Box
            sx={{
              display: 'grid',
              flex: 1,
              gap: 2,
              gridTemplateColumns: { md: 'minmax(220px, 280px) minmax(240px, 1fr)', xs: '1fr' },
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
              renderInput={(params) => (
                <TextField {...params} label="Keresett érték" size="small" />
              )}
            />
          </Box>
        ) : (
          <Box />
        )}

        <Button variant="contained" onClick={onCreateNewItem}>
          Új item feltöltése
        </Button>
      </Box>

      {!items.length && noResultsQuery ? (
        <TopicCollectionNoResults query={noResultsQuery} />
      ) : !items.length ? (
        <EmptyCollectionCard />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {items.map((item) => (
            <AdminTopicItemCard
              collectionName={topic.slug}
              fields={topic.fields}
              item={item}
              key={item.id}
              topicId={topic.id}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export const TopicCollectionNoResults = ({ query }: { query: string }) => (
  <Box
    sx={{
      border: (theme) => `1px dashed ${theme.palette.divider}`,
      borderRadius: 2,
      p: 3,
    }}
  >
    <Typography variant="body1">
      Nincs találat a kiválasztott mezőben erre: <strong>{query}</strong>
    </Typography>
  </Box>
);

export default TopicCollectionPageView;
