"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';

export default function CommandCenterPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [warnings, setWarnings] = useState<any[]>([]);
  const [nbas, setNbas] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchCommandCenterData();
    }
  }, [status, router]);

  async function fetchCommandCenterData() {
    try {
      setLoading(true);
      // Determine business context first
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const [warnRes, nbaRes, actRes, healthRes] = await Promise.all([
          apiGet<any>('/api/warnings', { headers: { 'x-business-id': bid } }),
          apiPost<any>('/api/nba/generate', { businessId: bid }),
          apiGet<any>('/api/actions', { headers: { 'x-business-id': bid } }),
          apiPost<any>('/api/health-engine/calculate', { businessId: bid }),
        ]);
        
        if (warnRes.success) setWarnings(warnRes.data);
        if (nbaRes.success) setNbas(nbaRes.data);
        if (actRes.success) setActions(actRes.data);
        if (healthRes.success) setHealthScore(healthRes.data.score);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Command Center...</div>;
  if (!healthScore && actions.length === 0 && warnings.length === 0 && nbas.length === 0) {
    return <div className="p-8 text-center text-slate-400">You must create a business profile to view the Command Center.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Command Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Command Center</h1>
        <p className="mt-1 text-slate-400">Unified intelligence and orchestration for your business.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-blue-500/20 bg-slate-900/50">
            <h2 className="text-lg font-medium text-white mb-2">Business Health</h2>
            <p className="text-3xl font-bold text-blue-400">{healthScore !== null ? healthScore : '--'}</p>
          </Card>
          
          <Card className="p-6 border-red-500/20 bg-slate-900/50">
            <h2 className="text-lg font-medium text-white mb-2">Active Warnings</h2>
            <p className="text-3xl font-bold text-red-400">{warnings.length}</p>
          </Card>
          
          <Card className="p-6 border-amber-500/20 bg-slate-900/50">
            <h2 className="text-lg font-medium text-white mb-2">Recommendations</h2>
            <p className="text-3xl font-bold text-amber-400">{nbas.length}</p>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">System Warnings</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {warnings.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No active warnings.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {warnings.map(w => (
                    <div key={w.id} className="p-5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-red-400">{w.indicator}</h4>
                        <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-full">{w.severity}</span>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">{w.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Pending Actions</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {actions.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No pending actions.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {actions.map(a => (
                    <div key={a.id} className="p-5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white">{a.title}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">{a.status}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{a.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card className="p-6 text-center border-slate-800 bg-slate-900/50">
            <h3 className="text-lg font-medium text-slate-300 mb-2">Unavailable Domains</h3>
            <p className="text-sm text-slate-500">Risk, Strategy, and specific Funding integrations are currently disconnected or unavailable in this environment.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
