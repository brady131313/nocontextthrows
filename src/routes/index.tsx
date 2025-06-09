import { isAuthenticated } from "@/lib/auth-provider";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async () => {
    const isAuthed = await isAuthenticated();
    if (isAuthed) {
      throw redirect({ to: "/app/new" });
    } else {
      throw redirect({ to: "/auth/login" });
    }
  },
});

function Index() {
  return null;
}
