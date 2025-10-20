import { createFileRoute } from '@tanstack/react-router'
import Admin from '../../components/pages/Admin'

const RouteComponent = () => {
  return <Admin />
}

export const Route = createFileRoute('/_app/admin')({
  component: RouteComponent,
})

