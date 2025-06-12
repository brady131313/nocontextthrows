import { isAuthenticated, type AuthStatus } from "@/lib/auth-provider";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

type RouterContext = {
  authStatus: AuthStatus;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster />
    </>
  ),
  beforeLoad: async () => {
    const authStatus = await isAuthenticated();
    return {
      authStatus,
    };
  },
});
