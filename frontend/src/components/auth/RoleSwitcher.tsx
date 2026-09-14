"use client";

import { useUser } from "@/lib/UserContext";

export function RoleSwitcher() {
  const { activeRole, setActiveRole, availableRoles } = useUser();

  if (availableRoles.length <= 1) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-400">Viewing as:</span>
      <select
        value={activeRole || ""}
        onChange={(e) => setActiveRole(e.target.value)}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
      >
        {availableRoles.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
