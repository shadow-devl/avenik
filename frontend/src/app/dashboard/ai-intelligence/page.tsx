"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet, apiPost } from '@/lib/api';
import { BrainCircuit, MessageSquare, Zap, Activity, Send } from "lucide-react";

export default function AiIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Copilot State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
        const res = await apiGet<any>(/api/generic-intelligence/metrics?businessId=&domain=ai-intelligence);
        if (res.success) {
          setMetrics({ ...res.data, businessId: bid });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMessage.trim() || !metrics?.businessId) return;

    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await apiPost<any>('/api/ai/chat', {
        businessId: metrics.businessId,
        message: userMessage
      });
      if (res.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Error connecting to Avenik Copilot.' }]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleGenerateSignals() {
    if (!metrics?.businessId) return;
    setIsGenerating(true);
    try {
      const res = await apiPost<any>('/api/ai/generate-signals', { businessId: metrics.businessId });
      if (res.success) {
        alert(res.data.message);
        fetchMetrics(); // Refresh to show new signals
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate signals.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading AI Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Avenik Core AI Engine
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Controls & Telemetry */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Command Center</h1>
              <p className="text-sm text-slate-400">Autonomous intelligence configuration.</p>
            </div>
          </div>

          <Card className="p-6 bg-slate-900 border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Autonomous Generation</h2>
            <p className="text-sm text-slate-400 mb-6">Trigger the AI to analyze your financial health, workforce, and active goals to autonomously generate Intelligence Signals.</p>
            <button 
              onClick={handleGenerateSignals}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {isGenerating ? <Activity className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
              {isGenerating ? "Analyzing Business Data..." : "Run Autonomous Analysis"}
            </button>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Latest System Signals</h2>
            <div className="space-y-3">
              {metrics?.recentSignals?.map((sig: any) => (
                <div key={sig.id} className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <h4 className="text-sm font-medium text-white">{sig.title}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] uppercase text-purple-400">{sig.type}</span>
                    <span className="text-[10px] text-slate-500">Auto-Generated</span>
                  </div>
                </div>
              ))}
              {metrics?.recentSignals?.length === 0 && (
                <p className="text-sm text-slate-500">Run an analysis to generate signals.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Copilot Chat */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col bg-slate-900 border-slate-800 overflow-hidden min-h-[600px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Avenik Strategic Copilot</h2>
              <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                Online
              </span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950">
              {chatHistory.length === 0 && (
                <div className="text-center text-slate-500 mt-20">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Ask Avenik Copilot to analyze your business metrics, forecast runway, or assess risks.</p>
                </div>
              )}
              
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={lex }>
                  <div className={max-w-[80%] rounded-2xl p-4 }>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder="Ask for strategic advice or metric analysis..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
}
