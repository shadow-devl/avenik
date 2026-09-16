"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';

export default function AdvancedFundingReadinessPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [fundingRequests, setFundingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchFundingData();
    }
  }, [status, router]);

  async function fetchFundingData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const res = await apiGet<any>('/api/funding/requests', { headers: { 'x-business-id': bid } });
        if (res.success) {
          setFundingRequests(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createFundingRequest() {
    try {
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        await apiPost<any>('/api/funding/requests', {
          amount: parseFloat(amount),
          purpose: purpose,
          instrumentType: "EQUITY"
        }, { headers: { 'x-business-id': bid } });
        setAmount("");
        setPurpose("");
        fetchFundingData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create funding request");
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Funding Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Advanced Funding Readiness
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Advanced Funding Readiness</h1>
          <p className="text-slate-400 mt-2">AI-driven readiness assessments and capital allocation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-medium text-white mb-2">New Internal Readiness Assessment</h2>
              <p className="text-xs text-slate-500 mb-4 uppercase">Internal Platform Only • No External Submission</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Target Amount ($)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Purpose / Use of Funds</label>
                  <input 
                    type="text" 
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <Button onClick={createFundingRequest} className="w-full" disabled={!amount || !purpose}>Initiate Internal Assessment</Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white">Internal Funding Readiness Records</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {fundingRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No active readiness assessments found. Initiate an assessment to begin.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {fundingRequests.map((req: any) => (
                    <div key={req.id} className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-lg">${req.amount.toLocaleString()}</h3>
                          <p className="text-sm text-slate-400">{req.purpose}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">{req.status}</span>
                      </div>
                      
                      {req.options && req.options.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Matched Funding Options:</h4>
                          <ul className="space-y-2">
                            {req.options.map((opt: any) => (
                              <li key={opt.id} className="text-sm text-slate-400 flex justify-between">
                                <span>{opt.providerName} - {opt.instrumentType}</span>
                                <span className="text-emerald-400 font-medium">Match: {opt.matchScore * 100}%</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
