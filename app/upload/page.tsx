'use client'

import { useState } from "react"
import { UploadCloud, CheckCircle, AlertCircle, FileText } from "lucide-react"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    }

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');

        // Use environment variable for the webhook URL
        // Use local API route to proxy to n8n (avoids CORS)
        const webhookUrl = '/api/upload';

        if (!webhookUrl) {
            setStatus('error');
            setMessage('Webhook URL not configured.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('data', file); // n8n webhook typically expects 'data' or similar field name or raw binary

            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setStatus('success');
                setMessage('File uploaded successfully! Processing started.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to upload file.');
        }
    }

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload Statement</h1>
                <p className="text-muted-foreground mt-1">Upload your bank statement CSV to trigger the analysis workflow.</p>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-card border-2 rounded-xl p-10 flex flex-col items-center justify-center min-h-[400px] transition-all ${isDragging
                        ? 'border-emerald-500 bg-emerald-500/5 border-dashed scale-[1.02]'
                        : 'border-border border-dashed'
                    }`}
            >
                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Upload Complete!</h3>
                        <p className="text-muted-foreground">{message}</p>
                        <button onClick={() => { setFile(null); setStatus('idle'); }} className="text-emerald-500 hover:underline font-medium">Upload another file</button>
                    </div>
                ) : (
                    <>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-emerald-500/20 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                            <UploadCloud className="w-10 h-10" />
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                {isDragging ? 'Drop CSV file here' : 'Drag and drop your CSV file'}
                            </h3>
                            <p className="text-muted-foreground text-sm">Or click to browse from your computer</p>
                        </div>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />

                        {!file ? (
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/10"
                            >
                                Browse Files
                            </label>
                        ) : (
                            <div className="w-full max-w-sm">
                                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg mb-6 border border-border">
                                    <FileText className="w-6 h-6 text-emerald-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        x
                                    </button>
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={status === 'uploading'}
                                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'uploading' ? 'Uploading...' : 'Start Processing'}
                                </button>
                                {status === 'error' && (
                                    <p className="text-rose-500 text-sm mt-3 text-center flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {message}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-2">Instructions</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Ensure your CSV has columns: Date, Description, Amount.</li>
                    <li>The system currently supports standard bank export formats.</li>
                    <li>Large files may take a few minutes to process completely.</li>
                </ul>
            </div>
        </div>
    )
}
