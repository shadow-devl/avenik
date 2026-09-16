"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';

export default function TrustedIntelligencePage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchTrustData();
    }
  }, [status, router]);

  async function fetchTrustData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const res = await apiGet<any>('/api/trust/verification', { headers: { 'x-business-id': bid } });
        if (res.success) {
          setClaims(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitClaim(type: string) {
    try {
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        await apiPost<any>('/api/trust/verification', {
          type,
          data: { method: "SELF_DECLARED" },
          evidenceUrl: "https://example.com/evidence.pdf"
        }, { headers: { 'x-business-id': bid } });
        fetchTrustData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit claim");
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Trust Verification...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Trusted Intelligence
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
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Trusted Intelligence</h1>
          <p className="text-slate-400 mt-2">Zero-knowledge proofs and verification infrastructure.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2 p-6 bg-slate-900 border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4">Verification Status</h2>
            
            <div className="space-y-4">
              {['IDENTITY', 'BUSINESS_REGISTRATION', 'FINANCIAL_AUDITS'].map(type => {
                const claim = claims.find(c => c.type === type);
                return (
                  <div key={type} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <h3 className="font-semibold text-white">{type.replace('_', ' ')}</h3>
                      <p className="text-sm text-slate-400">{claim ? "Evidence Uploaded" : "Missing Verification"}</p>
                    </div>
                    {claim ? (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {claim.status}
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => submitClaim(type)}>Upload Evidence</Button>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-white mb-2">Trust Score</h2>
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex items-center justify-center my-6">
              <span className="text-4xl font-bold text-emerald-500">{claims.length > 0 ? 'A' : 'C'}</span>
            </div>
            <p className="text-slate-400 text-sm">
              Your Trust Score enables you to participate in advanced ecosystem matching and government scheme fast-tracking.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
