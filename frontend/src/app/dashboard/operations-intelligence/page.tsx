"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Cog, Users, AlertOctagon, Activity, Hammer } from "lucide-react";

export default function OperationsIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchMetrics();
    }
  }, [status, router, session]);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(`/api/operations-intelligence/metrics?businessId=${bid}`);
        if (res.success) {
          setMetrics(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Operations Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Operations Intelligence
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
        <div className="flex items-center gap-3 mb-8">
          <Cog className="h-8 w-8 text-orange-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Operations Intelligence</h1>
            <p className="mt-1 text-slate-400">Process efficiency, capacity utilization, and execution bottlenecks.</p>
          </div>
        </div>

        {!metrics ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Capacity Utilization</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.utilizationRate}%</h3>
                  <div className={`p-1.5 rounded-lg mb-1`}>
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Tasks</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.pendingOperations}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Hammer className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Blocked Ops</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{metrics.overview.blockedOperations}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Alerts</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-orange-400">{metrics.overview.operationalAlerts}</h3>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Operational Bottlenecks</h2>
                {metrics.bottlenecks.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No blocked operations detected.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.bottlenecks.map((btn: any) => (
                      <Card key={btn.id} className="p-4 bg-slate-900 border-rose-500/30 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">{btn.title}</h4>
                          <span className="text-[10px] uppercase mt-1 inline-block px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/30">
                            BLOCKED
                          </span>
                        </div>
                        <span className={`ext-[10px] uppercase font-bold`}>
                          {btn.priority} PRIORITY
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Operations Signals</h2>
                {metrics.activeAlerts.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No operational alerts.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.activeAlerts.map((alt: any) => (
                      <Card key={alt.id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-200">{alt.title}</h4>
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded`}>
                            {alt.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-slate-500">
                          <span>Impact: {alt.impact}</span>
                          <span>Urgency: {alt.urgency}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
