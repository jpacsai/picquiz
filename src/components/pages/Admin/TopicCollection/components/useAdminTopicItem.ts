import { deleteTopicImageByPath } from '@data/storage';
import { useMediaQuery, useTheme } from '@mui/material';
import { QUERY_KEYS } from '@queries/queryKeys';
import { deleteTopicItem } from '@service/items';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import {
  getTopicItemImageUrls,
  getTopicItemTitle,
  getTopicItemValuesByDisplay,
  joinDisplayValueNodes,
  joinDisplayValueTexts,
} from '@/components/pages/Admin/TopicItem/utils';
import type { TopicField, TopicItem } from '@/types/topics';

type UseAdminTopicItemParams = {
  collectionName: string;
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
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
  const [isMobileImagePreviewOpen, setIsMobileImagePreviewOpen] = useState(false);
  const [loadedPreviewImageUrl, setLoadedPreviewImageUrl] = useState<string | null>(null);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));

  const titleValues = getTopicItemValuesByDisplay(fields, item, 'title');
  const subtitleValues = getTopicItemValuesByDisplay(fields, item, 'subtitle');
  const metaValues = getTopicItemValuesByDisplay(fields, item, 'meta');

  const title = titleValues[0]?.text ?? getTopicItemTitle(fields, item);
  const subtitleText = subtitleValues.length ? joinDisplayValueTexts(subtitleValues) : '';
  const subtitle = subtitleValues.length ? joinDisplayValueNodes(subtitleValues) : undefined;
  const metaText = joinDisplayValueTexts(metaValues);
  const meta = metaValues.length ? joinDisplayValueNodes(metaValues) : undefined;
  const imagePathsToDelete = getImagePathsToDelete({ fields, item });
  const { mobileImageUrl } = getTopicItemImageUrls(fields, item);

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
    isMobileImagePreviewOpen,
    isMobileScreen,
    meta,
    mobileImageAlt: `${title} mobil kep`,
    mobileImageUrl,
    onOpen: () => {
      void navigate({
        to: '/$topicId/items/$itemId',
        params: { itemId: item.id, topicId },
      });
    },
    onCloseDeleteDialog: () => setIsDeleteDialogOpen(false),
    onCloseMobileImagePreview: () => {
      setIsMobileImagePreviewOpen(false);
      setLoadedPreviewImageUrl(null);
    },
    onConfirmDelete: () => void handleDelete(),
    onEdit: () => {
      void navigate({
        to: '/$topicId/items/$itemId/edit',
        params: { itemId: item.id, topicId },
      });
    },
    onMobileImageLoad: () => setLoadedPreviewImageUrl(mobileImageUrl ?? null),
    onOpenDeleteDialog: () => setIsDeleteDialogOpen(true),
    onOpenMobileImagePreview: () => {
      setLoadedPreviewImageUrl(null);
      setIsMobileImagePreviewOpen(true);
    },
    showMobileImagePreviewLoader: Boolean(
      isMobileImagePreviewOpen && mobileImageUrl && loadedPreviewImageUrl !== mobileImageUrl,
    ),
    subtitle: subtitle || undefined,
    title,
  };
};
