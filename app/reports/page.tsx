'use client'

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { FileText, Download, Calendar, ExternalLink } from "lucide-react"

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            setLoading(true);
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('period', { ascending: false });

            if (data) {
                setReports(data);
            } else {
                setReports([]);
            }
            // No mock data - purely real data
            setLoading(false);
            setLoading(false);
        }
        fetchReports();
    }, []);

    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/generate-report', { method: 'POST' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed');
            }
            // Refresh
            window.location.reload();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                    <p className="text-muted-foreground mt-1">Monthly summaries and AI-generated insights.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <FileText className="w-5 h-5" /> Generate New Report
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse"></div>
                    ))
                ) : reports.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Reports Generated Yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            The AI workflow generates monthly reports automatically.
                            <br />
                            Once you have uploaded enough transaction data, trigger the "Generate Report" workflow in n8n.
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FileText className="w-24 h-24 text-emerald-500/5 -rotate-12 transform translate-x-4 -translate-y-4" />
                            </div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="p-3 bg-secondary rounded-xl text-foreground">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full border border-emerald-500/20">
                                    Generated {new Date(report.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-foreground mb-1">
                                    {new Date(report.period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <p className="text-2xl font-semibold text-foreground mb-4">
                                    {Number(report.total_spent).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                                    {report.summary}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            import('jspdf').then((jsPDF) => {
                                                const doc = new jsPDF.default();

                                                // Header
                                                doc.setFontSize(22);
                                                doc.setTextColor(16, 185, 129); // Emerald 500
                                                doc.text("FinIntel Monthly Report", 20, 20);

                                                // Metadata
                                                doc.setFontSize(12);
                                                doc.setTextColor(100);
                                                doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);
                                                doc.text(`Period: ${report.period}`, 20, 36);

                                                // Financials
                                                doc.setDrawColor(200);
                                                doc.line(20, 45, 190, 45);

                                                doc.setFontSize(16);
                                                doc.setTextColor(0);
                                                // Default PDF fonts don't support ₹ symbol, use Rs. text instead
                                                const amountStr = Number(report.total_spent).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                doc.text(`Total Spend: Rs. ${amountStr}`, 20, 60);

                                                // Summary Content
                                                doc.setFontSize(14);
                                                doc.setTextColor(50);
                                                doc.text("AI Executive Summary", 20, 80);

                                                doc.setFontSize(11);
                                                doc.setTextColor(80);
                                                // Sanitize summary to remove unsupported symbols
                                                const cleanSummary = (report.summary || "No summary available.").replace(/₹/g, 'Rs. ').replace(/[^\x00-\x7F]/g, " ");
                                                const splitText = doc.splitTextToSize(cleanSummary, 170);
                                                doc.text(splitText, 20, 90);

                                                // Footer
                                                doc.setFontSize(10);
                                                doc.setTextColor(150);
                                                doc.text("Generated by FinIntel AI Workflow", 20, 280);

                                                doc.save(`FinIntel_Report_${report.period}.pdf`);
                                            });
                                        }}
                                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
