import { createFileRoute, redirect } from '@tanstack/react-router';
import Login from '../components/pages/Login';
import { authStore } from '../auth/authStore';

const RouteComponent = () => {
  return <Login />;
};

const parseSearch = (s: Record<string, unknown>) =>
  ({ from: typeof s.from === 'string' ? s.from : undefined }) as const;

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ search }) => {
    const snap = await authStore.onceReady();
    if (snap.user) {
      throw redirect({ to: search.from ?? '/_app' });
    }
  },
  validateSearch: parseSearch,
  component: RouteComponent,
});
