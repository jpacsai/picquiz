import type { ReactNode } from 'react';

import BooleanValue from '@/components/ui/BooleanValue';
import type { TopicFieldDraft } from '@/types/topicSchema';

import { getFieldDependencyKeys } from '../context/fieldActions';

export type PreviewCell = {
  align?: 'center' | 'left' | 'right';
  text: string;
  value: ReactNode;
};

const getFieldSummaryLabel = (label?: string, key?: string) => label || key || 'Nev nelkuli field';

const hasFieldKey = (
  entry: readonly [string | undefined, string],
): entry is readonly [string, string] => Boolean(entry[0]);

const getDependencySummaryLabel = ({
  dependencyKey,
  fieldLabelsByKey,
}: {
  dependencyKey: string;
  fieldLabelsByKey: Map<string, string>;
}) => fieldLabelsByKey.get(dependencyKey) || dependencyKey;

export const getSchemaPreview = (fields: TopicFieldDraft[]) => {
  const hiddenSystemFields = fields.filter((field) => field.hideInEdit);
  const fieldLabelsByKey = new Map(
    fields
      .map((field) => [field.key?.trim(), getFieldSummaryLabel(field.label, field.key)] as const)
      .filter(hasFieldKey),
  );

  const rows: PreviewCell[][] = fields
    .filter((field) => !field.hideInEdit)
    .map((field) => {
      const fieldLabel = getFieldSummaryLabel(field.label, field.key);
      const dependencySummary =
        getFieldDependencyKeys(field)
          .map((dependencyKey) =>
            getDependencySummaryLabel({
              dependencyKey,
              fieldLabelsByKey,
            }),
          )
          .join(', ') || '-';
      const quizPrompt = field.quiz?.enabled ? field.quiz.prompt || '-' : '-';

      return [
        {
          text: fieldLabel,
          value: fieldLabel,
        },
        {
          text: field.key || '-',
          value: field.key || '-',
        },
        {
          text: field.type || '-',
          value: field.type || '-',
        },
        {
          align: 'center',
          text: field.required ? 'Igaz' : 'Hamis',
          value: (
            <BooleanValue
              ariaLabel={`${fieldLabel} kötelező: ${field.required ? 'Igaz' : 'Hamis'}`}
              value={field.required === true}
            />
          ),
        },
        {
          text: dependencySummary,
          value: dependencySummary,
        },
        {
          text: quizPrompt,
          value: quizPrompt,
        },
      ];
    });

  return {
    hiddenSystemFields,
    quizFieldCount: rows.filter(([, , , , , prompt]) => prompt.text !== '-').length,
    rows,
  };
};
