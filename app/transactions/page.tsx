'use client'

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, AlertTriangle, Trash2 } from "lucide-react"
import { clsx } from "clsx"

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const categories = ['All', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Income', 'Uncategorized'];

    useEffect(() => {
        async function fetchTransactions() {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (data) {
                setTransactions(data);
                setFiltered(data);
            }
            setLoading(false);
        }
        fetchTransactions();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        // Optimistic update
        setTransactions(prev => prev.filter(t => t.id !== id));
        setFiltered(prev => prev.filter(t => t.id !== id));
        setOpenMenu(null);

        await supabase.from('transactions').delete().eq('id', id);
    };

    useEffect(() => {
        let res = transactions;
        if (search) {
            res = res.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.merchant?.toLowerCase().includes(search.toLowerCase()));
        }
        if (categoryFilter !== 'All') {
            res = res.filter(t => t.category === categoryFilter);
        }
        setFiltered(res);
    }, [search, categoryFilter, transactions]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground mt-1">Manage and review your categorized expenses.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-secondary border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                categoryFilter === cat
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto pb-32"> {/* Added padding bottom to prevent menu clipping */}
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-secondary rounded animate-pulse w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-secondary rounded animate-pulse w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-secondary rounded animate-pulse w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-secondary rounded animate-pulse w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-secondary rounded animate-pulse w-16 ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-secondary rounded-full animate-pulse mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="group hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{t.description}</div>
                                            <div className="text-xs text-muted-foreground">{t.merchant}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border">
                                                {t.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {t.is_anomaly ? (
                                                <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-semibold bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
                                                    <AlertTriangle className="w-3 h-3" /> Anomaly
                                                </span>
                                            ) : (
                                                <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-foreground">
                                            {Number(t.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </td>
                                        <td className="px-6 py-4 text-center relative">
                                            <button
                                                onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                                                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {openMenu === t.id && (
                                                <div className="absolute right-12 top-2 z-50 w-32 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium bg-secondary/50"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
