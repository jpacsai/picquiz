import * as yup from 'yup';
import type { TopicField } from '../../../../types/topics';

type FormDeriveFieldIndex = Omit<TopicField, 'fn'> & {
  fn?: {
    target: string;
    source: string;
    name: string;
  };
};

type FormDeriveField = Omit<TopicField, 'fn'> & {
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

export const getDefaultValues = (fields: TopicField[]): FormValues => {
  const initValFields = fields.reduce((acc, field) => {
    const val = { [field.key]: field.type === 'string' ? '' : 0 };
    return { ...acc, ...val };
  }, {} as FormValues);
  return initValFields;
};

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
    field.type === 'string'
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
