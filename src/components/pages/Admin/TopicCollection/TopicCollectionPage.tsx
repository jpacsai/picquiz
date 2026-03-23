import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { topicItemsOptions } from '@queries/items';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

import AdminTopicItemCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/AdminTopicItemCard';
import EmptyCollectionCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/EmptyCollectionCard';
import {
  filterTopicItems,
  getDefaultSearchFieldKey,
  getSearchableTopicFields,
  sortTopicItemsByNewestCreated,
} from '@/components/pages/Admin/TopicCollection/utils';
import type { Topic, TopicItem } from '@/types/topics';

type AdminTopicCollectionPageProps = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

const SEARCH_DEBOUNCE_MS = 1000;

const AdminTopicCollectionPage = ({ items, saved, topic }: AdminTopicCollectionPageProps) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: liveItems = items } = useQuery({
    ...topicItemsOptions(topic.slug),
    initialData: items,
  });
  const searchableFields = useMemo(() => getSearchableTopicFields(topic.fields), [topic.fields]);
  const defaultSearchFieldKey = useMemo(() => getDefaultSearchFieldKey(topic), [topic]);
  const [searchFieldKey, setSearchFieldKey] = useState(defaultSearchFieldKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const activeSearchFieldKey = searchableFields.some((field) => field.key === searchFieldKey)
    ? searchFieldKey
    : defaultSearchFieldKey;
  const searchOptions = useMemo(
    () =>
      [
        ...new Set(
          liveItems
            .map((item) => item[activeSearchFieldKey])
            .filter(
              (value): value is string | number =>
                typeof value === 'string' || typeof value === 'number',
            )
            .map((value) => String(value).trim())
            .filter(Boolean),
        ),
      ].sort((left, right) => left.localeCompare(right, 'hu')),
    [activeSearchFieldKey, liveItems],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const filteredItems = useMemo(
    () =>
      filterTopicItems({
        fieldKey: activeSearchFieldKey,
        items: liveItems,
        query: debouncedSearchQuery,
      }),
    [activeSearchFieldKey, debouncedSearchQuery, liveItems],
  );
  const sortedLiveItems = useMemo(
    () => sortTopicItemsByNewestCreated(filteredItems),
    [filteredItems],
  );

  useEffect(() => {
    if (saved !== 'edited') {
      return;
    }

    enqueueSnackbar('Az elem módosításai elmentve.', {
      key: 'admin-topic-item-edited',
      preventDuplicate: true,
      variant: 'success',
    });

    void navigate({
      replace: true,
      search: { saved: undefined },
      to: '/admin/$topicId',
      params: { topicId: topic.id },
    });
  }, [enqueueSnackbar, navigate, saved, topic.id]);

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
                onChange={(event: SelectChangeEvent) => setSearchFieldKey(event.target.value)}
                value={activeSearchFieldKey}
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
                setSearchQuery(nextValue ?? '');
              }}
              onInputChange={(_, nextValue, reason) => {
                if (reason === 'input' || reason === 'clear') {
                  setSearchQuery(nextValue);
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

        <Button
          variant="contained"
          onClick={() => {
            void navigate({
              to: '/admin/$topicId/new',
              params: { topicId: topic.id },
            });
          }}
        >
          Új item feltöltése
        </Button>
      </Box>

      {!liveItems.length ? (
        <EmptyCollectionCard />
      ) : sortedLiveItems.length ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {sortedLiveItems.map((item) => (
            <AdminTopicItemCard
              collectionName={topic.slug}
              fields={topic.fields}
              item={item}
              key={item.id}
              topicId={topic.id}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="body1">
            Nincs találat a kiválasztott mezőben erre:{' '}
            <strong>{debouncedSearchQuery.trim()}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminTopicCollectionPage;
