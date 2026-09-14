"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserContextType {
  activeRole: string | null;
  setActiveRole: (role: string) => void;
  availableRoles: string[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user && (session.user as any).roles) {
      const roles = (session.user as any).roles as string[];
      setAvailableRoles(roles);
      if (roles.length > 0 && !activeRole) {
        setActiveRole(roles[0]); // Default to first role
      }
    }
  }, [session, activeRole]);

  return (
    <UserContext.Provider value={{ activeRole, setActiveRole, availableRoles }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
