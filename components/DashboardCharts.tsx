'use client'

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// Mock data if DB is empty
const MOCK_DATA = [
    { name: 'Food', value: 400 },
    { name: 'Transport', value: 300 },
    { name: 'Utilities', value: 300 },
    { name: 'Entertainment', value: 200 },
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardCharts() {
    const [categoryData, setCategoryData] = useState<any[]>(MOCK_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('transactions')
                .select('category, amount');

            if (data && data.length > 0) {
                const grouped = data.reduce((acc: any, curr: any) => {
                    const cat = curr.category || 'Uncategorized';
                    acc[cat] = (acc[cat] || 0) + Number(curr.amount);
                    return acc;
                }, {});

                const formatted = Object.keys(grouped).map(key => ({
                    name: key,
                    value: grouped[key]
                }));
                setCategoryData(formatted);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse bg-secondary h-64 rounded-xl w-full"></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="tex-lg font-semibold mb-4 text-card-foreground">Spend by Category</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
                                itemStyle={{ color: '#fafafa' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="tex-lg font-semibold mb-4 text-card-foreground">Monthly Trend</h3>
                <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#27272a' }}
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
