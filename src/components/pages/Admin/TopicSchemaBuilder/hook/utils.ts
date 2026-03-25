import {
  IMAGE_UPLOAD_SYSTEM_FIELDS,
  IMAGE_UPLOAD_SYSTEM_FIELD_KEYS,
  IMAGE_UPLOAD_TARGET_FIELD_KEYS,
} from '@/constants/imageUpload';
import type { Topic } from '@/types/topics';
import type { TopicDraft, TopicFieldDraft } from '@/types/topicSchema';

export const isImageUploadSystemField = (field: TopicFieldDraft) =>
  typeof field.key === 'string' && IMAGE_UPLOAD_SYSTEM_FIELD_KEYS.has(field.key);

export const normalizeImageUploadField = (field: TopicFieldDraft): TopicFieldDraft =>
  field.type === 'imageUpload'
    ? {
        ...field,
        fileNameFields: field.fileNameFields ?? [],
        targetFields: {
          ...field.targetFields,
          desktopPath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
          desktop: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
          mobilePath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
          mobile: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
        },
      }
    : field;

export const getPersistedFields = (fields: TopicFieldDraft[]) => {
  const normalizedFields = fields
    .filter((field) => !isImageUploadSystemField(field))
    .map((field) => normalizeImageUploadField(field));
  const hasImageUploadField = normalizedFields.some((field) => field.type === 'imageUpload');

  return hasImageUploadField ? [...normalizedFields, ...IMAGE_UPLOAD_SYSTEM_FIELDS] : normalizedFields;
};

export const getInitialDraft = (topic?: Topic): TopicDraft => ({
  fields:
    topic?.fields
      ?.filter((field) => !isImageUploadSystemField(field))
      .map((field) => normalizeImageUploadField(field)) ?? [],
  id: topic?.id ?? '',
  label: topic?.label ?? '',
  slug: topic?.slug ?? '',
  storage_prefix: topic?.storage_prefix ?? '',
});

export const getEmptyFieldDraft = (): TopicFieldDraft => ({
  fileNameFields: [],
  key: '',
  label: '',
  type: 'string',
});

export const getFixedImageUploadFieldDraft = (): TopicFieldDraft => ({
  fileNameFields: [],
  key: 'image_upload',
  label: 'Kepfeltoltes',
  required: true,
  targetFields: {
    desktopPath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktopPath,
    desktop: IMAGE_UPLOAD_TARGET_FIELD_KEYS.desktop,
    mobilePath: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobilePath,
    mobile: IMAGE_UPLOAD_TARGET_FIELD_KEYS.mobile,
  },
  type: 'imageUpload',
});

export const getAvailableFileNameFieldOptions = ({
  currentFieldKey,
  fields,
}: {
  currentFieldKey?: string;
  fields: TopicDraft['fields'];
}) =>
  fields
    .filter(
      (field) =>
        field.type !== 'imageUpload' &&
        field.required &&
        typeof field.key === 'string' &&
        field.key.trim().length > 0 &&
        field.key !== currentFieldKey,
    )
    .map((field) => ({
      key: field.key!.trim(),
      label: field.label?.trim() || field.key!.trim(),
    }));

export const getAvailableDistractorSourceFieldOptions = ({
  currentFieldKey,
  fields,
}: {
  currentFieldKey?: string;
  fields: TopicDraft['fields'];
}) =>
  fields
    .filter(
      (field) =>
        (field.type === 'number' || field.type === 'year') &&
        typeof field.key === 'string' &&
        field.key.trim().length > 0 &&
        field.key !== currentFieldKey,
    )
    .map((field) => ({
      key: field.key!.trim(),
      label: field.label?.trim() || field.key!.trim(),
    }));

export const getSelectOptionsText = (options: string[] | undefined) => (options ?? []).join(', ');

export const isIgnoredCreateImageUploadError = (path: string, fieldIndex: number) =>
  path.startsWith(`fields[${fieldIndex}]`) &&
  ['.fileNameFields'].some((suffix) => path.endsWith(suffix));

export const getPersistedTopicValues = (draft: TopicDraft) => ({
  fields: getPersistedFields(draft.fields) as Topic['fields'],
  label: draft.label?.trim() ?? '',
  slug: draft.slug?.trim() ?? '',
  storage_prefix: draft.storage_prefix?.trim() ?? '',
});
