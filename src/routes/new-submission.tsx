import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/new-submission')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/new-submission"!</div>
}
