import { createFileRoute } from '@tanstack/react-router';

import TopicSchemaBuilderPage from '@/components/pages/Admin/TopicSchemaBuilder/TopicSchemaBuilderPage';

const path = '/_app/schemas/new';

const RouteComponent = () => <TopicSchemaBuilderPage mode="create" />;

export const Route = createFileRoute(path)({
  component: RouteComponent,
  loader: async () => ({
    title: 'Uj topic schema',
  }),
});
