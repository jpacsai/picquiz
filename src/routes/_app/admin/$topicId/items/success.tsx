import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminSuccessPage from '@/components/pages/Admin/TopicItemFormPage/AdminSuccessPage';

const path = '/_app/admin/$topicId/items/success';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <AdminSuccessPage topicId={topic.id} topicLabel={topic.label} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return {
      topic,
      title: 'Sikeres mentés',
    };
  },
  component: RouteComponent,
});
