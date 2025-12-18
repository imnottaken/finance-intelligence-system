import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (!webhookUrl) return NextResponse.json({ error: 'Config Error' }, { status: 500 });

    try {
        const formData = await req.formData();
        const file = formData.get('data') as File | null;
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

        console.log(`[Upload] Processing ${file.name} (${file.size} bytes)`);

        // FIX: Send as Buffer/Base64 JSON to avoid multipart/formData issues
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        console.log(`[Upload] Sending as JSON payload: ${file.name}`);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: file.name,
                mimeType: file.type || 'text/csv',
                content: base64
            })
        });

        if (!response.ok) throw new Error(`n8n error: ${response.status}`);

        const text = await response.text();
        return NextResponse.json({ success: true, data: text });

    } catch (error: any) {
        console.error('Upload Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
