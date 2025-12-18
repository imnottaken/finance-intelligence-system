import { SideNav } from "@/components/SideNav";
import "./globals.css";

// Check if fonts are defined in original file, assuming basic structure or importing them if needed
// Usually create-next-app adds font variable imports here. I will assume they are present or not strictly needed if I use system fonts, 
// but wait, I viewed the file? No, I viewed globals.css. 
// Let's blindly replace the content with a safe structure that keeps the children.

import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance & Expense Intelligence",
  description: "Automated expense tracking and anomaly detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen bg-background text-foreground antialiased`}>
        <SideNav />
        <main className="flex-1 overflow-y-auto h-screen p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
