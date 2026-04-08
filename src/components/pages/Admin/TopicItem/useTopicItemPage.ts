import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import type { Topic, TopicItem } from '@/types/topics';

import {
  getTopicItemDetailRows,
  getTopicItemImageUrls,
  getTopicItemTitle,
  getTopicItemValuesByDisplay,
} from './utils';

type UseTopicItemPageParams = {
  item: TopicItem;
  topic: Topic;
};

export const useTopicItemPage = ({ item, topic }: UseTopicItemPageParams) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [loadedPreviewImageUrl, setLoadedPreviewImageUrl] = useState<string | null>(null);
  const titleValues = getTopicItemValuesByDisplay(topic.fields, item, 'title');
  const title = titleValues[0]?.text ?? getTopicItemTitle(topic.fields, item);
  const detailRows = getTopicItemDetailRows(topic.fields, item);
  const { desktopImageUrl, mobileImageUrl } = getTopicItemImageUrls(topic.fields, item);
  const previewImageUrl = isMobileScreen
    ? (mobileImageUrl ?? desktopImageUrl)
    : (desktopImageUrl ?? mobileImageUrl);
  const thumbnailImageUrl = mobileImageUrl ?? desktopImageUrl;

  return {
    detailRows,
    hasDetails: detailRows.length > 0,
    imageAlt: `${title} kep`,
    isImagePreviewOpen,
    isMobileScreen,
    onCloseImagePreview: () => {
      setIsImagePreviewOpen(false);
      setLoadedPreviewImageUrl(null);
    },
    onEdit: () => {
      void navigate({
        to: '/$topicId/items/$itemId/edit',
        params: { itemId: item.id, topicId: topic.id },
      });
    },
    onImageLoad: () => setLoadedPreviewImageUrl(previewImageUrl ?? null),
    onOpenImagePreview: () => {
      setLoadedPreviewImageUrl(null);
      setIsImagePreviewOpen(true);
    },
    previewImageUrl,
    showImagePreviewLoader: Boolean(
      isImagePreviewOpen && previewImageUrl && loadedPreviewImageUrl !== previewImageUrl,
    ),
    showThumbnail: Boolean(thumbnailImageUrl),
    thumbnailImageUrl,
  };
};

export type UseTopicItemPageResult = ReturnType<typeof useTopicItemPage>;
