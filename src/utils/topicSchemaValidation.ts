import type {
  TopicDraft,
  TopicFieldDraft,
  TopicSchemaIssue,
  TopicSchemaValidationResult,
} from '@/types/topicSchema';

const createIssue = ({
  message,
  path,
  severity,
}: TopicSchemaIssue): TopicSchemaIssue => ({
  message,
  path,
  severity,
});

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const getFieldPath = (index: number, key?: string) =>
  isNonEmptyString(key) ? `fields[${index}] (${key})` : `fields[${index}]`;

const getFieldKeys = (fields: TopicFieldDraft[]) =>
  fields.map((field) => field.key?.trim()).filter((value): value is string => Boolean(value));

const isImageUploadTargetField = (field: TopicFieldDraft | undefined) =>
  field?.type === 'string' && field.required && field.readonly && field.hideInEdit;

const validateTopicMetadata = (draft: TopicDraft): TopicSchemaIssue[] => {
  const errors: TopicSchemaIssue[] = [];

  if (!isNonEmptyString(draft.id)) {
    errors.push(createIssue({ message: 'Topic id is required.', path: 'id', severity: 'error' }));
  }

  if (!isNonEmptyString(draft.label)) {
    errors.push(
      createIssue({ message: 'Topic label is required.', path: 'label', severity: 'error' }),
    );
  }

  if (!isNonEmptyString(draft.slug)) {
    errors.push(createIssue({ message: 'Topic slug is required.', path: 'slug', severity: 'error' }));
  }

  if (!isNonEmptyString(draft.storage_prefix)) {
    errors.push(
      createIssue({
        message: 'Topic storage prefix is required.',
        path: 'storage_prefix',
        severity: 'error',
      }),
    );
  }

  return errors;
};

