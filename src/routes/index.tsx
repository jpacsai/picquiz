import { createFileRoute, redirect } from '@tanstack/react-router';

import { authStore } from '../auth/authStore';
import Landing from '../components/pages/Landing';

const RouteComponent = () => {
  return <Landing />;
};

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const snap = await authStore.onceReady();
    if (snap.user) throw redirect({ to: '/home' });
  },
  component: RouteComponent,
});
