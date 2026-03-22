import * as yup from 'yup';

import type { TopicField } from '@/types/topics';

type FormDeriveFieldIndex = Omit<TopicField, 'fn'> & {
  fn?: {
    target: string;
    source: string;
    name: string;
  };
};

export type FormDeriveField = Omit<TopicField, 'fn'> & {
  fn?: {
    target: string;
    name: string;
  };
};

export const fnRegistry = {
  yearToCentury: (year: number) => {
    const centuryNum = Math.floor((year - 1) / 100) + 1;
    return `${centuryNum}-ik század`;
  },
};

export type FormValues = Record<string, string | number>;
export type PersistableFormValues = Record<string, string | number>;
export type PendingImageSelection = {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  file: File;
  previewUrl: string;
  uniqueSuffix: string;
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
