"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { ShieldCheck, UserCheck, AlertTriangle, Fingerprint, ShieldAlert } from "lucide-react";

export default function TrustedIntelligencePage() {
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
        const res = await apiGet<any>(/api/trusted-intelligence/metrics?businessId=);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Trusted Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Trust & Privacy
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
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Avenik Trusted Intelligence</h1>
            <p className="mt-1 text-slate-400">Identity verification, fraud prevention, and network trust profile.</p>
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
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Network Trust Score</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.trustScore}/100</h3>
                  <div className={p-1.5 rounded-lg mb-1 }>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Verification Level</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-xl font-bold text-indigo-400">{metrics.overview.verificationLevel.replace('_', ' ')}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-indigo-500/10 text-indigo-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Claims</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.pendingVerifications}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Fraud Flags</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{metrics.overview.activeFraudCases}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Verification Claims</h2>
                {metrics.verificationClaims.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No identity or revenue claims verified.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.verificationClaims.map((claim: any) => (
                      <Card key={claim.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <Fingerprint className="w-5 h-5 text-slate-500" />
                          <div>
                            <h4 className="font-medium text-white">{claim.type} Verification</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Updated: {new Date(claim.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={	ext-[10px] uppercase px-2 py-0.5 rounded-full }>
                          {claim.status}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Fraud & Security Incidents</h2>
                {metrics.fraudHistory.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center flex flex-col items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
                    <p className="text-sm text-slate-400">No security incidents or fraud cases reported.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.fraudHistory.map((fraud: any) => (
                      <Card key={fraud.id} className="p-4 bg-slate-900 border-rose-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-rose-200">{fraud.type.replace(/_/g, ' ')}</h4>
                          <span className={	ext-[10px] uppercase px-2 py-0.5 rounded border }>
                            {fraud.severity}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-slate-400">Status: {fraud.status}</span>
                          <span className="text-slate-500">{new Date(fraud.createdAt).toLocaleDateString()}</span>
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
