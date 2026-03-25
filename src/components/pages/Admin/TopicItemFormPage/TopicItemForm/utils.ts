import {
  uploadResponsiveTopicImages,
} from '@data/storage';
import { generateResponsiveImageVariants } from '@lib/image';
import { QUERY_KEYS } from '@queries/queryKeys';
import type { useQueryClient } from '@tanstack/react-query';
import * as yup from 'yup';

import type {
  FormDeriveField,
  FormDeriveFieldIndex,
  FormMode,
  FormValues,
  PendingImageSelection,
  PersistableFormValues,
} from '@/types/topicItemForm';
import type { TopicField, TopicItem } from '@/types/topics';
import { sortSelectOptions } from '@/utils/sortSelectOptions';

export const fnRegistry = {
  yearToCentury: (year: number) => {
    const centuryNum = Math.floor((year - 1) / 100) + 1;
    return `${centuryNum}-ik század`;
  },
};

const YEAR_RANGE_SEPARATOR = ' - ';

export const parseYearRangeValue = (value: unknown): { from: string; to: string } => {
  if (typeof value !== 'string') {
    return { from: '', to: '' };
  }

  if (!value.trim()) {
    return { from: '', to: '' };
  }

  const [from = '', to = ''] = value.includes(YEAR_RANGE_SEPARATOR)
    ? value.split(YEAR_RANGE_SEPARATOR)
    : [value, ''];

  return {
    from: from.trim(),
    to: to.trim(),
  };
};

export const buildYearRangeValue = ({
  from,
  to,
}: {
  from: string;
  to: string;
}): string => {
  const normalizedFrom = from.trim();
  const normalizedTo = to.trim();

  if (!normalizedFrom && !normalizedTo) {
    return '';
  }

  return `${normalizedFrom}${YEAR_RANGE_SEPARATOR}${normalizedTo}`;
};

export const getInitialValues = (
  fields: TopicField[],
  values?: Record<string, unknown>,
): FormValues =>
  fields.reduce((acc, field) => {
    const nextValue = values?.[field.key];
    const defaultValue = field.type === 'boolean' ? false : '';

    return {
      ...acc,
      [field.key]:
        typeof nextValue === 'string' ||
        typeof nextValue === 'number' ||
        typeof nextValue === 'boolean'
          ? nextValue
          : defaultValue,
    };
  }, {} as FormValues);

const buildDerivation = (fields: readonly TopicField[]): FormDeriveFieldIndex[] => {
  return fields.map((field) => ({
    ...field,
    fn: field.fn ? { ...field.fn, target: field.key } : undefined,
  }));
};

const resolveYearMaximum = (max: Extract<TopicField, { type: 'year' | 'yearRange' }>['max']) =>
  max === 'todayYear' ? new Date().getFullYear() : max;

export const getDerivationIndex = (fields: TopicField[]) =>
  buildDerivation(fields).reduce((acc, derivField): Record<string, FormDeriveField> => {
    if (derivField.fn) {
      const { fn: _drop, ...newTargetField } = derivField;
      const sourceKey = derivField.fn.source;
      const sourceField = fields.find((field) => field.key === sourceKey);

      if (sourceField) {
        const newSourceField = {
          ...sourceField,
          fn: { target: derivField.fn.target, name: derivField.fn.name },
        };
        return {
          ...acc,
          [newSourceField.key]: newSourceField,
          [newTargetField.key]: newTargetField,
        };
      }
      return { ...acc, [derivField.key]: newTargetField };
    }
    return { ...acc, [derivField.key]: derivField };
  }, {});

