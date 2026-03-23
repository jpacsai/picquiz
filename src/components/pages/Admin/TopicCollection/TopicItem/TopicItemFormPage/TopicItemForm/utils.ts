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

export const fnRegistry = {
  yearToCentury: (year: number) => {
    const centuryNum = Math.floor((year - 1) / 100) + 1;
    return `${centuryNum}-ik század`;
  },
};

export const getInitialValues = (
  fields: TopicField[],
  values?: Record<string, unknown>,
): FormValues =>
  fields.reduce((acc, field) => {
    const nextValue = values?.[field.key];

    return {
      ...acc,
      [field.key]:
        typeof nextValue === 'string' || typeof nextValue === 'number' ? nextValue : '',
    };
  }, {} as FormValues);

const buildDerivation = (fields: readonly TopicField[]): FormDeriveFieldIndex[] => {
  return fields.map((field) => ({
    ...field,
    fn: field.fn ? { ...field.fn, target: field.key } : undefined,
  }));
};

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
  const schema =
    field.type === 'string' || field.type === 'select' || field.type === 'imageUpload'
      ? field.required
        ? yup.string().required('Required')
        : yup.string().notRequired()
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

  return ({ value }: { value: string | number }) => {
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
          options: refreshedField.options,
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
      field.type === 'string' && typeof nextValue === 'string' ? nextValue.trim() : nextValue;
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
  previousValues: Record<string, string | number>;
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
    setFieldValue: (field: string, value: string | number) => void;
  };
  mode: FormMode;
  pendingImageSelection: PendingImageSelection | null;
  previousValues: Record<string, string | number>;
  storagePrefix: string;
}) => {
  if (!pendingImageSelection) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { field, file, uniqueSuffix } = pendingImageSelection;
  const artistValue = previousValues[field.fileNameFields.artist];
  const titleValue = previousValues[field.fileNameFields.title];
  const artistName = typeof artistValue === 'string' ? artistValue.trim() : '';
  const title = typeof titleValue === 'string' ? titleValue.trim() : '';

  if (!artistName || !title) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { desktop, mobile } = await generateResponsiveImageVariants(file);
  const uploadedImages = await uploadResponsiveTopicImages({
    artistName,
    title,
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
  values: Record<string, string | number>;
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