'use client'

import { DashboardCharts } from "@/components/DashboardCharts"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [stats, setStats] = useState({
    totalSpent: 0,
    anomalies: 0,
    transactions: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactions) {
        const total = transactions.reduce((sum, t: any) => sum + Number(t.amount), 0);
        const anomal = transactions.filter((t: any) => t.is_anomaly).length;

        setStats({
          totalSpent: total,
          anomalies: anomal,
          transactions: transactions.length
        });
        setRecentTransactions(transactions.slice(0, 5));
      }
    }
    fetchStats();
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your financial intelligence.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/upload" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
            Upload Statement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Spend"
          value={stats.totalSpent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          icon={TrendingUp}
          trend="+12% from last month"
          trendColor="text-emerald-500"
        />
        <StatsCard
          title="Anomalies Detected"
          value={stats.anomalies.toString()}
          icon={AlertTriangle}
          trend={stats.anomalies > 0 ? "Attention Needed" : "All Good"}
          trendColor={stats.anomalies > 0 ? "text-rose-500" : "text-emerald-500"}
        />
        <StatsCard
          title="Total Transactions"
          value={stats.transactions.toString()}
          icon={Activity}
          trend="Updated just now"
          trendColor="text-muted-foreground"
        />
      </div>

      <DashboardCharts />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium">View All</Link>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No transactions found. Upload a CSV to get started.</div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('en-GB')} • {t.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {Number(t.amount) < 0 ? '-' : '+'}{Math.abs(Number(t.amount)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </p>
                  {t.is_anomaly && <span className="text-xs text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full">Anomaly</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, trend, trendColor }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-secondary rounded-lg text-foreground">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className={`text-xs font-medium ${trendColor} flex items-center gap-1`}>
        {trend}
      </div>
    </div>
  )
}
