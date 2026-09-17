"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet, apiPost } from '@/lib/api';
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

export default function FraudAndTrustPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [fraudCases, setFraudCases] = useState<any[]>([]);
  const [trustClaims, setTrustClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchData();
    }
  }, [status, router, session]);

  async function fetchData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const [fraudRes, trustRes] = await Promise.all([
          apiGet<any>('/api/fraud', { headers: { 'x-business-id': bid } }),
          apiGet<any>('/api/trust/verification', { headers: { 'x-business-id': bid } })
        ]);

        if (fraudRes.success) setFraudCases(fraudRes.data);
        if (trustRes.success) setTrustClaims(trustRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Fraud & Trust metrics...</div>;

  const trustScore = 100 - (fraudCases.length * 15) + (trustClaims.filter(c => c.status === 'VERIFIED').length * 10);
  const normalizedScore = Math.max(0, Math.min(100, trustScore));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Fraud & Trust Metrics</h1>
        <p className="text-slate-400 mt-2">Monitor verification claims, active fraud cases, and your trust score.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900/50 border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Trust Score</p>
              <h3 className="text-3xl font-bold text-white mt-1">{normalizedScore}/100</h3>
            </div>
            <div className={p-2 rounded-lg }>
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Based on verifications and fraud history</p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fraud Cases</p>
              <h3 className="text-3xl font-bold text-rose-400 mt-1">{fraudCases.length}</h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Reported issues affecting reputation</p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Verifications</p>
              <h3 className="text-3xl font-bold text-blue-400 mt-1">{trustClaims.length}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Total submitted claims</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Trust Verifications</h2>
          {trustClaims.length === 0 ? (
            <Card className="p-6 bg-slate-900 border-slate-800 text-center">
              <p className="text-sm text-slate-400">No verification claims submitted.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {trustClaims.map((claim: any) => (
                <Card key={claim.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">{claim.type}</h4>
                    <p className="text-xs text-slate-500">Date: {new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={	ext-xs px-2 py-1 rounded-full }>
                    {claim.status}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Fraud Cases</h2>
          {fraudCases.length === 0 ? (
            <Card className="p-6 bg-slate-900 border-slate-800 text-center">
              <p className="text-sm text-slate-400">No fraud cases reported.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {fraudCases.map((fcase: any) => (
                <Card key={fcase.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">{fcase.type}</h4>
                    <p className="text-sm text-slate-400">{fcase.details}</p>
                  </div>
                  <span className={	ext-xs px-2 py-1 rounded-full }>
                    {fcase.severity}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
