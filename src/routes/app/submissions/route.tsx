import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/submissions")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.authStatus !== "admin-authed") {
      throw redirect({ to: "/app/new" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