export const getFieldValidator = (field: TopicField) => {
  const yearMinimum = field.type === 'year' ? field.min : undefined;
  const yearMaximum = field.type === 'year' ? resolveYearMaximum(field.max) : undefined;
  const yearRangeMinimum = field.type === 'yearRange' ? field.min : undefined;
  const yearRangeMaximum = field.type === 'yearRange' ? resolveYearMaximum(field.max) : undefined;

  if (field.type === 'yearRange') {
    return ({ value }: { value: string | number | boolean }) => {
      const { from, to } = parseYearRangeValue(value);
      const hasFrom = from.length > 0;
      const hasTo = to.length > 0;

      if (!hasFrom && !hasTo) {
        return field.required ? 'Required' : undefined;
      }

      const fromNumber = hasFrom ? Number(from) : undefined;
      const toNumber = hasTo ? Number(to) : undefined;

      if (hasFrom && (fromNumber === undefined || Number.isNaN(fromNumber) || !Number.isInteger(fromNumber))) {
        return 'From year must be a whole year';
      }

      if (hasTo && (toNumber === undefined || Number.isNaN(toNumber) || !Number.isInteger(toNumber))) {
        return 'To year must be a whole year';
      }

      if (yearRangeMinimum !== undefined && typeof fromNumber === 'number' && fromNumber < yearRangeMinimum) {
        return `From year must be at least ${yearRangeMinimum}`;
      }

      if (yearRangeMinimum !== undefined && typeof toNumber === 'number' && toNumber < yearRangeMinimum) {
        return `To year must be at least ${yearRangeMinimum}`;
      }

      if (yearRangeMaximum !== undefined && typeof fromNumber === 'number' && fromNumber > yearRangeMaximum) {
        return `From year must be at most ${yearRangeMaximum}`;
      }

      if (yearRangeMaximum !== undefined && typeof toNumber === 'number' && toNumber > yearRangeMaximum) {
        return `To year must be at most ${yearRangeMaximum}`;
      }

      if (typeof fromNumber === 'number' && typeof toNumber === 'number' && fromNumber > toNumber) {
        return 'From year cannot be greater than to year';
      }

      return undefined;
    };
  }

  const schema =
    field.type === 'boolean'
      ? field.required
        ? yup.boolean().required('Required')
        : yup.boolean().notRequired()
      : field.type === 'string' || field.type === 'select' || field.type === 'imageUpload'
      ? field.required
        ? yup.string().required('Required')
        : yup.string().notRequired()
      : field.type === 'year'
        ? (() => {
            const baseSchema = (field.required
              ? yup
                  .number()
                  .transform((value, originalValue) => (originalValue === '' ? undefined : value))
                  .typeError('Must be a year')
                  .integer('Must be a whole year')
                  .required('Required')
              : yup
                  .number()
                  .transform((value, originalValue) => (originalValue === '' ? undefined : value))
                  .typeError('Must be a year')
                  .integer('Must be a whole year')
                  .notRequired()) as yup.NumberSchema<number | undefined>;

            return baseSchema
              .test(
                'year-min',
                `Must be at least ${yearMinimum}`,
                (value) => value === undefined || yearMinimum === undefined || value >= yearMinimum,
              )
              .test(
                'year-max',
                `Must be at most ${yearMaximum}`,
                (value) => value === undefined || yearMaximum === undefined || value <= yearMaximum,
              );
          })()
      : field.required
        ? yup
            .number()
            .transform((value, originalValue) => (originalValue === '' ? undefined : value))
            .typeError('Must be a number')
            .required('Required')
        : yup
            .number()
            .transform((value, originalValue) => (originalValue === '' ? undefined : value))
            .typeError('Must be a number')
            .notRequired();

  return ({ value }: { value: string | number | boolean }) => {
    try {
      schema.validateSync(value);
      return undefined;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return error.message;
      }

      return 'Validation error';
    }
  };
};

export const getRequiredImageUploadError = ({
  field,
  pendingImageSelection,
  values,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  pendingImageSelection: PendingImageSelection | null;
  values: FormValues;
}) => {
  if (!field.required) {
    return undefined;
  }

  const hasPendingSelection = pendingImageSelection?.field.key === field.key;
  const desktopUrl = values[field.targetFields.desktop];
  const mobileUrl = values[field.targetFields.mobile];
  const hasPersistedUrls =
    typeof desktopUrl === 'string' &&
    desktopUrl.trim().length > 0 &&
    typeof mobileUrl === 'string' &&
    mobileUrl.trim().length > 0;

  if (!hasPendingSelection && !hasPersistedUrls) {
    return `${field.label} kötelező.`;
  }

  return undefined;
};

export const validateImageUploads = ({
  fields,
  pendingImageSelection,
  values,
}: {
  fields: TopicField[];
  pendingImageSelection: PendingImageSelection | null;
  values: FormValues;
}) =>
  fields
    .filter(
      (field): field is Extract<TopicField, { type: 'imageUpload' }> => field.type === 'imageUpload',
    )
    .map((field) =>
      getRequiredImageUploadError({
        field,
        pendingImageSelection,
        values,
      }),
    )
    .find(Boolean);

export const mergeRefreshedSelectFieldOptions = ({
  currentFields,
  refreshedFields,
}: {
  currentFields: TopicField[];
  refreshedFields: TopicField[];
}) => {
  const refreshedSelectFieldsByKey = new Map(
    refreshedFields
      .filter((field): field is Extract<TopicField, { type: 'select' }> => field.type === 'select')
      .map((field) => [field.key, field]),
  );

  return currentFields.map((field) => {
    if (field.type !== 'select') {
      return field;
    }

    const refreshedField = refreshedSelectFieldsByKey.get(field.key);

    return refreshedField
      ? {
          ...field,
          options: sortSelectOptions(refreshedField.options),
        }
      : field;
  });
};

export const getAutocompleteOptionsByField = ({
  fields,
  items,
  currentItemId,
}: {
  fields: TopicField[];
  items: ReadonlyArray<TopicItem>;
  currentItemId?: string;
}) =>
  fields.reduce<Record<string, string[]>>((acc, field) => {
    if (field.type !== 'string' || !field.autocomplete) {
      return acc;
    }

    const options = [...new Set(
      items
        .filter((item) => item.id !== currentItemId)
        .map((item) => item[field.key])
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    )].sort((left, right) => left.localeCompare(right, 'hu'));

    if (!options.length) {
      return acc;
    }

    return {
      ...acc,
      [field.key]: options,
    };
  }, {});

