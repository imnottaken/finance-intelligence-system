'use client'

import { useState } from "react"
import { Trash2, Shield, CheckCircle, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
    const [resetting, setResetting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [resetMode, setResetMode] = useState<'full' | 'transactions'>('transactions');

    const handleReset = async () => {
        const confirmMsg = resetMode === 'full'
            ? "NUCLEAR DELETE: This will wipe ALL transactions AND historical reports. Are you absolutely sure?"
            : "Are you sure? This will delete all current transactions to reset the dashboard, but keep generated reports.";

        if (!confirm(confirmMsg)) return;

        setResetting(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: resetMode })
            });

            if (response.ok) {
                setStatus('success');
                setMessage(resetMode === 'full' ? 'System completely reset.' : 'Dashboard transactions cleared.');
            } else {
                throw new Error('Failed to reset system.');
            }
        } catch (e) {
            setStatus('error');
            setMessage('Error resetting system. Check console.');
        } finally {
            setResetting(false);
        }
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your system preferences and data.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile / System Status */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-secondary rounded-lg">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">System Status</h3>
                            <p className="text-sm text-muted-foreground">Connected to Supabase & n8n</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                            <span className="text-sm font-medium">Database Connection</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                            <span className="text-sm font-medium">AI Engine</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Groq Llama 3
                            </span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-rose-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Irreversible actions for system management.
                    </p>

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-rose-500/10 rounded-lg">
                            <button
                                onClick={() => setResetMode('transactions')}
                                className={`flex-1 p-4 rounded-lg border text-left transition-all ${resetMode === 'transactions'
                                        ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                                        : 'border-border hover:bg-secondary'
                                    }`}
                            >
                                <div className="font-semibold text-foreground mb-1">Reset Dashboard</div>
                                <p className="text-xs text-muted-foreground">Clears active transactions but keeps historical reports.</p>
                            </button>

                            <button
                                onClick={() => setResetMode('full')}
                                className={`flex-1 p-4 rounded-lg border text-left transition-all ${resetMode === 'full'
                                        ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500'
                                        : 'border-border hover:bg-secondary'
                                    }`}
                            >
                                <div className="font-semibold text-foreground mb-1">Nuclear Reset</div>
                                <p className="text-xs text-muted-foreground">Deletes EVERYTHING (Transactions + Reports + Logs).</p>
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleReset}
                                disabled={resetting}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${resetMode === 'full'
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                {resetting ? 'Clearing...' : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        {resetMode === 'full' ? 'Delete EVERYTHING' : 'Clear Transactions'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {status === 'success' && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-sm text-emerald-500">
                            <CheckCircle className="w-4 h-4" /> {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
