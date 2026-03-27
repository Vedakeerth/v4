'use client';

import { redirectToCashfree } from "@/lib/cashfree";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Upload, FileBox, Trash2, FileText, AlignJustify, Grid3x3, Waves, Box } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useDropzone } from 'react-dropzone';
import { calculatePrice, LAYER_HEIGHTS, MATERIALS, INFILL_PATTERNS } from '@/lib/calculator';
import { getQuoteSettings, type QuoteSettings } from '@/lib/quote-settings';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const STLViewer = dynamic(() => import('./STLViewer'), {
    loading: () => <div className="flex h-full w-full min-h-[400px] items-center justify-center rounded-xl bg-slate-900/50"><Skeleton variant="rounded" height={400} className="w-full" /></div>,
    ssr: false,
});
import QuotationDocument from './QuotationDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Skeleton } from './Skeleton';
import CustomDropdown from './CustomDropdown';

// Icon mapping for Infill Patterns
const PATTERN_ICONS = {
    'Line': AlignJustify,
    'Grid': Grid3x3,
    'Gyroid': Waves,
    'Cubic': Box
} as const;

// Animation component that loops 5 times
function AnimationLoop5Times() {
    const [animationKey, setAnimationKey] = useState(0);
    const playCountRef = useRef(0);

    useEffect(() => {
        if (playCountRef.current < 4) {
            // Restart animation after ~2 seconds (adjust based on animation duration)
            const timer = setTimeout(() => {
                playCountRef.current += 1;
                setAnimationKey(prev => prev + 1);
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [animationKey]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20 flex items-center justify-center">
            <div className="w-[90vw] h-[90vh] max-w-[1200px] max-h-[1200px]">
                <DotLottieReact
                    key={animationKey}
                    src="https://lottie.host/0cd5b8a6-a751-4c86-a698-96d3d4228271/3D8mhnU1H0.lottie"
                    loop={false}
                    autoplay
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}

export default function QuoteCalculator() {
    const [uploadedFiles, setUploadedFiles] = useState<{
        id: string;
        file: File;
        volume: number;
        surfaceArea: number;
        height: number;
        dimensions: { x: number; y: number; z: number } | null;
        scale: number;
        color: string;
        quantity: number;
    }[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    const [material, setMaterial] = useState<keyof typeof MATERIALS>('PLA');
    const [infillPattern, setInfillPattern] = useState<keyof typeof INFILL_PATTERNS>('Line');
    const [infillPercent, setInfillPercent] = useState(10);
    const [layerHeight, setLayerHeight] = useState(0.2);
    const [isCustomDensity, setIsCustomDensity] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

    // Order acceptance states
    const [isPaymentAccepted, setIsPaymentAccepted] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    const [showTermsInfo, setShowTermsInfo] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const [isCalculating, setIsCalculating] = useState(false);

    // Modal & Order State
    // const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderStep, setOrderStep] = useState<'form' | 'preview' | 'success'>('form');
    const [quoteDetails, setQuoteDetails] = useState({ id: '', date: '', dueDate: '' });
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    // Detailed User Details State
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        doorNo: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        message: ''
    });

    const [isSending, setIsSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [orderId, setOrderId] = useState('');
    const [settings, setSettings] = useState<QuoteSettings | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        getQuoteSettings().then(setSettings);
    }, []);

    // Pincode Lookup Handler
    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value;
        setUserDetails(prev => ({ ...prev, pincode: code }));

        if (code.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
                    const postOffices = data[0].PostOffice;
                    if (Array.isArray(postOffices) && postOffices.length > 0) {
                        const details = postOffices[0];
                        setUserDetails(prev => ({
                            ...prev,
                            city: details.Block !== 'NA' ? details.Block : details.Name,
                            district: details.District,
                            state: details.State,
                            pincode: code
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            }
        }
    };

    // Derived state for the currently selected file object
    const selectedFile = useMemo(() =>
        uploadedFiles.find(f => f.id === selectedFileId) || null
        , [uploadedFiles, selectedFileId]);

    // Calculate Total Price across ALL files
    const totalResults = useMemo(() => {
        let totalPrice = 0;
        let totalWeight = 0;
        let totalTime = 0;
        let hasVolume = false;

        uploadedFiles.forEach(file => {
            if (file.volume > 0) {
                const res = calculatePrice(
                    file.volume,
                    material,
                    infillPercent,
                    infillPattern,
                    layerHeight,
                    file.surfaceArea,
                    file.height,
                    file.color,
                    settings || undefined
                );
                totalPrice += res.price * file.quantity;
                totalWeight += res.weight * file.quantity;
                totalTime += res.time * file.quantity;
                hasVolume = true;
            }
        });

        if (!hasVolume && uploadedFiles.length > 0) return null; // Calculating...
        if (uploadedFiles.length === 0) return null;

        return {
            price: totalPrice,
            weight: Number(totalWeight.toFixed(1)),
            time: Math.round(totalTime * 10) / 10
        };
    }, [uploadedFiles, material, infillPercent, infillPattern, layerHeight, settings]);

    // File Drop Handler with validation
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const reasons = rejectedFiles.map(({ file, errors }) => {
                if (errors.some((e: any) => e.code === 'file-too-large')) {
                    return `${file.name}: File exceeds 25MB limit`;
                }
                if (errors.some((e: any) => e.code === 'file-invalid-type')) {
                    return `${file.name}: Invalid file type`;
                }
                return `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`;
            });
            alert(`Some files were rejected:\n${reasons.join('\n')}`);
        }

        setUploadedFiles(prev => {
            const availableSlots = 5 - prev.length;
            if (availableSlots <= 0) {
                alert("Maximum 5 files allowed.");
                return prev;
            }

            const filesToAdd = acceptedFiles.slice(0, availableSlots);
            if (filesToAdd.length < acceptedFiles.length) {
                alert(`Only the first ${availableSlots} files were added. Maximum 5 files allowed.`);
            }

            const newFiles = filesToAdd.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                volume: 0,
                surfaceArea: 0,
                height: 0,
                dimensions: null,
                scale: 1,
                color: '#2563eb',
                quantity: 1
            }));

            const updated = [...prev, ...newFiles];

            if (newFiles.length > 0) {
                setSelectedFileId(newFiles[newFiles.length - 1].id);
                // Only calculate for STL files
                const hasStlFiles = newFiles.some(f => f.file.name.toLowerCase().endsWith('.stl'));
                if (hasStlFiles) {
                    setIsCalculating(true);
                }
            }

            return updated;
        });
    }, []);

    const removeFile = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
        if (selectedFileId === id) {
            setSelectedFileId(null);
        }
    };

    const handleStatsCalculated = useCallback((stats: { volumeCm3: number; surfaceAreaMm2: number; heightMm: number }) => {
        if (!selectedFileId) return;

        setUploadedFiles(prev => prev.map(f => {
            if (f.id === selectedFileId) {
                return {
                    ...f,
                    volume: stats.volumeCm3,
                    surfaceArea: stats.surfaceAreaMm2,
                    height: stats.heightMm
                };
            }
            return f;
        }));
        setIsCalculating(false);
    }, [selectedFileId]);

    const handleScaleChange = useCallback((newScale: number) => {
        if (!selectedFileId) return;

        setUploadedFiles(prev => prev.map(f => {
            if (f.id === selectedFileId) {
                return { ...f, scale: newScale };
            }
            return f;
        }));
    }, [selectedFileId]);

    const handleDimensionsCalculated = useCallback((dims: { x: number; y: number; z: number }) => {
        if (!selectedFileId) return;

        setUploadedFiles(prev => prev.map(f => {
            if (f.id === selectedFileId) {
                return { ...f, dimensions: dims };
            }
            return f;
        }));
    }, [selectedFileId]);

    const handleColorChange = useCallback((newColor: string) => {
        if (!selectedFileId) return;

        setUploadedFiles(prev => prev.map(f => {
            if (f.id === selectedFileId) {
                return { ...f, color: newColor };
            }
            return f;
        }));
    }, [selectedFileId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            setHasScrolledToBottom(true);
        }
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById('quotation-paper');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                windowWidth: 794,
                windowHeight: 1123,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDoc) => {
                    const body = clonedDoc.body;
                    const html = clonedDoc.documentElement;

                    // Force absolute zero margins and hide overflows to prevent scrap capture
                    html.style.margin = '0';
                    html.style.padding = '0';
                    html.style.overflow = 'hidden';
                    body.style.margin = '0';
                    body.style.padding = '0';
                    body.style.overflow = 'hidden';
                    body.style.backgroundColor = 'white';

                    const el = clonedDoc.getElementById('quotation-paper');
                    if (el) {
                        el.style.transform = 'none';
                        el.style.position = 'fixed';
                        el.style.top = '0';
                        el.style.left = '0';
                        el.style.margin = '0';
                        el.style.boxShadow = 'none';
                        el.style.border = 'none';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            pdf.save(`Quotation_${quoteDetails.id}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
        }
    };

    const getColorName = (hex: string): string => {
        const colorMap: { [key: string]: string } = {
            '#2563eb': 'Blue',
            '#ef4444': 'Red',
            '#22c55e': 'Green',
            '#eab308': 'Yellow',
            '#ffffff': 'White',
            '#000000': 'Black'
        };
        return colorMap[hex.toLowerCase()] || 'Custom';
    };

    const numberToWords = (num: number): string => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n: string | number) => {
            const val = n.toString();
            if (val.length > 9) return 'overflow';
            const n_match = ('000000000' + val).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
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
            return str;
        };

        return inWords(num) + 'Rupees Only';
    };

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        accept: {
            'model/stl': ['.stl'],
            'application/sla': ['.stl'],
            'application/vnd.ms-pki.stl': ['.stl'],
            'application/x-navistyle': ['.stl'],
            'application/octet-stream': ['.stl']
        },
        maxFiles: 5,
        maxSize: 25 * 1024 * 1024, // 25MB
        noClick: true,
    });

    return (
        <>
            {orderStep === 'form' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-12">
                    <div className="lg:col-span-7 space-y-6">
                        <div
                            {...getRootProps()}
                            className="aspect-square lg:aspect-video w-full cursor-pointer hover:opacity-90 transition-opacity relative group"
                            onClick={() => !selectedFile && open()}
                        >
                            <input {...getInputProps()} />
                            {selectedFile?.file && selectedFile.file.name.toLowerCase().endsWith('.stl') ? (
                                <STLViewer
                                    file={selectedFile.file}
                                    color={selectedFile.color || '#2563eb'}
                                    onStatsCalculated={handleStatsCalculated}
                                    onDimensionsCalculated={handleDimensionsCalculated}
                                    scale={selectedFile.scale || 1}
                                    onScaleChange={handleScaleChange}
                                    rotation={rotation}
                                    onRotationChange={setRotation}
                                    uploadedCount={uploadedFiles.length}
                                />
                            ) : selectedFile?.file ? (
                                <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 text-center p-8">
                                    <div className="mb-4 rounded-full bg-slate-800 p-4">
                                        <FileText className="text-cyan-400" size={48} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{selectedFile.file.name}</h3>
                                    <p className="text-sm text-slate-400">
                                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className="text-xs text-slate-500 mt-4">STL 3D Model</p>
                                    <p className="text-xs text-slate-600 mt-2">Processing 3D model...</p>
                                </div>
                            ) : (
                                <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all text-center p-8 group">
                                    <div className="mb-4 rounded-full bg-slate-800 p-4 group-hover:bg-cyan-500/20 transition-colors">
                                        <Upload className="text-slate-400 group-hover:text-cyan-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-200">Click to Upload STL Files</h3>
                                    <p className="text-sm text-slate-500 mt-2">or drag and drop below</p>
                                    <p className="text-xs text-slate-600 mt-4">Max size: 25MB per file • Max files: 5</p>
                                    <p className="text-xs text-slate-600 mt-1">Format: STL files only</p>
                                    <div className="mt-8 px-6 py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Uploaded Files ({uploadedFiles.length}/5)
                                        </span>
                                    </div>
                                </div>
                            )}

                            {uploadedFiles.length > 0 && (
                                <div className="absolute top-4 right-4 z-30">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); open(); }}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm shadow-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Upload size={16} /> Add Files
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedFile && selectedFile.dimensions && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-500">
                                        <FileBox size={20} />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{selectedFile.file.name}</div>
                                        <div className="text-xs text-slate-500">{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 mb-1">Dimensions</div>
                                    <div className="text-sm font-bold text-cyan-400 font-mono">
                                        {selectedFile.dimensions.x} x {selectedFile.dimensions.y} x {selectedFile.dimensions.z} mm
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
                                MODEL LIST
                            </h3>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {uploadedFiles.map((file, idx) => {
                                    const fileStats = file.volume > 0
                                        ? calculatePrice(
                                            file.volume,
                                            material,
                                            infillPercent,
                                            infillPattern,
                                            layerHeight,
                                            file.surfaceArea,
                                            file.height,
                                            file.color,
                                            settings || undefined
                                        )
                                        : null;

                                    const dimString = file.dimensions
                                        ? `${(file.dimensions.x * file.scale).toFixed(1)} × ${(file.dimensions.y * file.scale).toFixed(1)} × ${(file.dimensions.z * file.scale).toFixed(1)} mm`
                                        : '--';

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFileId(file.id)}
                                            className={cn(
                                                "relative p-3 rounded-xl border transition-all cursor-pointer group",
                                                selectedFileId === file.id
                                                    ? "bg-cyan-500/5 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                                    : "bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600"
                                            )}
                                        >
                                            {/* Line 1: Model name, Dimensions, Material */}
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="text-sm font-bold text-white">{idx + 1}. {file.file.name}</div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-500">Dimensions:</span>
                                                        <span className="text-slate-200 font-medium">{dimString}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-500">Material:</span>
                                                        <span className="text-slate-200 font-medium">{material}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => removeFile(file.id, e)}
                                                    className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                    title="Remove model"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Line 2: Scale, Weight, Quantity, Color, Total */}
                                            <div className="flex justify-between items-center border-t border-slate-700/30 pt-2">
                                                <div className="flex items-center gap-5">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 mb-0.5">Scale</div>
                                                        <div className="text-xs font-bold text-white">{Math.round(file.scale * 100)}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 mb-0.5">Weight</div>
                                                        <div className="text-xs font-semibold text-slate-200">{fileStats?.weight || 0}g</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 mb-0.5">Quantity</div>
                                                        <div className="text-xs font-semibold text-slate-200">Nos {file.quantity}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 mb-0.5">Color</div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-3 h-3 rounded border border-slate-600" style={{ backgroundColor: file.color }} />
                                                            <span className="text-xs font-semibold text-slate-200">{getColorName(file.color)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-500 mb-0.5">Total</div>
                                                    <div className="text-xl font-black text-cyan-400">
                                                        ₹{((fileStats?.price || 0) * file.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                Print Settings
                            </h3>
                            <div className="space-y-4 mb-6">
                                <label className="text-sm font-medium text-slate-400">Material</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(Object.keys(MATERIALS) as Array<keyof typeof MATERIALS>).map((m) => {
                                        const isAvailable = ['PLA', 'ABS'].includes(m);
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => {
                                                    if (isAvailable) {
                                                        setMaterial(m);
                                                    } else {
                                                        // Optional: You could show a toast here
                                                        console.log("Material unavailable");
                                                    }
                                                }}
                                                title={!isAvailable ? "Currently Unavailable" : ""}
                                                className={cn(
                                                    "px-2 py-2 rounded-lg text-xs font-bold transition-colors border relative overflow-hidden group",
                                                    material === m && isAvailable
                                                        ? "bg-cyan-500 text-slate-950 border-cyan-500"
                                                        : isAvailable
                                                            ? "bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-500/50"
                                                            : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-60"
                                                )}
                                            >
                                                <span className={cn(!isAvailable && "line-through decoration-slate-500/50 decoration-2")}>
                                                    {m}
                                                </span>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] uppercase tracking-tighter text-red-400 font-bold px-1 text-center leading-tight">
                                                            Unavailable
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                <div className="space-y-3 flex-1">
                                    <label className="text-sm font-medium text-slate-400">Color</label>
                                    <div className="flex gap-2">
                                        {['#2563eb', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorChange(c)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                                    selectedFile?.color === c ? "border-white scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                                aria-label={`Select color ${c}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-400">Quantity</label>
                                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                                        <button
                                            onClick={() => {
                                                if (!selectedFile) return;
                                                const newQty = Math.max(1, selectedFile.quantity - 1);
                                                setUploadedFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, quantity: newQty } : f));
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        </button>
                                        <span className="w-10 text-center font-bold text-white">{selectedFile?.quantity || 1}</span>
                                        <button
                                            onClick={() => {
                                                if (!selectedFile) return;
                                                const newQty = (selectedFile.quantity || 1) + 1;
                                                setUploadedFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, quantity: newQty } : f));
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-6">
                                <CustomDropdown
                                    label="Layer Height"
                                    value={String(layerHeight)}
                                    onChange={(val) => setLayerHeight(Number(val))}
                                    options={Object.entries(LAYER_HEIGHTS).map(([name, val]) => ({
                                        value: String(val),
                                        label: name === 'Default' ? 'Default (0.2mm)' : `${name} (${val}mm)`
                                    }))}
                                />

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Infill Pattern</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(Object.keys(INFILL_PATTERNS) as Array<keyof typeof INFILL_PATTERNS>).map((p) => {
                                            const Icon = PATTERN_ICONS[p] || Box;
                                            const isSelected = infillPattern === p;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setInfillPattern(p)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all",
                                                        isSelected
                                                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600"
                                                    )}
                                                >
                                                    <Icon size={14} className={cn(isSelected ? "text-cyan-500" : "text-slate-500")} />
                                                    {p}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <label className="text-xs font-medium text-slate-400 block">Density</label>
                                <div className="flex gap-2">
                                    <CustomDropdown
                                        value={isCustomDensity ? 'custom' : String(infillPercent)}
                                        onChange={(val) => {
                                            if (val === 'custom') {
                                                setIsCustomDensity(true);
                                            } else {
                                                setIsCustomDensity(false);
                                                setInfillPercent(Number(val));
                                            }
                                        }}
                                        options={[
                                            ...[5, 10, 20, 50, 70, 100].map(val => ({ value: String(val), label: `${val}%` })),
                                            { value: 'custom', label: 'Custom' }
                                        ]}
                                        className="flex-1"
                                    />

                                    {isCustomDensity && (
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={infillPercent}
                                                onChange={(e) => setInfillPercent(Math.min(100, Math.max(1, Number(e.target.value))))}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-6">
                                {/* Detailed Item Breakdown (Model Wise) */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mb-6 space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Model Wise breakdown</h4>
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file, idx) => {
                                                const res = file.volume > 0 ? calculatePrice(
                                                    file.volume,
                                                    material,
                                                    infillPercent,
                                                    infillPattern,
                                                    layerHeight,
                                                    file.surfaceArea,
                                                    file.height,
                                                    file.color,
                                                    settings || undefined
                                                ) : null;

                                                if (!res) return null;

                                                const itemTotal = res.price * file.quantity;
                                                const dimString = file.dimensions
                                                    ? `${(file.dimensions.x * file.scale).toFixed(1)} × ${(file.dimensions.y * file.scale).toFixed(1)} × ${(file.dimensions.z * file.scale).toFixed(1)} mm`
                                                    : '--';

                                                return (
                                                    <div key={file.id} className="text-[11px] pb-2 border-b border-white/5">
                                                        <div className="grid grid-cols-12 gap-2 items-start">
                                                            <div className="col-span-7">
                                                                <div className="font-bold text-slate-300 truncate">
                                                                    {idx + 1}. {file.file.name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                                    {dimString}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 text-center text-slate-400">
                                                                Nos {file.quantity}
                                                            </div>
                                                            <div className="col-span-3 text-right text-cyan-400 font-black">
                                                                ₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {(totalResults || isCalculating) && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Total Price</span>
                                            {isCalculating ? (
                                                <Skeleton variant="text" width={120} height={28} />
                                            ) : (
                                                <span className="text-xl font-bold text-cyan-400">
                                                    ₹${(totalResults?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-[12.5px] font-bold">
                                            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Round off</span>
                                            <span className={(() => {
                                                const total = totalResults?.price || 0;
                                                const rounded = Math.ceil(total);
                                                const diff = rounded - total;
                                                return diff === 0 ? "text-slate-400 text-[10px] uppercase font-medium" : "text-slate-200";
                                            })()}>
                                                {(() => {
                                                    const total = totalResults?.price || 0;
                                                    const rounded = Math.ceil(total);
                                                    const diff = rounded - total;
                                                    if (diff === 0) {
                                                        return 'Zero Rupees Only';
                                                    }
                                                    return `+ ₹${diff.toFixed(2)}`;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-700/50 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 font-bold">Net Price</span>
                                                <span className="text-2xl font-black text-cyan-400">
                                                    ₹{Math.ceil(totalResults?.price || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className="text-[10px] text-slate-500 uppercase">
                                                    {numberToWords(Math.ceil(totalResults?.price || 0))}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="space-y-3 pt-2 border-t border-slate-800/50">
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isPaymentAccepted}
                                                    onChange={(e) => setIsPaymentAccepted(e.target.checked)}
                                                    className="mt-1 peer appearance-none w-4 h-4 rounded border border-slate-700 bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                />
                                                <div className="text-xs text-slate-300">
                                                    Kindly, make sure the 100% payment to start your process. You will get your parts in 10 to 14 working days.
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPaymentInfo(true); }}
                                                        className="ml-1 text-cyan-500 font-bold hover:underline inline-flex items-center gap-0.5"
                                                    >
                                                        (see details)
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isTermsAccepted}
                                                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                                    className="mt-1 peer appearance-none w-4 h-4 rounded border border-slate-700 bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                />
                                                <div className="text-xs text-slate-300">
                                                    Agree our
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsInfo(true); }}
                                                        className="mx-1 text-cyan-500 font-bold hover:underline"
                                                    >
                                                        terms & conditions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowContactForm(true)}
                                            disabled={!totalResults || !isPaymentAccepted || !isTermsAccepted}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-4"
                                        >
                                            Proceed with Order
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {orderStep === 'preview' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 bg-slate-900 flex justify-between items-center shrink-0">
                            <button onClick={() => setOrderStep('form')} className="text-cyan-400 font-bold">Back</button>
                            <span className="font-bold text-white">Quotation Preview</span>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 custom-scrollbar"
                            onScroll={handleScroll}
                        >
                            {/* Standalone Quotation Template Component */}
                            <div className="flex justify-center p-4 min-h-screen bg-slate-100">
                                <QuotationDocument
                                    quoteId={quoteDetails.id}
                                    date={quoteDetails.date}
                                    dueDate={quoteDetails.dueDate}
                                    client={{
                                        name: userDetails.name || 'name',
                                        details: 'customer details, phone number',
                                        address: `${userDetails.doorNo} ${userDetails.street}, ${userDetails.city} - ${userDetails.pincode}`,
                                        email: userDetails.email || 'mail ID',
                                        phone: `${userDetails.countryCode}${userDetails.phone}`
                                    }}
                                    items={uploadedFiles.map(f => {
                                        const res = calculatePrice(
                                            f.volume,
                                            material,
                                            infillPercent,
                                            infillPattern,
                                            layerHeight,
                                            f.surfaceArea,
                                            f.height
                                        );
                                        return {
                                            name: f.file.name,
                                            description: `${material} â€¢ ${infillPercent}% â€¢ ${f.dimensions ? `${(f.dimensions.x * f.scale).toFixed(1)}x${(f.dimensions.y * f.scale).toFixed(1)}x${(f.dimensions.z * f.scale).toFixed(1)}` : '--'}mm`,
                                            price: res.price,
                                            quantity: f.quantity,
                                            total: res.price * f.quantity,
                                            color: f.color,
                                            weight: res.weight,
                                            time: res.time
                                        };
                                    })}
                                    totalAmount={totalResults?.price || 0}
                                    totalQty={uploadedFiles.reduce((acc, f) => acc + f.quantity, 0)}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                            <button
                                onClick={() => setOrderStep('form')}
                                className="text-slate-400 hover:text-white font-bold px-6 flex items-center gap-2 group transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                                Edit Details
                            </button>
                            <div className="flex flex-col w-full">
                                {isSending && (
                                    <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{uploadStatus}</span>
                                            <span className="text-white font-black text-sm">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button
                                    onClick={async () => {
                                        if (!userDetails.name || !userDetails.phone || !userDetails.email) {
                                            alert("Please fill in all contact details.");
                                            return;
                                        }

                                        setIsSending(true);
                                        setUploadProgress(10);
                                        setUploadStatus('Preparing files...');

                                        try {
                                            // 1. Upload files
                                            setUploadStatus('Uploading 3D models to secure storage...');
                                            setUploadProgress(20);
                                            const uploadFormData = new FormData();
                                            uploadFormData.append('fullName', userDetails.name);
                                            uploadFormData.append('email', userDetails.email);
                                            uploadFormData.append('phone', `${userDetails.countryCode}${userDetails.phone}`);
                                            uploadFormData.append('orderId', quoteDetails.id);
                                            if (userDetails.message) uploadFormData.append('message', userDetails.message);

                                            uploadedFiles.forEach((fileData, index) => uploadFormData.append(`file${index}`, fileData.file));

                                            const uploadRes = await fetch('/api/upload-to-drive', { method: 'POST', body: uploadFormData });
                                            const uploadData = await uploadRes.json();
                                            if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

                                            const driveFiles = uploadData.data?.files || [];
                                            setUploadProgress(60);
                                            setUploadStatus('Initializing payment session...');

                                            // 2. Create Cashfree Session
                                            const cashfreeRes = await fetch('/api/cashfree/create-order', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    amount: totalResults?.price || 0,
                                                    customerName: userDetails.name,
                                                    email: userDetails.email,
                                                    phone: `${userDetails.countryCode}${userDetails.phone}`,
                                                    orderId: quoteDetails.id
                                                })
                                            });
                                            const cashfreeData = await cashfreeRes.json();
                                            if (!cashfreeData.payment_session_id) throw new Error("Payment initialization failed");
                                            setUploadProgress(85);
                                            setUploadStatus('Saving order details...');

                                            // 3. Save order to system (Pending) before payment
                                            const fullAddress = `${userDetails.doorNo}, ${userDetails.street}, ${userDetails.city}, ${userDetails.district} - ${userDetails.pincode}, ${userDetails.state}`;
                                            await fetch('/api/send-quote', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    user: { ...userDetails, address: fullAddress },
                                                    order: {
                                                        id: quoteDetails.id,
                                                        models: uploadedFiles.map((f, i) => ({
                                                            name: f.file.name,
                                                            dimensions: f.dimensions,
                                                            scale: f.scale,
                                                            volume: f.volume,
                                                            color: f.color,
                                                            quantity: f.quantity,
                                                            driveFileId: driveFiles[i]?.id // Pass the file ID
                                                        })),
                                                        total: totalResults,
                                                        material,
                                                        infillPercent,
                                                        infillPattern
                                                    }
                                                })
                                            });
                                            setUploadProgress(100);
                                            setUploadStatus('Redirecting to secure gateway...');

                                            // 4. Redirect directly to Cashfree (same window)
                                            redirectToCashfree(cashfreeData.payment_session_id);

                                        } catch (err: any) {
                                            console.error("Checkout error:", err);
                                            alert(err.message || "Payment initialization failed. Please check your connection.");
                                            setUploadProgress(0);
                                        } finally {
                                            setIsSending(false);
                                        }
                                    }}
                                    disabled={isSending || !hasScrolledToBottom}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                    Proceed with Checkout
                                </button>

                                <button
                                    onClick={() => handleDownloadPDF()}
                                    disabled={!hasScrolledToBottom}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    Download Quotation Only
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

            {orderStep === 'success' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative z-10">
                        {/* DotLottie Confetti Animation - In front of popup */}
                        <AnimationLoop5Times />
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setOrderStep('form');
                                setUploadedFiles([]);
                                setSelectedFileId(null);
                                setUserDetails({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    countryCode: '+91',
                                    doorNo: '',
                                    street: '',
                                    city: '',
                                    district: '',
                                    state: '',
                                    pincode: '',
                                    message: ''
                                });
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 z-30"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div className="text-center relative z-30">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Quote Sent Successfully! 🎉</h2>
                            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                We have sent the quotation summary to <b>{userDetails.email}</b>. Our team will review the files and contact you shortly.
                            </p>

                            <a
                                href={`https://wa.me/${userDetails.countryCode.replace('+', '')}${userDetails.phone}?text=Hi, I just requested a quote (ID: ${orderId}) for ${uploadedFiles.reduce((acc, f) => acc + f.quantity, 0)} items across ${uploadedFiles.length} models.`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                Contact on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Info Modal */}
            {showPaymentInfo && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentInfo(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Payment Details</h3>
                        <div className="space-y-3 text-sm text-slate-300">
                            <p>To start the manufacturing process, we require 100% advance payment.</p>
                            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-cyan-400">Bank Transfer Details:</h4>
                                <p>Account Name: Vedakeerthi P</p>
                                <p>Account Number: 6850329636</p>
                                <p>IFSC Code: KKBK0008666</p>
                                <p>Bank: Kotak Mahindra Bank</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-cyan-400">UPI Payment:</h4>
                                <p>UPI ID: vaelinsa@sbi</p>
                                <p>Or scan the QR code (available after order confirmation)</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                * Your order will be processed within 24 hours of payment confirmation
                                * You will receive tracking details via email
                                * Estimated delivery: 10-14 working days
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPaymentInfo(false)}
                            className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Terms & Conditions Modal */}
            {showTermsInfo && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowTermsInfo(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Terms & Conditions</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">1. Order Processing</h4>
                                <p>Orders are processed only after 100% advance payment confirmation. Manufacturing begins within 24 hours of payment receipt.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">2. Delivery Timeline</h4>
                                <p>Standard delivery time is 10-14 working days from the date of order confirmation. Express delivery options may be available for select locations.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">3. Quality Assurance</h4>
                                <p>All parts undergo quality inspection before dispatch. We maintain tolerances of ±0.1mm for FDM printing and ±0.05mm for SLA printing.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">4. Returns & Refunds</h4>
                                <p>Custom manufactured parts are non-returnable unless there is a manufacturing defect. Defective parts will be replaced free of cost upon verification.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">5. Intellectual Property</h4>
                                <p>Customers retain all rights to their designs. VAELINSA will not share or reproduce customer designs without explicit permission.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-cyan-400 mb-2">6. Limitation of Liability</h4>
                                <p>VAELINSA&apos;s liability is limited to the order value. We are not responsible for consequential damages arising from the use of printed parts.</p>
                            </section>
                        </div>
                        <button
                            onClick={() => setShowTermsInfo(false)}
                            className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-lg transition-colors"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowContactForm(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-6">Contact Details</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (userDetails.phone.length !== 10) {
                                alert('Please enter a valid 10-digit phone number');
                                return;
                            }

                            // Generate Quote ID: VQ{MMYY}-{0000}
                            const now = new Date();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const year = String(now.getFullYear()).slice(-2);
                            const quoteNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
                            const quoteId = `VQ${month}${year}-${quoteNumber}`;

                            // Generate Quote Date: today in dd-mm-yyyy format
                            const day = String(now.getDate()).padStart(2, '0');
                            const quoteDate = `${day}-${month}-${now.getFullYear()}`;

                            // Generate Due Date: 10 working days from today
                            const dueDateObj = new Date(now);
                            let workingDaysAdded = 0;
                            while (workingDaysAdded < 10) {
                                dueDateObj.setDate(dueDateObj.getDate() + 1);
                                // Skip weekends (Saturday = 6, Sunday = 0)
                                if (dueDateObj.getDay() !== 0 && dueDateObj.getDay() !== 6) {
                                    workingDaysAdded++;
                                }
                            }
                            const dueDay = String(dueDateObj.getDate()).padStart(2, '0');
                            const dueMonth = String(dueDateObj.getMonth() + 1).padStart(2, '0');
                            const dueDate = `${dueDay}-${dueMonth}-${dueDateObj.getFullYear()}`;

                            setQuoteDetails({
                                id: quoteId,
                                date: quoteDate,
                                dueDate: dueDate
                            });

                            setShowContactForm(false);
                            setOrderStep('preview');
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.name}
                                        onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Email Address *</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.email}
                                        onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 shrink-0"
                                            value={userDetails.countryCode}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^+0-9]/g, '');
                                                if (value.startsWith('+')) {
                                                    setUserDetails({ ...userDetails, countryCode: value });
                                                }
                                            }}
                                            placeholder="+91"
                                        />
                                        <input
                                            required
                                            type="tel"
                                            inputMode="numeric"
                                            className="w-[180px] bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                            value={userDetails.phone.length > 5 ? `${userDetails.phone.slice(0, 5)} ${userDetails.phone.slice(5, 10)}` : userDetails.phone}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                setUserDetails({ ...userDetails, phone: value });
                                            }}
                                            placeholder=""
                                            title="Please enter a valid 10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Pincode *</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.pincode}
                                        onChange={handlePincodeChange}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-400">Door No / Building *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.doorNo}
                                        onChange={e => setUserDetails({ ...userDetails, doorNo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-400">Street / Area *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.street}
                                        onChange={e => setUserDetails({ ...userDetails, street: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">City</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.city}
                                        onChange={e => setUserDetails({ ...userDetails, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">District</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.district}
                                        onChange={e => setUserDetails({ ...userDetails, district: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">State</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.state}
                                        onChange={e => setUserDetails({ ...userDetails, state: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-400">Message / Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
                                        value={userDetails.message}
                                        onChange={e => setUserDetails({ ...userDetails, message: e.target.value })}
                                        placeholder="Any additional information or special requirements..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowContactForm(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    Generate Quotation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
