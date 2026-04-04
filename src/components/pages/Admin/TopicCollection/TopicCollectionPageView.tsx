import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Card, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import TopicCollectionSearch from '@/components/pages/Admin/TopicCollection/components/TopicCollectionSearch';
import TopicItemSection from '@/components/pages/Admin/TopicCollection/components/TopicItemSection';

import type {
  TopicCollectionPageSearchField,
  UseTopicCollectionPageResult,
} from './useTopicCollectionPage';

type TopicCollectionPageViewProps = Omit<UseTopicCollectionPageResult, 'searchableFields'> & {
  searchableFields: ReadonlyArray<TopicCollectionPageSearchField>;
};

const TopicCollectionPageView = ({
  items,
  noResultsQuery,
  onCreateNewItem,
  onResetSearch,
  onSearchFieldChange,
  onSearchQueryChange,
  searchFieldKey,
  searchOptions,
  searchQuery,
  searchableFields,
  topic,
}: TopicCollectionPageViewProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Card variant="outlined" sx={{ width: '100%' }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">Szűrés</Typography>
            <IconButton aria-label="Szűrő visszaállítása" onClick={onResetSearch} size="small">
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>

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
              <TopicCollectionSearch
                searchFieldKey={searchFieldKey}
                searchableFields={searchableFields}
                searchOptions={searchOptions}
                searchQuery={searchQuery}
                onSearchFieldChange={onSearchFieldChange}
                onSearchQueryChange={onSearchQueryChange}
              />
            ) : null}
          </Box>
        </Stack>
      </Card>

      <Box
        sx={{
          alignItems: { md: 'center', xs: 'stretch' },
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {items.length} elem
        </Typography>

        <Button variant="contained" onClick={onCreateNewItem}>
          Új elem feltöltése
        </Button>
      </Box>

      <TopicItemSection noResultsQuery={noResultsQuery} items={items} topic={topic} />
    </Box>
  );
};

export default TopicCollectionPageView;
