import {
  getRedirectResult,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

type AuthContext = {
  user: User | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleRedirectAuth = async () => {
      const result = await getRedirectResult(auth);
      const user = result?.user;

      user?.getIdTokenResult().then((u) => {
        setIsAdmin(u.claims["admin"] === true);
      });
    };

    handleRedirectAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      user?.getIdTokenResult().then((u) => {
        setIsAdmin(u.claims["admin"] === true);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export type AuthStatus = "unauthed" | "admin-authed" | "authed";

export const isAuthenticated = async (): Promise<AuthStatus> => {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();

      if (user) {
        user.getIdTokenResult().then((u) => {
          if (u.claims["admin"] === true) {
            resolve("admin-authed");
          } else {
            resolve("authed");
          }
        });
      } else {
        resolve("unauthed");
      }
    });
  });
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
