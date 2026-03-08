'use client';

import React from 'react';

interface QuotationDocumentProps {
    quoteId: string;
    date: string;
    dueDate: string;
    client: {
        name: string;
        details: string;
        address: string;
        email: string;
        phone: string;
    };
    items: Array<{
        name: string;
        description: string;
        price: number;
        quantity: number;
        total: number;
        color: string;
        weight?: number;
    }>;
    totalAmount: number;
    totalQty: number;
}

const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: string | number): string => {
        const val = Math.floor(Number(n));
        if (val === 0) return '';
        const n_str = val.toString();
        if (n_str.length > 9) return 'overflow';
        const n_match = ('000000000' + n_str).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n_match) return '';

        let str = '';
        // Safely access match groups
        const g1 = n_match[1];
        const g2 = n_match[2];
        const g3 = n_match[3];
        const g4 = n_match[4];
        const g5 = n_match[5];

        str += (g1 && Number(g1) !== 0) ? (a[Number(g1)] || b[Number(g1[0])] + ' ' + a[Number(g1[1])]) + 'Crore ' : '';
        str += (g2 && Number(g2) !== 0) ? (a[Number(g2)] || b[Number(g2[0])] + ' ' + a[Number(g2[1])]) + 'Lakh ' : '';
        str += (g3 && Number(g3) !== 0) ? (a[Number(g3)] || b[Number(g3[0])] + ' ' + a[Number(g3[1])]) + 'Thousand ' : '';
        str += (g4 && Number(g4) !== 0) ? (a[Number(g4)] || b[Number(g4[0])] + ' ' + a[Number(g4[1])]) + 'Hundred ' : '';
        str += (g5 && Number(g5) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(g5)] || b[Number(g5[0])] + ' ' + a[Number(g5[1])]) : '';
        return str.trim();
    };

    const mainPart = Math.floor(num);
    const decimalPart = Math.round((num - mainPart) * 100);

    let result = inWords(mainPart) + ' Rupees';
    if (decimalPart > 0) {
        result += ' and ' + inWords(decimalPart) + ' Paise';
    }
    return result + ' Only';
};

