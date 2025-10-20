import { createFileRoute } from '@tanstack/react-router'
import QuizConfig from '../../../../components/pages/Quiz/QuizConfig'

const RouteComponent = () => {
  return <QuizConfig />
}

export const Route = createFileRoute('/_app/quiz/$theme/tsx/')({
  component: RouteComponent,
})

