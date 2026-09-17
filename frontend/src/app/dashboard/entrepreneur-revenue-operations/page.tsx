"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { CircleDollarSign, TrendingUp, Briefcase, Activity, CalendarClock } from "lucide-react";

export default function RevenueOperationsPage() {
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
        const res = await apiGet<any>(/api/revenue-operations/metrics?businessId=);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Revenue Operations...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Revenue Operations
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
          <CircleDollarSign className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Operations</h1>
            <p className="mt-1 text-slate-400">Sales pipeline, revenue tracking, and MRR forecasting.</p>
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
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Revenue (YTD)</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white"></h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">MRR Approximation</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400"></h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pipeline Value</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400"></h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Deals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{metrics.overview.activeDeals}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Commercial Pipeline</h2>
                {metrics.pipeline.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active commercial deals in pipeline.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.pipeline.map((deal: any) => (
                      <Card key={deal.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{deal.title}</h4>
                          <span className={	ext-[10px] uppercase mt-1 inline-block px-2 py-0.5 rounded-full }>
                            {deal.status}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="font-bold text-emerald-400"></p>
                          <span className="text-xs text-slate-500 mt-1">Match: {Math.round((deal.likelihood || 0) * 100)}%</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Recent Revenue Activity</h2>
                {metrics.revenueHistory.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No recorded revenue transactions.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.revenueHistory.map((rev: any) => (
                      <Card key={rev.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-slate-200">{rev.description || 'Revenue Inflow'}</h4>
                          <p className="text-xs text-slate-500 mt-1">{new Date(rev.date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-emerald-400">
                          +{rev.amount.toLocaleString()} {rev.currency}
                        </span>
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
