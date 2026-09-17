
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Users, TrendingUp, AlertTriangle } from "lucide-react";

export default function CustomerIntelligencePage() {
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
        const res = await apiGet<any>(`/api/customer/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Customer Intelligence...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Customer Intelligence</h1>
        <p className="text-slate-400 mt-2">Deep lifecycle analytics, retention, and cohort intelligence.</p>
      </div>

      {!metrics || metrics.status === "NO_DATA" ? (
        <Card className="p-12 bg-slate-900 border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Customer Segments Found</h2>
          <p className="text-slate-400 max-w-md mb-6">
            You haven't defined any commercial expansion plans or customer segments yet. 
            Once you add them, the AI will generate predictive Customer Lifetime Value (CLV) and churn models.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Addressable</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{metrics.totalCustomers.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Across {metrics.segments.length} tracked segments</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Predicted CLV</p>
                  <h3 className="text-3xl font-bold text-emerald-400 mt-1">${metrics.averageCLV.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Average lifetime value per acquisition</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Aggregate Churn Risk</p>
                  <h3 className="text-3xl font-bold text-rose-400 mt-1">{Math.round(metrics.churnRiskScore)}%</h3>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Likelihood of abandonment based on engagement</p>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Tracked Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.segments.map((seg: any) => (
              <Card key={seg.id} className="p-5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">{seg.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    seg.readiness === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400' :
                    seg.readiness === 'LOW' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {seg.readiness} READINESS
                  </span>
                </div>
                <p className="text-sm text-slate-400">Estimated Size: {seg.size ? seg.size.toLocaleString() : 'Unknown'}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
