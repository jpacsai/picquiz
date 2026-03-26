import { deleteTopicImageByPath } from '@data/storage';
import { QUERY_KEYS } from '@queries/queryKeys';
import { deleteTopicItem } from '@service/items';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { Fragment, createElement, useState, type ReactNode } from 'react';

import BooleanValue from '@/components/ui/BooleanValue';
import type { TopicField, TopicItem } from '@/types/topics';
import { getBooleanValueLabel } from '@/utils/booleanValue';

type UseAdminTopicItemParams = {
  collectionName: string;
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
};

type DisplayValue = {
  node: ReactNode;
  text: string;
};

const getDisplayValue = (field: TopicField, value: unknown): DisplayValue | null => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length
      ? {
          node: trimmedValue,
          text: trimmedValue,
        }
      : null;
  }

  if (typeof value === 'number') {
    const text = String(value);

    return {
      node: text,
      text,
    };
  }

  if (typeof value === 'boolean') {
    const booleanLabel = getBooleanValueLabel(value);
    const text = `${field.label}: ${booleanLabel}`;

    return {
      node: createElement(
        Fragment,
        null,
        `${field.label}: `,
        createElement(BooleanValue, {
          ariaLabel: text,
          value,
        }),
      ),
      text,
    };
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
    .map((field) => getDisplayValue(field, item[field.key]))
    .filter((value): value is DisplayValue => value !== null);
};

const joinDisplayValueTexts = (values: DisplayValue[]) =>
  values.map((value) => value.text).join(' - ');

const joinDisplayValueNodes = (values: DisplayValue[]) =>
  values.map((value, index) =>
    createElement(
      Fragment,
      { key: `${value.text}-${index}` },
      index > 0 ? ' - ' : null,
      value.node,
    ),
  );

const getFallbackTitle = (item: TopicItem) => {
  const fallbackValue = [item.title, item.artist]
    .map((value) => getDisplayValue({ key: '', label: '', type: 'string' }, value))
    .find((value): value is DisplayValue => value !== null);

  return fallbackValue?.text ?? item.id;
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

  const title = titleValues[0]?.text ?? getFallbackTitle(item);
  const subtitleText = subtitleValues.length ? joinDisplayValueTexts(subtitleValues) : '';
  const subtitle = subtitleValues.length ? joinDisplayValueNodes(subtitleValues) : undefined;
  const metaText = joinDisplayValueTexts(metaValues);
  const meta = metaValues.length ? joinDisplayValueNodes(metaValues) : undefined;
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
    description: subtitleText || metaText || undefined,
    isDeleteDialogOpen,
    isDeleting,
    meta,
    onCloseDeleteDialog: () => setIsDeleteDialogOpen(false),
    onConfirmDelete: () => void handleDelete(),
    onEdit: () => {
      void navigate({
        to: '/admin/$topicId/items/$itemId/edit',
        params: { itemId: item.id, topicId },
      });
    },
    onOpenDeleteDialog: () => setIsDeleteDialogOpen(true),
    subtitle: subtitle || undefined,
    title,
  };
};
