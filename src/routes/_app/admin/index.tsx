import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminPage from '../../../components/pages/Admin/AdminPage';
import { topicsOptions } from '../../../queries/topics';

const path = '/_app/admin/';

const parseSearch = (search: Record<string, unknown>) => {
  const schemaDialog = search.schemaDialog === 'new' ? 'new' : undefined;
  const schemaMode =
    search.schemaMode === 'create' || search.schemaMode === 'duplicate'
      ? search.schemaMode
      : undefined;
  const sourceTopicId = typeof search.sourceTopicId === 'string' ? search.sourceTopicId : undefined;

  return {
    schemaDialog,
    schemaMode,
    sourceTopicId,
  } as const;
};

const RouteComponent = () => {
  const { topics } = useLoaderData({ from: path });
  const { schemaDialog, schemaMode, sourceTopicId } = Route.useSearch();

  return (
    <AdminPage
      defaultSchemaCreationMode={schemaMode ?? 'create'}
      duplicateSourceTopicId={sourceTopicId}
      isCreateSchemaDialogOpen={schemaDialog === 'new'}
      topics={topics}
    />
  );
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient } }) => {
    const topics = await queryClient.ensureQueryData(topicsOptions());

    return { topics, title: 'Admin' };
  },
  component: RouteComponent,
  validateSearch: parseSearch,
});
