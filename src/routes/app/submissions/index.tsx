import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/submissions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/submissions/"!</div>
}
