import type { TopicFieldDraft } from '@/types/topicSchema';

export const IMAGE_UPLOAD_TARGET_FIELD_KEYS = {
  desktopPath: 'image_path_desktop',
  desktop: 'image_url_desktop',
  mobilePath: 'image_path_mobile',
  mobile: 'image_url_mobile',
} as const;

export const IMAGE_UPLOAD_MAX_DIMENSIONS = {
  desktop: {
    maxHeight: 600,
    maxWidth: 800,
  },
  mobile: {
    maxHeight: 400,
    maxWidth: 330,
  },
} as const;

export const IMAGE_UPLOAD_SYSTEM_FIELDS: TopicFieldDraft[] = [
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
    label: 'Image path - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
    label: 'Image url - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
    label: 'Image path - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
    label: 'Image url - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
];

export const IMAGE_UPLOAD_SYSTEM_FIELD_KEYS = new Set(
  IMAGE_UPLOAD_SYSTEM_FIELDS.map((field) => field.key).filter((key): key is string => Boolean(key)),
);
