"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, Target, Zap, Clock, ShieldCheck, ShieldAlert, AlertOctagon, BrainCircuit, Shield } from "lucide-react";

export default function FraudTrustPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [threatMatrix, setThreatMatrix] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
        setBusinessId(bid);
        const res = await apiGet<any>(`/api/generic-intelligence/metrics?businessId=${bid}&domain=fraud-trust`);
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

  async function runSecurityScan() {
    if (!businessId) return;
    setIsScanning(true);
    try {
      const res = await apiPost<any>('/api/trust/threat-matrix', { businessId });
      if (res.success) {
        setThreatMatrix(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  }

  const getThreatColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Threat Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-medium text-rose-400 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Risk & Threat Intelligence
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-rose-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Risk & Fraud Matrix</h1>
              <p className="mt-1 text-slate-400">Continuous AI scanning of operational, fraud, and cyber threats.</p>
            </div>
          </div>
          
          <Button 
            onClick={runSecurityScan}
            disabled={isScanning}
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
          >
            {isScanning ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Scanning Perimeters...</span>
            ) : (
              <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Run Deep Threat Scan</span>
            )}
          </Button>
        </div>

        {threatMatrix && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-400" /> Threat Matrix Results
            </h2>
            <Card className="p-6 bg-slate-900 border-slate-800 mb-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950">
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
                  threatMatrix.overallThreatLevel === 'CRITICAL' ? 'border-rose-500' :
                  threatMatrix.overallThreatLevel === 'HIGH' ? 'border-orange-500' :
                  threatMatrix.overallThreatLevel === 'MEDIUM' ? 'border-amber-500' :
                  'border-emerald-500'
                } opacity-50`} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{threatMatrix.threatScore}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Score</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">Posture:</h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getThreatColor(threatMatrix.overallThreatLevel)}`}>
                    {threatMatrix.overallThreatLevel} RISK
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{threatMatrix.summary}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" /> Active Threats Detected
                </h3>
                {threatMatrix.activeThreats?.length === 0 ? (
                   <Card className="p-6 bg-slate-900 border-emerald-500/20 text-center">
                    <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-300">All perimeters secure. No active threats detected.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {threatMatrix.activeThreats?.map((threat: any, i: number) => (
                      <Card key={i} className="p-4 bg-slate-900 border-slate-800 flex gap-4">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                           threat.severity === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' :
                           threat.severity === 'HIGH' ? 'bg-orange-500' :
                           threat.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{threat.name}</h4>
                            <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {threat.category}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{threat.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" /> AI Mitigation Plan
                </h3>
                <div className="space-y-4">
                  {threatMatrix.mitigationPlan?.map((plan: any, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                          {plan.step}
                        </div>
                        {i !== threatMatrix.mitigationPlan.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
                        )}
                      </div>
                      <Card className="flex-1 p-4 bg-slate-900/50 border-slate-800 mb-2">
                        <h4 className="font-semibold text-slate-200 mb-1">{plan.action}</h4>
                        <p className="text-xs text-blue-400/80">{plan.estimatedImpact}</p>
                      </Card>
                    </div>
                  ))}
                  {(!threatMatrix.mitigationPlan || threatMatrix.mitigationPlan.length === 0) && (
                    <p className="text-sm text-slate-500">No immediate mitigations required.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics && !isScanning && (
          <div className={threatMatrix ? "opacity-50 mt-16 pt-8 border-t border-slate-800" : ""}>
            <h2 className="text-xl font-bold text-white mb-4">Historical Base Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Trust Baseline</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.healthScore}/100</h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Signals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.activeSignals}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Interventions</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{metrics.overview.pendingActions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Associated Goals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{metrics.overview.associatedGoals}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
