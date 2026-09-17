"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Brain, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";

export default function DecisionIntelligencePage() {
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
        const res = await apiGet<any>(`/api/decision-intelligence/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Decision Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Decision Intelligence
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
          <Brain className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Decision Intelligence</h1>
            <p className="mt-1 text-slate-400">AI-assisted recommendations and execution tracking.</p>
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
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Decisions</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.totalDecisions}</h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">AI Adoption Rate</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{metrics.overview.aiAdoptionRate}%</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Executed</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400">{metrics.overview.executedDecisions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Action</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{metrics.overview.pendingDecisions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Active AI Recommendations</h2>
                {metrics.activeRecommendations.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active recommendations.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.activeRecommendations.map((rec: any) => (
                      <Card key={rec.id} className="p-4 bg-slate-900 border-purple-500/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">{rec.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 uppercase">Domain: {rec.domain}</p>
                          </div>
                          <span className="text-[10px] uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                            {Math.round(rec.confidence * 100)}% Match
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Decision History</h2>
                {metrics.recentDecisions.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No decisions recorded.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.recentDecisions.map((dec: any) => (
                      <Card key={dec.id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-slate-200">{dec.title}</h4>
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded-full`}>
                            {dec.status}
                          </span>
                        </div>
                        {dec.aiAssisted && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400">
                            <Brain className="w-3 h-3" /> AI Assisted
                          </div>
                        )}
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
