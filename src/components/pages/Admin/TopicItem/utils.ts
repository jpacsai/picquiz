import { createElement, Fragment, type ReactNode } from 'react';

import BooleanValue from '@/components/ui/BooleanValue';
import type { TopicField, TopicItem } from '@/types/topics';
import { getBooleanValueLabel } from '@/utils/booleanValue';

type DisplayValueOptions = {
  includeBooleanFieldLabel?: boolean;
  showBooleanLabel?: boolean;
};

export type DisplayValue = {
  node: ReactNode;
  text: string;
};

const getFallbackTitle = (item: TopicItem) => {
  const fallbackValue = [item.title, item.artist]
    .map((value) => getTopicItemDisplayValue({ key: '', label: '', type: 'string' }, value))
    .find((value): value is DisplayValue => value !== null);

  return fallbackValue?.text ?? item.id;
};

export const getTopicItemDisplayValue = (
  field: TopicField,
  value: unknown,
  options: DisplayValueOptions = {},
): DisplayValue | null => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length
      ? {
          node: trimmedValue,
          text: trimmedValue,
        }
      : null;
  }

  if (typeof value === 'number') {
    const text = String(value);

    return {
      node: text,
      text,
    };
  }

  if (typeof value === 'boolean') {
    const booleanLabel = getBooleanValueLabel(value);
    const includeBooleanFieldLabel = options.includeBooleanFieldLabel ?? false;
    const text = includeBooleanFieldLabel ? `${field.label}: ${booleanLabel}` : booleanLabel;
    const ariaLabel = `${field.label}: ${booleanLabel}`;

    return {
      node: includeBooleanFieldLabel
        ? createElement(
            Fragment,
            null,
            `${field.label}: `,
            createElement(BooleanValue, {
              ariaLabel,
              value,
            }),
          )
        : createElement(BooleanValue, {
            ariaLabel,
            showLabel: options.showBooleanLabel,
            value,
          }),
      text,
    };
  }

  return null;
};

export const getTopicItemValuesByDisplay = (
  fields: ReadonlyArray<TopicField>,
  item: TopicItem,
  display: NonNullable<TopicField['display']>,
) => {
  return fields
    .filter((field) => field.display === display)
    .map((field) =>
      getTopicItemDisplayValue(field, item[field.key], { includeBooleanFieldLabel: true }),
    )
    .filter((value): value is DisplayValue => value !== null);
};

export const joinDisplayValueTexts = (values: DisplayValue[]) =>
  values.map((value) => value.text).join(' - ');

export const joinDisplayValueNodes = (values: DisplayValue[]) =>
  values.map((value, index) =>
    createElement(
      Fragment,
      { key: `${value.text}-${index}` },
      index > 0 ? ' - ' : null,
      value.node,
    ),
  );

export const getTopicItemTitle = (fields: ReadonlyArray<TopicField>, item: TopicItem) => {
  const titleValues = getTopicItemValuesByDisplay(fields, item, 'title');

  return titleValues[0]?.text ?? getFallbackTitle(item);
};

const getResolvedImageUrl = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const getImageUploadField = (fields: ReadonlyArray<TopicField>) =>
  fields.find((field): field is Extract<TopicField, { type: 'imageUpload' }> => field.type === 'imageUpload');

export const getTopicItemImageUrls = (fields: ReadonlyArray<TopicField>, item: TopicItem) => {
  const imageUploadField = getImageUploadField(fields);

  if (!imageUploadField) {
    return {
      desktopImageUrl: undefined,
      mobileImageUrl: undefined,
    };
  }

  return {
    desktopImageUrl: getResolvedImageUrl(item[imageUploadField.targetFields.desktop]),
    mobileImageUrl: getResolvedImageUrl(item[imageUploadField.targetFields.mobile]),
  };
};

export const getTopicItemHiddenFieldKeys = (fields: ReadonlyArray<TopicField>) => {
  const imageUploadField = getImageUploadField(fields);

  if (!imageUploadField) {
    return new Set<string>();
  }

  return new Set(
    [
      imageUploadField.targetFields.desktop,
      imageUploadField.targetFields.mobile,
      imageUploadField.targetFields.desktopPath,
      imageUploadField.targetFields.mobilePath,
    ].filter((fieldKey): fieldKey is string => Boolean(fieldKey)),
  );
};

export const getTopicItemDetailRows = (fields: ReadonlyArray<TopicField>, item: TopicItem) => {
  const hiddenFieldKeys = getTopicItemHiddenFieldKeys(fields);

  return fields
    .filter((field) => field.type !== 'imageUpload' && !hiddenFieldKeys.has(field.key))
    .map((field) => {
      const displayValue = getTopicItemDisplayValue(field, item[field.key], {
        showBooleanLabel: true,
      });

      return displayValue
        ? {
            key: field.key,
            label: field.label,
            value: displayValue.node,
            valueText: displayValue.text,
          }
        : null;
    })
    .filter(
      (
        row,
      ): row is {
        key: string;
        label: string;
        value: ReactNode;
        valueText: string;
      } => row !== null,
    );
};
