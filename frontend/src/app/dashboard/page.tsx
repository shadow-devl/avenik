"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Target, CheckCircle2, TrendingUp, ShieldAlert, Award, 
  BrainCircuit, Factory, Globe2, Landmark, DollarSign,
  HeartPulse, ShieldCheck, Users, Megaphone, Leaf, PackageSearch
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import Link from 'next/link';

interface UnifiedContext {
  user: { id: string; email: string; status: string; };
  activeRole: string | null;
  organization: { id: string; name: string; role: string; } | null;
  business: { id: string; displayName: string; status: string; } | null;
  journey: string;
  privacy: { dataSharingScope: string; };
  permissions: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [context, setContext] = useState<UnifiedContext | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [goals, setGoals] = useState<any[]>([]);
  const [nbas, setNbas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      async function fetchDashboardData() {
        try {
          const res = await apiGet<ApiResponse<UnifiedContext>>('/api/context/current');
          if (res.success) {
            setContext(res.data);
            
            if (res.data.business) {
              const [healthRes, goalsRes, nbaRes] = await Promise.all([
                apiPost<any>('/api/health-engine/calculate', { businessId: res.data.business.id }),
                apiGet<any>('/api/goals', { headers: { 'x-business-id': res.data.business.id } }),
                apiPost<any>('/api/nba/generate', { businessId: res.data.business.id })
              ]);
              
              if (healthRes.success) setHealthScore(healthRes.data.score);
              if (goalsRes.success) setGoals(goalsRes.data);
              if (nbaRes.success) setNbas(nbaRes.data);
            }
          } else {
            setError(res.message || "Failed to load context");
          }
        } catch (err: any) {
          console.error(err);
          if (err.status === 401 || err.status === 403) {
            setError("You do not have permission to view this dashboard.");
          } else {
            setError("Unable to connect to Avenik services.");
          }
        } finally {
          setLoading(false);
        }
      }
      fetchDashboardData();
    }
  }, [status, router]);

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Context Engine...</div>;

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center border-red-500/20 bg-red-500/5">
          <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-red-500/50" />
          <h2 className="text-xl font-bold mb-2 text-red-400">Access Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </Card>
      </div>
    );
  }

  if (!context?.business) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Welcome to Avenik</h2>
          <p className="text-slate-400 mb-6">You haven't created a business profile yet.</p>
          <Button onClick={() => router.push("/dashboard/settings")}>Create Business Profile</Button>
        </Card>
      </div>
    );
  }

  const aiModules = [
    { title: "Financial Intelligence", desc: "Margin optimization & anomaly detection", icon: DollarSign, link: "/dashboard/financial-intelligence", color: "text-emerald-400" },
    { title: "Revenue Operations", desc: "Pipeline velocity & leakage", icon: TrendingUp, link: "/dashboard/entrepreneur-revenue-operations", color: "text-emerald-400" },
    { title: "Forecasting", desc: "3-Quarter predictive models", icon: TrendingUp, link: "/dashboard/forecasting-intelligence", color: "text-emerald-400" },
    
    { title: "Marketing Intelligence", desc: "Campaign generation & targeting", icon: Megaphone, link: "/dashboard/marketing-intelligence", color: "text-pink-400" },
    { title: "Customer Experience", desc: "Friction analysis & loyalty plays", icon: HeartPulse, link: "/dashboard/customer-experience-intelligence", color: "text-pink-400" },
    { title: "Customer Self-Service", desc: "Automation plays & AI FAQs", icon: BrainCircuit, link: "/dashboard/customer-self-service-portal", color: "text-pink-400" },

    { title: "Product Management", desc: "Backlog prioritization & lifecycles", icon: PackageSearch, link: "/dashboard/product-management", color: "text-cyan-400" },
    { title: "Ideation Engine", desc: "AI brainstorms based on segments", icon: BrainCircuit, link: "/dashboard/ideas", color: "text-amber-400" },
    { title: "Intellectual Property", desc: "Patent strategy & monetization", icon: Award, link: "/dashboard/ip", color: "text-purple-400" },

    { title: "Operations Hub", desc: "Workflow bottleneck detection", icon: Factory, link: "/dashboard/operations-intelligence", color: "text-blue-400" },
    { title: "Advanced Supplier", desc: "Vendor optimization & risks", icon: Factory, link: "/dashboard/advanced-supplier", color: "text-blue-400" },
    { title: "Sustainability", desc: "ESG posture & compliance", icon: Leaf, link: "/dashboard/sustainability", color: "text-emerald-500" },

    { title: "Cybersecurity", desc: "Penetration score & threat vectors", icon: ShieldCheck, link: "/dashboard/cybersecurity", color: "text-red-400" },
    { title: "Data Governance", desc: "Privacy & compliance readiness", icon: ShieldAlert, link: "/dashboard/data-governance", color: "text-teal-400" },
    { title: "Legal & Compliance", desc: "Audit generation & risk analysis", icon: ShieldAlert, link: "/dashboard/legal", color: "text-red-500" },

    { title: "Human Capital", desc: "Talent mapping & upskilling", icon: Users, link: "/dashboard/human-capital-intelligence", color: "text-indigo-400" },
    { title: "Corporate University", desc: "AI curated learning tracks", icon: Award, link: "/dashboard/university", color: "text-indigo-400" },
    { title: "Wellness & Retention", desc: "Burnout risk mitigation", icon: HeartPulse, link: "/dashboard/wellness", color: "text-indigo-400" },

    { title: "Market Intelligence", desc: "Competitor mapping & threats", icon: Globe2, link: "/dashboard/market-intelligence", color: "text-sky-400" },
    { title: "Internationalization", desc: "Global market entry strategies", icon: Globe2, link: "/dashboard/internationalization", color: "text-sky-400" },
    { title: "Ecosystem Partnerships", desc: "Joint venture generation", icon: Users, link: "/dashboard/ecosystem-opportunity-execution", color: "text-fuchsia-400" },

    { title: "Govt Support Portfolio", desc: "Match business to grants", icon: Landmark, link: "/dashboard/government-support-portfolio", color: "text-yellow-400" },
    { title: "Scheme Success Rate", desc: "Draft application angles", icon: Target, link: "/dashboard/government-scheme-application-success", color: "text-yellow-400" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {context.business.displayName}</h1>
        <p className="text-slate-400">Avenik Unified Entrepreneur Intelligence Platform</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Business Health <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 py-0.5 rounded ml-1">CALCULATED</span></p>
            <h3 className="text-3xl font-bold text-blue-400">{healthScore}<span className="text-lg text-slate-500">/100</span></h3>
          </div>
          <TrendingUp className="h-10 w-10 text-blue-500/50" />
        </Card>

        <Card className="p-6 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Trust Profile <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded ml-1">STATUS</span></p>
            <h3 className="text-xl font-bold text-slate-300">{context.business.status === 'ACTIVE' ? 'BASIC VERIFIED' : 'UNVERIFIED'}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Platform level only. No Gov KYC.</p>
          </div>
          <Award className="h-10 w-10 text-emerald-500/50" />
        </Card>

        <Card className="p-6 border-purple-500/20 bg-purple-500/5 flex items-center justify-between cursor-pointer hover:bg-purple-500/10 transition-colors" onClick={() => router.push('/dashboard/growth-planning')}>
          <div>
            <p className="text-sm text-slate-400 mb-1">Active Goals</p>
            <h3 className="text-3xl font-bold text-purple-400">{goals.length}</h3>
          </div>
          <Target className="h-10 w-10 text-purple-500/50" />
        </Card>
      </div>

      {/* NBA and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Next Best Action
          </h2>
          {nbas.length > 0 ? (
            nbas.map((action, i) => (
              <Card key={i} className="p-5 border-amber-500/30 bg-slate-900">
                <h4 className="font-bold text-amber-400">{action.title}</h4>
                <p className="text-sm text-slate-300 mt-2">{action.description}</p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400">Confidence: {action.confidenceScore * 100}%</span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-slate-400 bg-slate-900">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
              <p>You're all caught up! No urgent actions required.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Current Trajectory
            </h2>
            <Link href="/dashboard/growth-planning" className="text-sm text-blue-400 hover:text-blue-300">
              Manage Goals
            </Link>
          </div>
          <Card className="p-0 overflow-hidden bg-slate-900">
            <div className="divide-y divide-slate-800">
              {goals.length > 0 ? goals.map((goal, i) => (
                <div key={i} className="p-5 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{goal.title}</h4>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{goal.category}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: goal.status === 'COMPLETED' ? '100%' : '30%' }}></div>
                  </div>
                </div>
              )) : (
                <div className="p-5 text-center text-slate-400">
                  <p>No active goals found.</p>
                  <Button onClick={() => router.push('/dashboard/growth-planning')} className="mt-4" size="sm" variant="outline">Set a Goal</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Intelligence Modules Command Center */}
      <div className="pt-8 border-t border-slate-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-500" />
            Intelligence Engine Command Center
          </h2>
          <p className="text-slate-400 mt-2">Access all 23+ live AI prediction and analysis modules mapped to your business context.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aiModules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link href={mod.link} key={i}>
                <Card className="p-5 h-full bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all group">
                  <Icon className={`h-6 w-6 mb-3 ${mod.color} group-hover:scale-110 transition-transform`} />
                  <h4 className="font-bold text-white text-sm mb-1">{mod.title}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{mod.desc}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
