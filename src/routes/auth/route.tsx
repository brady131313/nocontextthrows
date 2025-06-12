import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { FireExtinguisher } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.authStatus === "authed") {
      throw redirect({ to: "/app/new" });
    } else if (context.authStatus === "admin-authed") {
      throw redirect({ to: "/app/submissions" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <FireExtinguisher className="size-4" />
          </div>
          No Context Throws
        </a>
        <Outlet />
      </div>
    </div>
  );
}
