
import { Card } from '@/components/ui/Card';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Supplier Intelligence</h1>
        <p className="text-slate-400 mt-2">Supply chain health, dependencies, and network matching.</p>
      </div>

      <Card className="p-12 bg-slate-900 border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Intelligence Engine Active</h2>
        <p className="text-slate-400 max-w-md">
          The Supplier Intelligence module is natively integrated with your Unified Entrepreneur Context. Data flows bidirectionally from PostgreSQL to the AI Gateway.
        </p>
      </Card>
    </div>
  );
}
