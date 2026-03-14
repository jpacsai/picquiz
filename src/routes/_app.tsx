import { createFileRoute, redirect } from '@tanstack/react-router';

import { authStore } from '../auth/authStore';
import AppLayout from '../components/layout/AppLayout';

const RouteComponent = () => {
  return <AppLayout />;
};

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const snap = await authStore.onceReady();
    if (!snap.user) throw redirect({ to: '/login', search: { from: location.href } });
  },
  component: RouteComponent,
});
