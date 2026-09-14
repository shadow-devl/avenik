import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TrustedIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Trusted Intelligence</h1>
        <p className="text-slate-400 mt-2">Zero-knowledge proofs and verification infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Verification Status</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-white">Identity Verification</h3>
                <p className="text-sm text-slate-400">Government ID linked via DigiLocker</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Verified
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-white">Business Registration</h3>
                <p className="text-sm text-slate-400">Udyam Registration</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Verified
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-white">Financial Audits</h3>
                <p className="text-sm text-slate-400">Last FY Audit Report</p>
              </div>
              <Button size="sm" variant="outline">Upload Evidence</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-white mb-2">Trust Score</h2>
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex items-center justify-center my-6">
            <span className="text-4xl font-bold text-emerald-500">A</span>
          </div>
          <p className="text-slate-400 text-sm">
            Your Trust Score enables you to participate in advanced ecosystem matching and government scheme fast-tracking.
          </p>
        </Card>
      </div>
    </div>
  );
}
