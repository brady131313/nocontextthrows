import { Navbar } from "@/components/navbar";
import { isAuthenticated } from "@/lib/auth-provider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
  },
});

function RouteComponent() {
  return (
    <main>
      <Navbar />
      <div className="bg-muted flex min-h-svh flex-col items-center gap-6 p-2 sm:p-6 md:p-10">
        <Outlet />
      </div>
    </main>
  );
}
