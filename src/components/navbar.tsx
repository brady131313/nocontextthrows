import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { signOut } from "@/lib/firebase";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

export function Navbar() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <nav className="w-full border-b bg-background px-4 py-2 flex items-center">
      {/* Desktop/Tablet Menu */}
      <div className="hidden sm:flex flex-1 items-center gap-4">
        <Link to="/app/new">
          {({ isActive }) => (
            <Button variant={isActive ? "outline" : "link"}>
              New Submission
            </Button>
          )}
        </Link>
        {isAdmin && (
          <Link to="/app/submissions">
            {({ isActive }) => (
              <Button variant={isActive ? "outline" : "link"}>
                Submissions
              </Button>
            )}
          </Link>
        )}
      </div>

      <div className="flex-1 flex sm:hidden">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="p-0 bg-transparent hover:bg-transparent data-[state=open]:bg-muted">
                <Menu className="h-6 w-6" />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col min-w-[150px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/app/new"
                        activeProps={{ className: "font-bold" }}
                      >
                        New Submission
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {isAdmin && (
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/app/submissions"
                          activeProps={{ className: "font-bold" }}
                        >
                          Submissions
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex-1 flex justify-end">
        <Button variant="outline" onClick={handleSignOut}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
