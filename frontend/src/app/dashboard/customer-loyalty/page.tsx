"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Heart, TrendingUp, TrendingDown, Users, AlertCircle } from "lucide-react";

export default function CustomerLoyaltyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchLoyalty();
    }
  }, [status, router, session]);

  async function fetchLoyalty() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(/api/customer/loyalty?businessId=);
        if (res.success) {
          setLoyalty(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Loyalty Metrics...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Customer Loyalty & Personalization
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
          <Heart className="h-8 w-8 text-rose-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Customer Loyalty & Personalization</h1>
            <p className="mt-1 text-slate-400">Track segment readiness, retention risks, and upsell opportunities.</p>
          </div>
        </div>

        {!loyalty ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Loyalty Score</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{loyalty.loyaltyScore}/100</h3>
                  <div className={p-1.5 rounded-lg mb-1 }>
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Mapped Reach</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{loyalty.totalReach.toLocaleString()}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Upsell Signals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400">{loyalty.upsellOppsCount}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Churn Risks</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{loyalty.churnRisksCount}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Customer Segments</h2>
                {loyalty.segments.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No segments mapped yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {loyalty.segments.map((seg: any) => (
                      <Card key={seg.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{seg.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">Size: {seg.size?.toLocaleString() || 'Unknown'}</p>
                        </div>
                        <span className={	ext-xs px-2 py-1 rounded-full font-medium }>
                          {seg.readiness} Readiness
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Loyalty Intelligence Signals</h2>
                {loyalty.signals.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active customer intelligence signals detected.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {loyalty.signals.map((sig: any) => (
                      <Card key={sig.id} className="p-4 bg-slate-900 border-slate-800 flex gap-4 items-start">
                        <div className={p-2 rounded-lg mt-1 }>
                          {sig.type === 'RISK' || sig.type === 'DETERIORATION' ? <AlertCircle className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-200">{sig.title}</h4>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              Impact: {sig.impact}
                            </span>
                            <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              Urgency: {sig.urgency}
                            </span>
                          </div>
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
