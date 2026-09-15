"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Target, CheckSquare, ShieldCheck, PieChart, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_NAV = [
  { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Government Support', href: '/dashboard/schemes', icon: Building2 },
  { name: 'Goals & Strategy', href: '/dashboard/goals', icon: Target },
  { name: 'Action Engine', href: '/dashboard/actions', icon: CheckSquare },
  { name: 'Financial Health', href: '/dashboard/finance', icon: PieChart },
  { name: 'Trust & Privacy', href: '/dashboard/trust', icon: ShieldCheck },
  { name: 'Ecosystem Network', href: '/dashboard/network', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="text-xl font-black text-white tracking-tighter">
            AVENIK<span className="text-blue-500">.</span>
          </Link>
          <div className="mt-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
             OS
          </div>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