export default function QuotationDocument({
    quoteId,
    date,
    dueDate,
    client,
    items,
    totalAmount,
    totalQty
}: QuotationDocumentProps) {
    const subtotal = totalAmount;
    const finalTotal = Math.round(subtotal);
    const roundOff = finalTotal - subtotal;

    return (
        <div
            id="quotation-paper"
            className="bg-white w-full sm:w-[794px] h-[1123px] relative overflow-hidden flex flex-col text-[#334155] font-sans mx-auto"
            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}
        >
            {/* Top Banner Accent */}
            <div className="absolute top-0 right-0 w-[45%] h-[40px] z-0 overflow-hidden">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ display: 'block' }}>
                    <defs>
                        <linearGradient id="topBannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#00C2E0', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#0072B5', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    {/* Main Slanted Shape */}
                    <polygon points="20,-1 101,-1 101,101 -1,101" fill="url(#topBannerGradient)" />
                </svg>
            </div>

            <div className="p-8 pt-10 flex-1 flex flex-col relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-2">
                    {/* Logo & Company Info */}
                    <div>
                        <div className="mb-2">
                            <img src="/images/logo-v2.png" alt="VAELINSA" className="h-16 w-auto object-contain" />
                        </div>
                        <div className="text-[12px] leading-relaxed text-[#475569] font-medium">
                            Nandhini Store, TNP Nagar, Thudiliyar,<br />
                            Coimbatore, Tamil Nadu 641032<br />
                            Ph.no: +91-904757954, +91-8903678088,<br />
                            Email: info@vaelinsa.com
                        </div>
                    </div>

                    {/* Quotation Identity */}
                    <div className="text-right">
                        <h1 className="text-6xl font-normal text-[#334155] mb-4 mt-2 tracking-tight">QUOTATION</h1>
                        <div className="inline-block text-left text-[13px] space-y-2">
                            <div className="grid grid-cols-[100px_10px_1fr]">
                                <span className="font-bold text-[#64748b]">Quote ID</span>
                                <span className="text-slate-400">:</span>
                                <span className="text-slate-900 font-semibold">{quoteId}</span>
                            </div>
                            <div className="grid grid-cols-[100px_10px_1fr]">
                                <span className="font-bold text-[#64748b]">Quote Date</span>
                                <span className="text-slate-400">:</span>
                                <span className="text-slate-900 font-semibold">{date}</span>
                            </div>
                            <div className="grid grid-cols-[100px_10px_1fr]">
                                <span className="font-bold text-[#64748b]">Due Date</span>
                                <span className="text-slate-400">:</span>
                                <span className="text-slate-900 font-semibold">{dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Section */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-[14px] font-black uppercase text-slate-800">INVOICE TO:</h3>
                        <span className="text-base font-bold text-slate-900 capitalize">{client.name}</span>
                    </div>
                    <div className="text-[13px] font-medium leading-relaxed">
                        <div className="text-slate-600 mb-0.5">{client.address}</div>
                        <div className="text-slate-600 text-[12px]">
                            <span className="font-bold text-slate-900">Email:</span> {client.email} | <span className="font-bold text-slate-900">Phone:</span> {client.phone}
                        </div>
                    </div>
                </div>

                {/* Table Section with Watermark */}
                <div className="flex-1 relative">
                    {/* Centered Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] z-0 overflow-hidden">
                        <img src="/images/logo.png" alt="watermark" className="w-[85%] h-auto grayscale" />
                    </div>

                    <div className="relative z-10">
                        <table className="w-full border border-slate-300 border-collapse">
                            <thead>
                                <tr style={{ background: 'linear-gradient(to right, #00C2E0, #0072B5)' }} className="text-white text-[13px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3 border border-white/20 text-center w-[70px]">S.NO</th>
                                    <th className="px-4 py-3 border border-white/20 text-left">DESCRIPTION</th>
                                    <th className="px-4 py-3 border border-white/20 text-right w-[120px]">PRICE</th>
                                    <th className="px-4 py-3 border border-white/20 text-center w-[90px]">QTY</th>
                                    <th className="px-4 py-3 border border-white/20 text-right w-[140px]">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px]">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-300">
                                        <td className="px-4 py-2 border-r border-slate-300 text-center">{idx + 1}</td>
                                        <td className="px-4 py-2 border-r border-slate-300 font-medium">
                                            {item.name}<br />
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    {item.description} {item.weight ? `• ${item.weight.toFixed(1)}g` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border-r border-slate-300 text-right font-medium">₹ {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-2 border-r border-slate-300 text-center">{item.quantity} Nos</td>
                                        <td className="px-4 py-2 text-right font-bold text-slate-900">₹ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="mt-2 flex flex-col items-end gap-1 relative z-10 pr-0">
                            {/* Quantity and Subtotal on same line */}
                            <div className="flex items-center gap-0 text-[13px] font-bold">
                                <div className="w-[90px] text-center ml-auto">
                                    <span className="text-slate-900">{totalQty} Nos</span>
                                </div>
                                <div className="w-[140px] text-right">
                                    <span className="text-slate-800">₹ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 text-[12.5px] font-bold">
                                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Round off</span>
                                <span className="text-slate-800 w-[110px] text-right">
                                    {roundOff > 0 ? `+ ₹${roundOff.toFixed(2)}` : `- ₹${Math.abs(roundOff).toFixed(2)}`}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-0 text-[14px] font-black border-t-2 border-slate-900 mt-2 pt-2">
                                <div className="w-[90px] text-center ml-auto">
                                    <span className="text-slate-400 font-bold">-</span>
                                </div>
                                <div className="w-[140px] text-right">
                                    <span className="text-slate-900">₹ {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="mt-2 text-right">
                                <p className="text-[12px] italic text-[#64748b] font-medium leading-tight max-w-[400px]">
                                    {numberToWords(finalTotal)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Bottom Disclaimer */}
                <div className="mt-auto mb-16 relative z-10">
                    {/* Payment & Terms Section */}
                    <div className="grid grid-cols-2 gap-12 mt-2 relative border-t border-slate-100 pt-2">
                        <div>
                            <h4 className="text-[12px] font-black uppercase text-[#334155] mb-2 tracking-wider">SEND PAYMENTS TO:</h4>
                            <div className="text-[11px] font-medium text-[#475569] space-y-1.5">
                                <p>Bank A/C Name - <span className="font-bold text-[#0B2339]">Vedakeerthi Periyasamy</span></p>
                                <p>Bank A/C No - <span className="font-bold text-[#0B2339]">061601000048703</span></p>
                                <p>Bank Name - <span className="font-bold text-[#0B2339]">Indian Overseas Bank</span></p>
                                <p>Branch - <span className="font-bold text-[#0B2339]">Kurudampalayam</span></p>
                                <p>IFSC Code - <span className="font-bold text-[#0B2339]">IOBA0000616</span></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[13px] font-black uppercase text-[#334155] mb-2 tracking-wider">TERMS & CONDITIONS:</h4>
                            <ol className="text-[8.5px] leading-normal text-[#64748b] font-medium space-y-1.5 text-justify">
                                <li>1. 100% advance payment is required before the commencement of work.</li>
                                <li>2. Custom products are non-refundable and non-returnable unless they are defective or damaged upon receipt.</li>
                                <li>3. Transport costs are additional and will be billed separately.</li>
                                <li>4. Delivery times are estimated and may vary. Vaelinsa is not responsible for any delays, including those affecting deliveries to locations outside the local area.</li>
                                <li>5. All designs and IP created by Vaelinsa remain our property unless agreed otherwise in writing.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Computer Generated Disclaimer */}
                    <div className="text-center mt-4">
                        <p className="text-[11px] italic text-slate-500 font-medium">
                            * This is computer generated document no signature required. *
                        </p>
                    </div>
                </div>
            </div>

            {/* Styled Footer Bar - ABSOLUTELY PINNED */}
            <div className="absolute bottom-0 left-0 right-0 h-[60px] overflow-hidden shrink-0 z-50">
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full" style={{ display: 'block' }}>
                    {/* Blue Section */}
                    <polygon points="0,0 420,0 357,100 0,100" fill="#3b82f6" />
                    {/* White Slanted Separator */}
                    <polygon points="420,0 450,0 387,100 357,100" fill="#FFFFFF" />
                    {/* Navy Section */}
                    <polygon points="450,0 1000,0 1000,100 387,100" fill="#0B2339" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-end pr-8 pl-[45%]">
                    <div className="flex items-center gap-12">
                        {/* Website */}
                        <div className="flex items-center gap-3 text-white text-[13px] font-bold whitespace-nowrap">
                            <div className="w-6 h-6 rounded-full bg-[#00C2E0] flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            </div>
                            www.vaelinsa.com
                        </div>
                        {/* Phone */}
                        <div className="flex items-center gap-3 text-white text-[13px] font-bold whitespace-nowrap">
                            <div className="w-6 h-6 rounded-full bg-[#00C2E0] flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.17-.24c1.12.45 2.33.69 3.58.69a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A18 18 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.24 2.46.69 3.57a1 1 0 0 1-.24 1.18l-2.23 2.24z" /></svg>
                            </div>
                            +91 90476 73454
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
