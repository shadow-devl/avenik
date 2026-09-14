"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSearch, CheckCircle2, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

export default function SchemesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // 1. Fetch initial context to get the business ID
  useEffect(() => {
    async function init() {
      try {
        const ctxRes = await fetch('http://localhost:4000/api/context/current');
        const ctxJson = await ctxRes.json();
        
        if (ctxJson.success && ctxJson.data.hasBusiness) {
          const bid = ctxJson.data.businessId;
          setBusinessId(bid);
          
          // Fetch existing matches
          const matchRes = await fetch(`http://localhost:4000/api/schemes/match/matches/${bid}`);
          const matchJson = await matchRes.json();
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
  }, []);

  // 2. Trigger the AI matching engine manually
  const triggerMatch = async () => {
    if (!businessId) return;
    setIsMatching(true);
    try {
      const res = await fetch('http://localhost:4000/api/schemes/match/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      const json = await res.json();
      if (json.success) {
        setMatches(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading Government Intelligence...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            Government Support Execution
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Avenik's AI Engine securely analyzes your verified business profile against 
            authoritative government databases to find high-confidence scheme matches.
          </p>
        </div>
        
        <Button 
          onClick={triggerMatch} 
          disabled={isMatching}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          {isMatching ? 'Running AI Engine...' : 'Run Scheme Matcher'}
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-700 bg-slate-900/50">
          <FileSearch className="h-16 w-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Applications</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            We haven't discovered any active scheme matches for your profile yet. 
            Run the AI Matcher to scan for eligible government support.
          </p>
          <Button onClick={triggerMatch} variant="outline">Run Discovery Scan</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="p-0 overflow-hidden border-slate-800">
              <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                      {match.scheme.department}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
                      <ShieldCheck className="h-3 w-3" />
                      {(match.matchConfidence * 100).toFixed(0)}% AI Match
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{match.scheme.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Status</div>
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {match.status}
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Scheme Benefits</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{match.scheme.benefits}</p>
                  
                  <h4 className="font-bold text-slate-300 mt-6 mb-2">Eligibility Rules (Official)</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{match.scheme.eligibilityRules}</p>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
                  <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Action Required
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Based on your profile, you meet the demographic and business age requirements. 
                    However, to submit a verified application, you must provide the following missing evidence:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 mb-6">
                    {match.missingEvidence.split(',').map((evidence: string, idx: number) => (
                      <li key={idx}>{evidence.trim()}</li>
                    ))}
                  </ul>
                  
                  <div className="flex gap-3">
                    <Button className="w-full">Upload Evidence</Button>
                    <Button variant="outline" className="w-full" onClick={() => window.open(match.scheme.officialUrl, '_blank')}>View Official Portal</Button>
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
