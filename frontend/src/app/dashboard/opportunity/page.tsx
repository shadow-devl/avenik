"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Search, Loader2 } from "lucide-react";

export default function OpportunityPage() {
  const { status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiPost<any>('/api/opportunities/discover', { businessId: bid, query }, { headers: { 'x-business-id': bid } });
        if (res.success) {
          setResults(res.data);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Failed to discover opportunities");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Opportunity Discovery
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Opportunity Discovery Engine</h1>
        <p className="mt-1 text-slate-400">Use natural language to find government schemes, grants, and B2B opportunities tailored precisely to your business profile.</p>

        <div className="mt-8 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., 'We are a rural women-led handicraft business looking for export subsidies and skill training grants.'"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-4 pr-16 text-slate-200 placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button 
            onClick={handleSearch}
            disabled={loading || !query}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Top Matched Opportunities
            </h2>
            <div className="grid gap-6">
              {results.map((r, i) => (
                <Card key={i} className="p-6 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{r.opportunity.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{r.opportunity.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                        {Math.round(r.overallMatchScore * 100)}% Match
                      </span>
                      <span className="text-xs text-slate-500 mt-2 uppercase tracking-wider">{r.opportunity.type}</span>
                    </div>
                  </div>
                  
                  {r.explanation && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">AI Match Explanation</h4>
                      <p className="text-sm text-slate-300">{r.explanation.explanationText}</p>
                      
                      {r.explanation.missingEvidence && r.explanation.missingEvidence.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50">
                          <h5 className="text-xs font-medium text-amber-500/80 mb-1">Missing Requirements:</h5>
                          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                            {r.explanation.missingEvidence.map((me: string, idx: number) => (
                              <li key={idx}>{me}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
