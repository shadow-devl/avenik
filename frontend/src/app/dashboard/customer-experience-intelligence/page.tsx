"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { HeartHandshake, Smile, AlertTriangle, Zap, Users } from "lucide-react";

export default function CustomerExperiencePage() {
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
        const res = await apiGet<any>(`/api/customer-experience/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Customer Experience...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Customer Experience Intelligence
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
          <HeartHandshake className="h-8 w-8 text-pink-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Customer Experience Intelligence</h1>
            <p className="mt-1 text-slate-400">NPS, sentiment analysis, and experiential signals.</p>
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
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Average NPS</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.averageNps}</h3>
                  <div className={`p-1.5 rounded-lg mb-1`}>
                    <Smile className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tracked Segments</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.trackedSegments}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active CX Risks</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{metrics.overview.activeRisks}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Opportunities</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400">{metrics.overview.activeOpportunities}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Real-Time CX Signals</h2>
                {metrics.cxSignals.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active customer experience signals detected.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.cxSignals.map((sig: any) => (
                      <Card key={sig.id} className={`p-4 bg-slate-900 border`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{sig.title}</h4>
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded`}>
                            {sig.impact} Impact
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={${sig.type === 'RISK' ? 'text-rose-400' : 'text-emerald-400'} uppercase font-medium}>
                            {sig.type}
                          </span>
                          <span className="text-slate-500">Confidence: {Math.round(sig.confidence * 100)}%</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Segment Satisfaction</h2>
                {metrics.segmentSentiment.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No segment data mapped yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.segmentSentiment.map((seg: any) => (
                      <Card key={seg.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-slate-200">{seg.name}</h4>
                          <span className="text-xs text-slate-500 mt-1 block">Sat: {seg.satisfaction}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">NPS Score</p>
                          <span className={`ont-bold`}>
                            {seg.nps != null ? seg.nps : 'N/A'}
                          </span>
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
