"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateBusiness = async () => {
    try {
      setLoading(true);
      await apiPost("/api/business", { legalName, displayName, countryCode: "IN" });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Settings
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="mt-1 text-slate-400">Manage your profile, roles, and connected businesses.</p>

        <div className="mt-8 space-y-8">
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-white">Create Business Profile</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-300">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. My Startup" 
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Legal Name</label>
                <input 
                  type="text" 
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. My Startup Pvt Ltd" 
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCreateBusiness} disabled={loading || !displayName}>
                {loading ? "Saving..." : "Create Profile"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
