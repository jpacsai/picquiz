import { createFileRoute, redirect } from '@tanstack/react-router'
import Landing from '../components/pages/Landing'
import { authStore } from '../auth/authStore'

const RouteComponent = () => {
  return <Landing />
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const snap = await authStore.onceReady()
    if (snap.user) throw redirect({ to: '/home' })
  },
  component: RouteComponent,
})

