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
    <main className="w-full">
      <Navbar />
      <Outlet />
    </main>
  );
}