export const getPersistableValue = ({
  fields,
  values,
}: {
  fields: TopicField[];
  values: FormValues;
}): PersistableFormValues =>
  fields.reduce<PersistableFormValues>((acc, field) => {
    if (field.type === 'imageUpload') {
      return acc;
    }

    const nextValue = values[field.key];

    if (nextValue === undefined) {
      return acc;
    }

    const normalizedValue =
      (field.type === 'string' || field.type === 'yearRange') && typeof nextValue === 'string'
        ? nextValue.trim()
        : nextValue;
    const isEmptyValue = normalizedValue === '';

    if (!field.required && isEmptyValue) {
      return acc;
    }

    return {
      ...acc,
      [field.key]: normalizedValue,
    };
  }, {});

export const getDerivedValue = (
  field: FormDeriveField | undefined,
  value: string | number,
): string | undefined => {
  if (!field?.fn) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  const deriveFn = fnRegistry[field.fn.name as keyof typeof fnRegistry];

  if (!deriveFn) {
    return undefined;
  }

  return deriveFn(value);
};

const getNormalizedImageUploadFileNameParts = ({
  field,
  values,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  values: Record<string, string | number | boolean>;
}) =>
  field.fileNameFields
    .map((fieldKey) => values[fieldKey])
    .filter((value): value is string | boolean => typeof value === 'string' || typeof value === 'boolean')
    .map((value) => (typeof value === 'boolean' ? (value ? 'Igaz' : 'Hamis') : value.trim()))
    .filter(Boolean);

const getUploadedImageValues = ({
  field,
  uploadedImages,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  uploadedImages: Awaited<ReturnType<typeof uploadResponsiveTopicImages>>;
}) => {
  const nextValues: Record<string, string> = {
    [field.targetFields.desktop]: uploadedImages.desktop.url,
    [field.targetFields.mobile]: uploadedImages.mobile.url,
  };

  if (field.targetFields.desktopPath) {
    nextValues[field.targetFields.desktopPath] = uploadedImages.desktop.path;
  }

  if (field.targetFields.mobilePath) {
    nextValues[field.targetFields.mobilePath] = uploadedImages.mobile.path;
  }

  return nextValues;
};

const getPathsToDelete = ({
  field,
  previousValues,
  nextValues,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  nextValues: Record<string, string>;
  previousValues: Record<string, string | number | boolean>;
}) => {
  const pathKeys = [field.targetFields.desktopPath, field.targetFields.mobilePath].filter(
    (value): value is string => Boolean(value),
  );

  return [...new Set(pathKeys)]
    .map((pathKey) => {
      const previousPath = previousValues[pathKey];
      const nextPath = nextValues[pathKey];

      return typeof previousPath === 'string' &&
        previousPath.trim().length > 0 &&
        previousPath !== nextPath
        ? previousPath
        : null;
    })
    .filter((value): value is string => value !== null);
};

export const resolveSubmittedValues = async ({
  form,
  pendingImageSelection,
  previousValues,
  storagePrefix,
  mode,
}: {
  form: {
    setFieldValue: (field: string, value: string | number | boolean) => void;
  };
  mode: FormMode;
  pendingImageSelection: PendingImageSelection | null;
  previousValues: Record<string, string | number | boolean>;
  storagePrefix: string;
}) => {
  if (!pendingImageSelection) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { field, file, uniqueSuffix } = pendingImageSelection;
  const fileNameParts = getNormalizedImageUploadFileNameParts({
    field,
    values: previousValues,
  });

  if (!fileNameParts.length) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { desktop, mobile } = await generateResponsiveImageVariants(file);
  const uploadedImages = await uploadResponsiveTopicImages({
    fileNameParts,
    storagePrefix,
    desktopBlob: desktop.blob,
    mobileBlob: mobile.blob,
    uniqueSuffix,
  });

  const uploadedImageValues = getUploadedImageValues({
    field,
    uploadedImages,
  });

  Object.entries(uploadedImageValues).forEach(([targetField, targetValue]) => {
    form.setFieldValue(targetField, targetValue);
  });

  return {
    imagePathsToDelete:
      mode === 'edit'
        ? getPathsToDelete({
            field,
            nextValues: uploadedImageValues,
            previousValues,
          })
        : [],
    submittedValue: {
      ...previousValues,
      ...uploadedImageValues,
    },
  };
};

export const syncUpdatedItemCache = ({
  collectionName,
  itemId,
  queryClient,
  values,
}: {
  collectionName: string;
  itemId: string;
  queryClient: ReturnType<typeof useQueryClient>;
  values: Record<string, string | number | boolean>;
}) => {
  const nextItem: TopicItem = {
    id: itemId,
    ...values,
  };

  queryClient.setQueryData(QUERY_KEYS.ITEMS.detail(collectionName, itemId), nextItem);
  queryClient.setQueryData<ReadonlyArray<TopicItem>>(
    QUERY_KEYS.ITEMS.byTopic(collectionName),
    (previousItems) =>
      previousItems?.map((item) => (item.id === itemId ? { ...item, ...nextItem } : item)) ??
      previousItems,
  );
};
