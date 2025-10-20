import { createFileRoute } from '@tanstack/react-router'
import QuizThemeSelector from '../../../components/pages/Quiz/QuizThemeSelector'

const RouteComponent = () => {
  return <QuizThemeSelector />
}

export const Route = createFileRoute('/_app/quiz/')({
  component: RouteComponent,
})

