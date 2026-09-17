"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Landmark, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

export default function SchemeSuccessPage() {
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
        const res = await apiGet<any>(/api/scheme-success/metrics?businessId=);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Scheme Applications...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Scheme Application Success
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
          <Landmark className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Scheme Application Success</h1>
            <p className="mt-1 text-slate-400">Track and optimize your government support applications.</p>
          </div>
        </div>

        {!metrics ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
            <p className="mt-2 text-sm text-slate-400">Connecting to your application records.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Success Rate</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.successRate}%</h3>
                  <div className={p-1.5 rounded-lg mb-1 }>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Applied</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.totalApplied}</h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Approved / Won</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400">{metrics.totalWon}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Review</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{metrics.pendingApplications}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Application History</h2>
              {metrics.recentApplications.length === 0 ? (
                <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                  <p className="text-sm text-slate-400">No applications tracked yet. Start discovering schemes in Opportunity Discovery.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {metrics.recentApplications.map((app: any) => (
                    <Card key={app.id} className="p-4 bg-slate-900 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-white">{app.schemeName}</h4>
                        <p className="text-sm text-slate-400 mt-1">{app.provider || "Government Body"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Updated: {new Date(app.lastUpdated).toLocaleDateString()}</p>
                          {app.confidence && (
                            <p className="text-xs text-slate-400 mt-1">Match: {Math.round(app.confidence * 100)}%</p>
                          )}
                        </div>
                        <span className={	ext-xs px-3 py-1.5 rounded-full font-medium }>
                          {app.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
