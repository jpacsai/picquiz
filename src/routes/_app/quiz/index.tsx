import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>quiz</div>;
};

export const Route = createFileRoute('/_app/quiz/')({
  component: RouteComponent,
});
