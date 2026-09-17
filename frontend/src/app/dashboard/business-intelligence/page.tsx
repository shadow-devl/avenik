"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet, apiPost } from '@/lib/api';

export default function BusinessIntelligencePage() {
  const { status } = useSession();
  const router = useRouter();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchHealthData();
    }
  }, [status, router]);

  async function fetchHealthData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        let res = await apiGet<any>('/api/health-engine/current', { headers: { 'x-business-id': bid } });
        
        // If no current health data exists, calculate it
        if (!res.data) {
          res = await apiPost<any>('/api/health-engine/calculate', {}, { headers: { 'x-business-id': bid } });
        }
        
        if (res.success && res.data) {
          setHealthData(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Business Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Business Intelligence</h1>
        <p className="text-slate-400 mt-2">Comprehensive health and financial metrics powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Overall Health</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">{healthData?.score || 0}/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Financial Score</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">{healthData?.financialScore || 0}/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Compliance Score</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">{healthData?.complianceScore || 0}/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Operations Score</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">{healthData?.operationsScore || 0}/100</p>
        </Card>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800">
        <h2 className="text-xl font-bold text-white">AI Financial Insights</h2>
        <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-900/50">
          <p className="text-blue-200">
            <strong>Insight:</strong> {healthData?.insights ? healthData.insights : 'Your business profile is generating initial insights. Check back as more financial and operational data is ingested.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
