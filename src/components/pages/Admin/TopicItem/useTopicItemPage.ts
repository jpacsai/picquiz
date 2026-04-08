import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';

import type { Topic, TopicItem } from '@/types/topics';

import {
  getTopicItemDetailRows,
  getTopicItemImageUrls,
  getTopicItemTitle,
  getTopicItemValuesByDisplay,
  joinDisplayValueNodes,
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
  const subtitleValues = getTopicItemValuesByDisplay(topic.fields, item, 'subtitle');
  const metaValues = getTopicItemValuesByDisplay(topic.fields, item, 'meta');
  const title = titleValues[0]?.text ?? getTopicItemTitle(topic.fields, item);
  const subtitle = subtitleValues.length ? joinDisplayValueNodes(subtitleValues) : undefined;
  const meta = metaValues.length ? joinDisplayValueNodes(metaValues) : undefined;
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
    meta: meta as ReactNode | undefined,
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
    subtitle: subtitle as ReactNode | undefined,
    thumbnailCaption: mobileImageUrl ? 'Mobilnézet' : 'Feltöltött kép',
    thumbnailImageUrl,
    title,
  };
};

export type UseTopicItemPageResult = ReturnType<typeof useTopicItemPage>;
