import { createContext } from 'react';

import type { TopicSchemaBuilderActionsValue, TopicSchemaBuilderStateValue } from './types';

export const TopicSchemaBuilderStateContext = createContext<TopicSchemaBuilderStateValue | null>(
  null,
);
export const TopicSchemaBuilderActionsContext =
  createContext<TopicSchemaBuilderActionsValue | null>(null);
