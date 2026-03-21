import { deleteTopicImageByPath } from '@data/storage';
import { QUERY_KEYS } from '@queries/queryKeys';
import { deleteTopicItem } from '@service/items';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { TopicField } from '@/types/topics';

type UseAdminTopicItemParams = {
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

export const useAdminTopicItem = ({
  collectionName,
  fields,
  item,
  topicId,
}: UseAdminTopicItemParams) => {
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

  return {
    description: subtitle || meta || undefined,
    isDeleteDialogOpen,
    isDeleting,
    meta: meta || undefined,
    onCloseDeleteDialog: () => setIsDeleteDialogOpen(false),
    onConfirmDelete: () => void handleDelete(),
    onEdit: () => {
      void navigate({
        to: '/admin/$topicId/$itemId/edit',
        params: { itemId: item.id, topicId },
      });
    },
    onOpenDeleteDialog: () => setIsDeleteDialogOpen(true),
    subtitle: subtitle || undefined,
    title,
  };
};
