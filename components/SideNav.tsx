'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, FileText, UploadCloud, Settings, PieChart } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
]

export function SideNav() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-screen w-64 bg-card border-r border-border p-4">
            <div className="flex items-center gap-2 mb-8 px-4">
                <PieChart className="w-8 h-8 text-emerald-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                    FinIntel
                </span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-emerald-500/10"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "text-emerald-400" : "group-hover:text-emerald-400 computed-transition")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-4 border-t border-border mt-auto">
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>
            </div>
        </div>
    )
}
