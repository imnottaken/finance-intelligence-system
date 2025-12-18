import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use env vars for production security
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey || !GROQ_API_KEY) {
        return NextResponse.json({ error: 'Server configuration error: Missing Service Role Key or Groq API Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        console.log("Fetching transactions for report...");
        // 1. Fetch Transactions (All of them for this demo)
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        if (!transactions || transactions.length === 0) {
            return NextResponse.json({ error: 'No transactions found. Upload some data first!' }, { status: 400 });
        }

        // 2. Aggregate Data
        const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        // Basic Category breakdown for AI context
        const categories: Record<string, number> = {};
        transactions.forEach(t => {
            const cat = t.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + Number(t.amount);
        });
        const topCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([k, v]) => `${k} (${v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })})`)
            .join(', ');

        const promptContext = `
        Total Spend: ${totalSpent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        Transaction Count: ${transactions.length}
        Top Categories: ${topCategories}
        Sample Transactions: ${transactions.slice(0, 5).map(t => `${t.description} (${Number(t.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })})`).join(', ')}
        `;

        console.log("Sending to Groq:", promptContext);

        // 3. Generate Insight with Groq
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{
                    role: 'user',
                    content: `You are a financial analyst. Write a concise, professional summary (max 3 sentences) for this month's spending based on the following data. Highlight any anomalies or major spending areas. Do not use markdown bolding. Data: ${promptContext}`
                }]
            })
        });

        if (!groqResponse.ok) {
            const errText = await groqResponse.text();
            throw new Error(`Groq API Error: ${errText}`);
        }

        const groqJson = await groqResponse.json();
        const summary = groqJson.choices[0]?.message?.content || "No summary generated.";

        // 4. Save Report to Supabase
        const period = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        const { data: report, error: insertError } = await supabase
            .from('reports')
            .upsert({
                period: period,
                total_spent: totalSpent,
                summary: summary,
                // created_at will default to now
            }, { onConflict: 'period' }) // Simple logic: One report per month
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, report });

    } catch (error: any) {
        console.error("Report Generation Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
