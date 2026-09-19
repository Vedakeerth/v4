import React from 'react';
import QuoteCalculator from '@/components/QuoteCalculator';
import { FileText } from 'lucide-react';

export default function OfflineQuoteTab() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <FileText className="text-cyan-500" /> Offline Quotation Generator
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">Calculate pricing and generate quotation PDFs for offline walk-in customers.</p>
                </div>
            </div>

            {/* Render the Quote Calculator in Admin Mode */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
                <QuoteCalculator isAdminMode={true} />
            </div>
        </div>
    );
}
