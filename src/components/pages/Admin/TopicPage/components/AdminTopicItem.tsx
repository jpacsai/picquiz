import { deleteTopicImageByPath } from '@data/storage';
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { QUERY_KEYS } from '@queries/queryKeys';
import { deleteTopicItem } from '@service/items';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { TopicField } from '@/types/topics';

import DeleteItemDialog from './DeleteItemDialog';

type AdminTopicItemProps = {
  collectionName: string;
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
};

const getDisplayValue = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length ? trimmedValue : null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
};

const getValuesByDisplay = (
  fields: ReadonlyArray<TopicField>,
  item: TopicItem,
  display: NonNullable<TopicField['display']>,
) => {
  return fields
    .filter((field) => field.display === display)
    .map((field) => getDisplayValue(item[field.key]))
    .filter((value): value is string => value !== null);
};

const getFallbackTitle = (item: TopicItem) => {
  const fallbackValue = [item.title, item.artist]
    .map(getDisplayValue)
    .find((value): value is string => value !== null);

  return fallbackValue ?? item.id;
};

const getFallbackSubtitle = (item: TopicItem) => {
  return [item.artist, item.year]
    .map(getDisplayValue)
    .filter((value): value is string => value !== null)
    .join(' - ');
};

const getImagePathsToDelete = ({
  fields,
  item,
}: {
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
}) => {
  const pathKeys = fields.flatMap((field) => {
    if (field.type !== 'imageUpload') {
      return [];
    }

    return [field.targetFields.desktopPath, field.targetFields.mobilePath].filter(
      (pathKey): pathKey is string => Boolean(pathKey),
    );
  });

  return [...new Set(pathKeys)]
    .map((pathKey) => item[pathKey])
    .filter((path): path is string => typeof path === 'string' && path.trim().length > 0);
};

const AdminTopicItem = ({ collectionName, fields, item, topicId }: AdminTopicItemProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const titleValues = getValuesByDisplay(fields, item, 'title');
  const subtitleValues = getValuesByDisplay(fields, item, 'subtitle');
  const metaValues = getValuesByDisplay(fields, item, 'meta');

  const title = titleValues[0] ?? getFallbackTitle(item);
  const subtitle = subtitleValues.length ? subtitleValues.join(' - ') : getFallbackSubtitle(item);
  const meta = metaValues.join(' - ');
  const imagePathsToDelete = getImagePathsToDelete({ fields, item });

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteTopicItem({
        collectionName,
        itemId: item.id,
      });

      queryClient.setQueryData<ReadonlyArray<TopicItem>>(
        QUERY_KEYS.ITEMS.byTopic(collectionName),
        (previousItems) =>
          previousItems?.filter((candidate) => candidate.id !== item.id) ?? previousItems,
      );
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.ITEMS.detail(collectionName, item.id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ITEMS.byTopic(collectionName),
      });

      enqueueSnackbar('Az elem törölve.', { variant: 'success' });
      setIsDeleteDialogOpen(false);

      if (imagePathsToDelete.length) {
        try {
          await Promise.all(imagePathsToDelete.map((path) => deleteTopicImageByPath(path)));
        } catch (error) {
          console.error('Sikertelen képek törlése', error);
          enqueueSnackbar('Az elem törölve, de a képek törlése nem sikerült.', {
            variant: 'warning',
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen törlési hiba.';
      console.error('Sikertelen törlés', error);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card key={item.id} sx={{ width: '100%' }}>
      <CardContent sx={{ display: 'grid', gap: 0.5 }}>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        ) : null}
        {meta ? (
          <Typography color="text.secondary" variant="caption">
            {meta}
          </Typography>
        ) : null}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="outlined"
          disabled={isDeleting}
          onClick={() => {
            void navigate({
              to: '/admin/$topicId/$itemId/edit',
              params: { itemId: item.id, topicId },
            });
          }}
        >
          Szerkesztés
        </Button>
        <Button
          color="error"
          variant="text"
          disabled={isDeleting}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          {isDeleting ? 'Törlés...' : 'Törlés'}
        </Button>
      </CardActions>
      <DeleteItemDialog
        description={subtitle || meta || undefined}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => void handleDelete()}
        open={isDeleteDialogOpen}
        title={title}
      />
    </Card>
  );
};

export default AdminTopicItem;
