import { isAuthenticated } from "@/lib/auth-provider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  beforeLoad: async () => {
    const isAuthed = await isAuthenticated();
    if (isAuthed) {
      throw redirect({ to: "/app/submissions/new" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
