import { Card } from '@/components/ui/Card';

export default function BusinessIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Business Intelligence</h1>
        <p className="text-slate-400 mt-2">Comprehensive health and financial metrics powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Overall Health</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">85/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Financial Score</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">90/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Risk Score</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">70/100</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Operations Score</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">85/100</p>
        </Card>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800">
        <h2 className="text-xl font-bold text-white">AI Financial Insights</h2>
        <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-900/50">
          <p className="text-blue-200">
            <strong>Insight:</strong> Your cash reserves are healthy, providing 6 months of runway. However, your accounts receivable cycle has lengthened by 15 days in the last quarter.
          </p>
        </div>
      </Card>
    </div>
  );
}
