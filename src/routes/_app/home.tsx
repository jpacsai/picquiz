import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '../../components/pages/Dashboard'

const RouteComponent = () => {
  return <Dashboard />
}

export const Route = createFileRoute('/_app/home')({
  component: RouteComponent,
})


