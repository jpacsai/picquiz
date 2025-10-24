import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { topicOptions } from '../../../queries/topics';

const path = '/_app/admin/$topicId';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  console.log('topic', topic)
  return <div>Hello "/_app/admin/$topicId"!</div>
}

export const Route = createFileRoute('/_app/admin/$topicId')({
  loader: async ({ context: { queryClient }, params }) => {
    const topicId = params.topicId;
    const topic = await queryClient.ensureQueryData(topicOptions(topicId));

    return { topic, title: topic.label };
  },
  component: RouteComponent,
})

