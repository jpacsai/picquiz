import type { TopicFieldDraft } from '@/types/topicSchema';

export const IMAGE_UPLOAD_TARGET_FIELD_KEYS = {
  desktopPath: 'image_path_desktop',
  desktop: 'image_url_desktop',
  mobilePath: 'image_path_mobile',
  mobile: 'image_url_mobile',
} as const;

export const IMAGE_UPLOAD_SYSTEM_FIELDS: TopicFieldDraft[] = [
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
    label: 'Kep path - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
    label: 'Kep url - desktop',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
    label: 'Kep path - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
  {
    hideInEdit: true,
    key: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
    label: 'Kep url - mobile',
    readonly: true,
    required: true,
    type: 'string',
  },
];

export const IMAGE_UPLOAD_SYSTEM_FIELD_KEYS = new Set(
  IMAGE_UPLOAD_SYSTEM_FIELDS.map((field) => field.key).filter((key): key is string => Boolean(key)),
);