const validateField = ({
  field,
  fieldIndex,
  imageUploadFieldCount,
  fields,
  knownFieldKeys,
}: {
  field: TopicFieldDraft;
  fieldIndex: number;
  fields: TopicFieldDraft[];
  imageUploadFieldCount: number;
  knownFieldKeys: Set<string>;
}): TopicSchemaIssue[] => {
  const issues: TopicSchemaIssue[] = [];
  const fieldPath = getFieldPath(fieldIndex, field.key);

  if (!isNonEmptyString(field.key)) {
    issues.push(
      createIssue({
        message: 'Field key is required.',
        path: `${fieldPath}.key`,
        severity: 'error',
      }),
    );
  }

  if (!isNonEmptyString(field.label)) {
    issues.push(
      createIssue({
        message: 'Field label is required.',
        path: `${fieldPath}.label`,
        severity: 'error',
      }),
    );
  }

  if (!isNonEmptyString(field.type)) {
    issues.push(
      createIssue({
        message: 'Field type is required.',
        path: `${fieldPath}.type`,
        severity: 'error',
      }),
    );
    return issues;
  }

  if (field.quiz && field.type === 'imageUpload') {
    issues.push(
      createIssue({
        message: 'Quiz config is not allowed on image upload fields.',
        path: `${fieldPath}.quiz`,
        severity: 'error',
      }),
    );
  }

  if (field.quiz?.enabled && !isNonEmptyString(field.quiz.prompt)) {
    issues.push(
      createIssue({
        message: 'Quiz prompt is required when quiz is enabled.',
        path: `${fieldPath}.quiz.prompt`,
        severity: 'error',
      }),
    );
  }

  if (field.fn?.source) {
    const trimmedSource = field.fn.source.trim();
    const trimmedKey = field.key?.trim();

    if (trimmedKey && trimmedSource === trimmedKey) {
      issues.push(
        createIssue({
          message: 'A derived field cannot reference itself as its source.',
          path: `${fieldPath}.fn.source`,
          severity: 'error',
        }),
      );
    } else if (trimmedSource && !knownFieldKeys.has(trimmedSource)) {
      issues.push(
        createIssue({
          message: 'Derived field source must reference an existing field.',
          path: `${fieldPath}.fn.source`,
          severity: 'error',
        }),
      );
    }
  }

  if (
    field.quiz?.enabled &&
    field.quiz.distractor?.type === 'derivedRange' &&
    !isNonEmptyString(field.quiz.distractor.sourceField)
  ) {
    issues.push(
      createIssue({
        message: 'Derived range distractor source field is required.',
        path: `${fieldPath}.quiz.distractor.sourceField`,
        severity: 'error',
      }),
    );
  }

  if (
    field.quiz?.enabled &&
    field.quiz.distractor?.type === 'derivedRange' &&
    isNonEmptyString(field.quiz.distractor.sourceField) &&
    !knownFieldKeys.has(field.quiz.distractor.sourceField)
  ) {
    issues.push(
      createIssue({
        message: 'Derived range distractor source field must reference an existing field.',
        path: `${fieldPath}.quiz.distractor.sourceField`,
        severity: 'error',
      }),
    );
  }

  if (
    field.quiz?.enabled &&
    field.quiz.distractor &&
    (field.quiz.distractor.type === 'numericRange' || field.quiz.distractor.type === 'derivedRange') &&
    (field.quiz.distractor.maxValue === undefined ||
      (field.quiz.distractor.maxValue !== 'todayYear' &&
        Number.isNaN(field.quiz.distractor.maxValue)))
  ) {
    issues.push(
      createIssue({
        message: 'Range distractors must define a valid max value.',
        path: `${fieldPath}.quiz.distractor.maxValue`,
        severity: 'error',
      }),
    );
  }

  if (field.quiz?.enabled && field.quiz.distractor?.type === 'fromOptions' && field.type !== 'select') {
    issues.push(
      createIssue({
        message: 'From options distractors are only supported on select fields.',
        path: `${fieldPath}.quiz.distractor.type`,
        severity: 'error',
      }),
    );
  }

  if (
    field.quiz?.enabled &&
    field.quiz.distractor?.type === 'numericRange' &&
    field.type !== 'number' &&
    field.type !== 'year'
  ) {
    issues.push(
      createIssue({
        message: 'Numeric range distractors are only supported on number and year fields.',
        path: `${fieldPath}.quiz.distractor.type`,
        severity: 'error',
      }),
    );
  }

  if (field.quiz?.enabled && field.quiz.distractor?.type === 'derivedRange' && field.type !== 'string') {
    issues.push(
      createIssue({
        message: 'Derived range distractors are only supported on string fields.',
        path: `${fieldPath}.quiz.distractor.type`,
        severity: 'error',
      }),
    );
  }

  if (field.quiz?.enabled && field.quiz.distractor?.type === 'booleanPair' && field.type !== 'boolean') {
    issues.push(
      createIssue({
        message: 'Boolean pair distractors are only supported on boolean fields.',
        path: `${fieldPath}.quiz.distractor.type`,
        severity: 'error',
      }),
    );
  }

  if (field.type === 'select') {
    if (!field.options?.some(isNonEmptyString)) {
      issues.push(
        createIssue({
          message: 'Select fields must have at least one option.',
          path: `${fieldPath}.options`,
          severity: 'error',
        }),
      );
    }
  }

  if (field.type === 'string') {
    const autocompleteCopyFields = (field.autocompleteCopyFields ?? [])
      .map((fieldKey) => fieldKey.trim())
      .filter(Boolean);

    if (autocompleteCopyFields.length && !field.autocomplete) {
      issues.push(
        createIssue({
          message: 'Autocomplete copy settings require autocomplete to be enabled.',
          path: `${fieldPath}.autocomplete`,
          severity: 'error',
        }),
      );
    }

    autocompleteCopyFields.forEach((copyFieldKey) => {
      if (field.key?.trim() === copyFieldKey) {
        issues.push(
          createIssue({
            message: 'Autocomplete copy fields cannot include the source field itself.',
            path: `${fieldPath}.autocompleteCopyFields`,
            severity: 'error',
          }),
        );
        return;
      }

      const referencedCopyField = fields.find(
        (candidateField) => candidateField.key?.trim() === copyFieldKey,
      );

      if (!referencedCopyField || referencedCopyField.type === 'imageUpload') {
        issues.push(
          createIssue({
            message: 'Autocomplete copy fields must reference existing non-image fields.',
            path: `${fieldPath}.autocompleteCopyFields`,
            severity: 'error',
          }),
        );
      }
    });
  }

  if (field.type === 'year' || field.type === 'yearRange') {
    if (field.min !== undefined && Number.isNaN(field.min)) {
      issues.push(
        createIssue({
          message: 'Year minimum must be a valid number.',
          path: `${fieldPath}.min`,
          severity: 'error',
        }),
      );
    }

    if (field.max !== undefined && field.max !== 'todayYear' && Number.isNaN(field.max)) {
      issues.push(
        createIssue({
          message: 'Year maximum must be a valid number or `todayYear`.',
          path: `${fieldPath}.max`,
          severity: 'error',
        }),
      );
    }

    if (
      typeof field.min === 'number' &&
      !Number.isNaN(field.min) &&
      field.max !== undefined &&
      field.max !== 'todayYear' &&
      !Number.isNaN(field.max) &&
      field.min > field.max
    ) {
      issues.push(
        createIssue({
          message: 'Year minimum cannot be greater than year maximum.',
          path: `${fieldPath}.max`,
          severity: 'error',
        }),
      );
    }
  }

  if (field.type === 'imageUpload') {
    if (imageUploadFieldCount > 1) {
      issues.push(
        createIssue({
          message: 'Only one image upload field is supported right now.',
          path: `${fieldPath}.type`,
          severity: 'error',
        }),
      );
    }

    if (!field.required) {
      issues.push(
        createIssue({
          message: 'Image upload fields must be required.',
          path: `${fieldPath}.required`,
          severity: 'error',
        }),
      );
    }

    const fileNameFieldKeys = (field.fileNameFields ?? [])
      .map((fieldKey) => fieldKey.trim())
      .filter(Boolean);

    if (!fileNameFieldKeys.length) {
      issues.push(
        createIssue({
          message: 'Image upload fields must reference at least one file name field.',
          path: `${fieldPath}.fileNameFields`,
          severity: 'error',
        }),
      );
    }

    fileNameFieldKeys.forEach((fileNameFieldKey) => {
      const referencedField = fields.find(
        (candidateField) => candidateField.key?.trim() === fileNameFieldKey,
      );

      if (!referencedField || !referencedField.required || referencedField.type === 'imageUpload') {
        issues.push(
          createIssue({
            message: 'Image upload file name fields must reference required non-image fields.',
            path: `${fieldPath}.fileNameFields`,
            severity: 'error',
          }),
        );
      }
    });

    if (!isNonEmptyString(field.targetFields?.desktop)) {
      issues.push(
        createIssue({
          message: 'Image upload fields must define a desktop target field.',
          path: `${fieldPath}.targetFields.desktop`,
          severity: 'error',
        }),
      );
    } else {
      const desktopTargetField = fields.find(
        (candidateField) => candidateField.key?.trim() === field.targetFields?.desktop?.trim(),
      );

      if (!isImageUploadTargetField(desktopTargetField)) {
        issues.push(
          createIssue({
            message:
              'Image upload desktop target must reference a required, readonly, hidden string field.',
            path: `${fieldPath}.targetFields.desktop`,
            severity: 'error',
          }),
        );
      }
    }

    if (!isNonEmptyString(field.targetFields?.mobile)) {
      issues.push(
        createIssue({
          message: 'Image upload fields must define a mobile target field.',
          path: `${fieldPath}.targetFields.mobile`,
          severity: 'error',
        }),
      );
    } else {
      const mobileTargetField = fields.find(
        (candidateField) => candidateField.key?.trim() === field.targetFields?.mobile?.trim(),
      );

      if (!isImageUploadTargetField(mobileTargetField)) {
        issues.push(
          createIssue({
            message:
              'Image upload mobile target must reference a required, readonly, hidden string field.',
            path: `${fieldPath}.targetFields.mobile`,
            severity: 'error',
          }),
        );
      }
    }
  }

  if (field.hideInEdit && field.required && !field.readonly) {
    issues.push(
      createIssue({
        message: 'Required fields hidden in edit mode may be difficult to maintain.',
        path: `${fieldPath}.hideInEdit`,
        severity: 'warning',
      }),
    );
  }

  return issues;
};

