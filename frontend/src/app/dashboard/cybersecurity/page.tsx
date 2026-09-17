"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Shield, ShieldAlert, FileKey, AlertTriangle, Fingerprint } from "lucide-react";

export default function CybersecurityGovernancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchAudit();
    }
  }, [status, router, session]);

  async function fetchAudit() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(/api/maturity/governance/audit?businessId=);
        if (res.success) {
          setAudit(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Cybersecurity Audit...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Cybersecurity & Data Governance
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
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Cybersecurity & Data Governance</h1>
            <p className="mt-1 text-slate-400">Real-time posture assessment, missing policies, and critical risk flags.</p>
          </div>
        </div>

        {!audit ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Posture Score</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{audit.governanceScore}/100</h3>
                  <div className={p-1.5 rounded-lg mb-1 }>
                    <Fingerprint className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Policies</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{audit.totalPolicies}</h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Overdue Reviews</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{audit.overdueReviews.length}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">High Risk (Unmitigated)</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{audit.highRiskWithoutMitigation.length}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Critical Vulnerabilities</h2>
                {audit.highRiskWithoutMitigation.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No unmitigated high-risk policies detected.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {audit.highRiskWithoutMitigation.map((p: any) => (
                      <Card key={p.id} className="p-4 bg-slate-900 border-rose-500/30 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{p.policyName}</h4>
                          <span className="text-xs uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded mt-1 inline-block">Risk: {p.riskLevel}</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Action Required
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Missing Compliance Domains</h2>
                {audit.missingDomains.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">All required governance domains have policies mapped.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {audit.missingDomains.map((domain: string) => (
                      <Card key={domain} className="p-4 bg-slate-900 border-amber-500/30 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileKey className="w-5 h-5 text-amber-400" />
                          <h4 className="font-semibold text-white">{domain} DOMAIN</h4>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                          Missing Policy
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
