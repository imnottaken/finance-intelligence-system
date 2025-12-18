export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            transactions: {
                Row: {
                    id: string
                    date: string
                    description: string
                    merchant: string | null
                    amount: number
                    category: string | null
                    confidence_score: number | null
                    is_anomaly: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    date: string
                    description: string
                    merchant?: string | null
                    amount: number
                    category?: string | null
                    confidence_score?: number | null
                    is_anomaly?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    date?: string
                    description?: string
                    merchant?: string | null
                    amount?: number
                    category?: string | null
                    confidence_score?: number | null
                    is_anomaly?: boolean
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    period: string
                    total_spent: number
                    summary: string | null
                    pdf_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    period: string
                    total_spent: number
                    summary?: string | null
                    pdf_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    period?: string
                    total_spent?: number
                    summary?: string | null
                    pdf_url?: string | null
                    created_at?: string
                }
            }
            execution_logs: {
                Row: {
                    id: string
                    workflow_name: string
                    status: string
                    error_message: string | null
                    timestamp: string
                }
                Insert: {
                    id?: string
                    workflow_name: string
                    status: string
                    error_message?: string | null
                    timestamp?: string
                }
                Update: {
                    id?: string
                    workflow_name?: string
                    status?: string
                    error_message?: string | null
                    timestamp?: string
                }
            }
        }
    }
}