export const validateTopicDraft = (draft: TopicDraft): TopicSchemaValidationResult => {
  const issues: TopicSchemaIssue[] = [...validateTopicMetadata(draft)];
  const fieldKeys = getFieldKeys(draft.fields);
  const knownFieldKeys = new Set(fieldKeys);
  const duplicateFieldKeys = new Set(
    fieldKeys.filter((fieldKey, index) => fieldKeys.indexOf(fieldKey) !== index),
  );
  const imageUploadFieldCount = draft.fields.filter((field) => field.type === 'imageUpload').length;

  draft.fields.forEach((field, fieldIndex) => {
    const trimmedKey = field.key?.trim();

    if (trimmedKey && duplicateFieldKeys.has(trimmedKey)) {
      issues.push(
        createIssue({
          message: 'Field keys must be unique.',
          path: `${getFieldPath(fieldIndex, field.key)}.key`,
          severity: 'error',
        }),
      );
    }

    issues.push(
      ...validateField({
        field,
        fieldIndex,
        fields: draft.fields,
        imageUploadFieldCount,
        knownFieldKeys,
      }),
    );
  });

  return {
    errors: issues.filter((issue) => issue.severity === 'error'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
  };
};

export const hasTopicSchemaErrors = (result: TopicSchemaValidationResult) =>
  result.errors.length > 0;
