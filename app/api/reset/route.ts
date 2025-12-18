import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'Server configuration error: Missing Service Role Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json().catch(() => ({}));
        const mode = body.mode || 'full'; // 'full' | 'transactions'

        if (mode === 'transactions') {
            // "Reset Dashboard" - Keep Reports, just clear current data
            await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('execution_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Clear logs too as they relate to ingestion
        } else {
            // "Nuclear Option" - Delete Everything
            await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('execution_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        return NextResponse.json({ success: true, mode });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
