import { useContext } from 'react';

import {
  TopicSchemaBuilderActionsContext,
  TopicSchemaBuilderStateContext,
} from './topicSchemaBuilderContexts';

export const useTopicSchemaBuilderState = () => {
  const context = useContext(TopicSchemaBuilderStateContext);

  if (!context) {
    throw new Error('useTopicSchemaBuilderState must be used within TopicSchemaBuilderProvider.');
  }

  return context;
};

export const useTopicSchemaBuilderActions = () => {
  const context = useContext(TopicSchemaBuilderActionsContext);

  if (!context) {
    throw new Error('useTopicSchemaBuilderActions must be used within TopicSchemaBuilderProvider.');
  }

  return context;
};
