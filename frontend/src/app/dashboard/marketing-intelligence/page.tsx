"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Megaphone, Users, Globe, Crosshair, TrendingUp } from "lucide-react";

export default function MarketingIntelligencePage() {
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
        const res = await apiGet<any>(`/api/marketing-intelligence/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Marketing Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Marketing Intelligence
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
          <Megaphone className="h-8 w-8 text-rose-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Marketing Intelligence</h1>
            <p className="mt-1 text-slate-400">Commercial expansion pipelines and customer segment targeting.</p>
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
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Expansion Health</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.expansionHealth}%</h3>
                  <div className={`p-1.5 rounded-lg mb-1`}>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Target Audience</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.totalTargetAudience.toLocaleString()}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Market Penetration</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{metrics.overview.marketPenetration}%</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Crosshair className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Campaigns</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{metrics.overview.activeCampaigns}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <Globe className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Commercial Expansion Plans</h2>
                {metrics.expansionPlans.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active commercial expansion plans.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.expansionPlans.map((plan: any) => (
                      <Card key={plan.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{plan.market}</h4>
                          <p className="text-xs text-slate-500 mt-1">Segments Targeted: {plan.segmentsCount}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded-full`}>
                            {plan.status}
                          </span>
                          {plan.viability && (
                            <span className="text-xs text-slate-400">Viability: {Math.round(plan.viability * 100)}%</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Top Customer Segments</h2>
                {metrics.topSegments.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No segments identified.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.topSegments.map((seg: any) => (
                      <Card key={seg.id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-slate-200">{seg.name}</h4>
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded border`}>
                            {seg.readiness} Readiness
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">Audience Size: {seg.size?.toLocaleString() || 'Unknown'}</p>
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
