import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async ({ context }) => {
    if (context.authStatus === "admin-authed") {
      throw redirect({ to: "/app/submissions" });
    } else if (context.authStatus === "authed") {
      throw redirect({ to: "/app/new" });
    } else {
      throw redirect({ to: "/auth/login" });
    }
  },
});

function Index() {
  return null;
}
