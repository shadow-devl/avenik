"use client";

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSearch, CheckCircle2, ShieldCheck, AlertCircle, Building2, Search, BrainCircuit, Sparkles } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

export default function AdvancedSchemesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [query, setQuery] = useState('Find government grants and financial schemes applicable to my current stage.');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      async function init() {
        try {
          const ctxJson = await apiGet<any>('/api/context/current');
          
          if (ctxJson.success && ctxJson.data.business) {
            const bid = ctxJson.data.business.id;
            setBusinessId(bid);
            
            // Try fetching existing track 1 matches
            const matchJson = await apiGet<any>(`/api/opportunities/matches/$bid`, { headers: { 'x-business-id': bid } });
            if (matchJson.success) {
              setMatches(matchJson.data);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      init();
    }
  }, [status, router]);

  const triggerSemanticDiscovery = async () => {
    if (!businessId || !query) return;
    setIsDiscovering(true);
    try {
      // Calls the new Hybrid Discovery AI Pipeline (Track 1)
      const json = await apiPost<any>('/api/opportunities/discover', { businessId, query });
      if (json.success && json.data) {
        // Map Track 1 MatchResults into the display format
        const mapped = json.data.map((r: any) => ({
          id: r.id,
          businessId: r.businessId,
          opportunityId: r.opportunityId,
          status: r.eligibilityStatus || 'DISCOVERED',
          matchConfidence: r.semanticScore || 0,
          missingEvidence: r.missingInfo ? JSON.parse(r.missingInfo).join(', ') : '',
          explanation: r.explanation,
          opportunity: r.opportunity,
          isTrack1: true
        }));
        setMatches(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading AI Discovery Engine...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-indigo-400" />
          Semantic Scheme Discovery
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Powered by our Hybrid AI Search. Describe your expansion goals or capital needs, and the engine 
          will semantically match your verified business profile against real-time government registries.
        </p>
      </div>

      <Card className="p-6 bg-slate-900 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find R&D grants for a tech startup in Karnataka"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <Button 
            onClick={triggerSemanticDiscovery} 
            disabled={isDiscovering || !query}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-xl flex items-center gap-2"
          >
            {isDiscovering ? (
              <span className="flex items-center gap-2 animate-pulse">
                <BrainCircuit className="h-5 w-5 animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Discover
              </span>
            )}
          </Button>
        </div>
      </Card>

      {matches.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-700 bg-slate-900/50">
          <FileSearch className="h-16 w-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-bold text-white mb-2">Awaiting Instructions</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Input a strategic intent above to initiate a semantic scan of the federal and state opportunity database.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="p-0 overflow-hidden border-slate-800 bg-slate-900/40">
              <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                      {match.opportunity?.department || 'Government Initiative'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3" />
                      {((match.matchConfidence || 0) * 100).toFixed(0)}% Semantic Match
                    </span>
                    {match.isTrack1 && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded border border-fuchsia-500/20">
                        <BrainCircuit className="h-3 w-3" />
                        AI Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{match.opportunity?.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Eligibility Status</div>
                  <div className={`font-bold flex items-center justify-end gap-2 $((match.status === 'ELIGIBLE' ? 'text-emerald-400' : match.status === 'POTENTIAL' ? 'text-amber-400' : 'text-rose-400'))`}>
                    <CheckCircle2 className="h-4 w-4" />
                    {match.status}
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Scheme Benefits</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{match.opportunity?.benefits}</p>
                  
                  {match.explanation && (
                    <div className="mt-6 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                      <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> AI Explanation
                      </h4>
                      <p className="text-indigo-200/80 text-sm italic">"{match.explanation}"</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800">
                  <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Action Required
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Based on your profile, you meet the demographic and business age requirements. 
                    However, to submit a verified application, you must provide the following missing evidence:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 mb-6">
                    {match.missingEvidence ? match.missingEvidence.split(',').map((evidence: string, idx: number) => (
                      <li key={idx}>{evidence.trim()}</li>
                    )) : <li>No additional evidence required for pre-qualification.</li>}
                  </ul>
                  
                  <div className="flex gap-3">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700">Upload Vault Docs</Button>
                    {match.opportunity?.officialUrl && (
                      <Button variant="outline" className="w-full" onClick={() => window.open(match.opportunity.officialUrl, '_blank')}>View Official Portal</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
