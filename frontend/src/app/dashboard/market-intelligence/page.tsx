"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Globe, Crosshair, BarChart, ShieldAlert } from "lucide-react";

export default function MarketIntelligencePage() {
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
        const res = await apiGet<any>(`/api/market/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Aggregating Market Insights...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Market Intelligence
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
          <Globe className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Market Intelligence</h1>
            <p className="mt-1 text-slate-400">Competitor landscape, expansion plans, and market positioning.</p>
          </div>
        </div>

        {!metrics ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
            <p className="mt-2 text-sm text-slate-400">Connecting to your live market intelligence streams.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Positioning Score</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{metrics.marketPositionScore}%</h3>
                  </div>
                  <div className={`p-2 rounded-lg ${metrics.marketPositionScore > 60 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <BarChart className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Calculated competitive advantage</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Tracked Competitors</p>
                    <h3 className="text-3xl font-bold text-blue-400 mt-1">{metrics.activeCompetitors.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Crosshair className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Known entities in target market</p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Expansion Plans</p>
                    <h3 className="text-3xl font-bold text-purple-400 mt-1">{metrics.expansionPlans.length}</h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Active market entry initiatives</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Competitive Intelligence</h2>
                {metrics.insights.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <ShieldAlert className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No competitive intelligence recorded.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.insights.map((insight: any) => (
                      <Card key={insight.id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{insight.competitor}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 uppercase">
                            {insight.domain}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{insight.insight}</p>
                        <div className="mt-2 text-xs text-slate-500 text-right">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Expansion Trajectory</h2>
                {metrics.expansionPlans.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <Globe className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No active commercial expansion plans.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.expansionPlans.map((plan: any) => (
                      <Card key={plan.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-slate-200">{plan.market}</h4>
                          <p className="text-xs text-slate-500 mt-1">Capital Needed: ${plan.investment?.toLocaleString() || 'TBD'}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                          {plan.status}
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
