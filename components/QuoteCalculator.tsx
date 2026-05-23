'use client';

import { redirectToCashfree } from "@/lib/cashfree";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Upload, FileBox, Trash2, FileText, AlignJustify, Grid3x3, Waves, Box, LogIn } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useDropzone } from 'react-dropzone';
import { calculatePrice, LAYER_HEIGHTS, MATERIALS, INFILL_PATTERNS } from '@/lib/calculator';
import { getQuoteSettings, type QuoteSettings } from '@/lib/quote-settings';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { calculateShipping, ShippingDetails } from '@/lib/shippingCalculator';

const STLViewer = dynamic(() => import('@/components/STLViewer'), {
    loading: () => <div className="flex h-full w-full min-h-[400px] items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/50"><Skeleton variant="rounded" height={400} className="w-full" /></div>,
    ssr: false,
});
import QuotationDocument from '@/components/QuotationDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Skeleton } from '@/components/Skeleton';
import CustomDropdown from '@/components/CustomDropdown';
import Recaptcha from "@/components/Recaptcha";

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

interface QuoteCalculatorProps {
    sessionId?: string;
    isAdminMode?: boolean;
}

export default function QuoteCalculator({ sessionId, isAdminMode = false }: QuoteCalculatorProps) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const source = searchParams.get('source');
    const rootFolder = source === 'gallery' ? 'INVOICE' : 'QUOTATION';

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
        customPriceOverride?: number;
    }[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    const [material, setMaterial] = useState<keyof typeof MATERIALS>('PLA');
    const [infillPattern, setInfillPattern] = useState<keyof typeof INFILL_PATTERNS>('Line');
    const [infillPercent, setInfillPercent] = useState(15);
    const [layerHeight, setLayerHeight] = useState(0.2);
    const [isCustomDensity, setIsCustomDensity] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

    // Order acceptance states
    const [megaLink, setMegaLink] = useState('');
    const [useMega, setUseMega] = useState(false);
    const MEGA_FOLDER_LINK = "https://mega.nz/folder/70QEDYaa#IZnYAltMGwGxgj2oXDqjdg";
    const [isPaymentAccepted, setIsPaymentAccepted] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    const [showTermsInfo, setShowTermsInfo] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    const [isCalculating, setIsCalculating] = useState(false);
    const [useCoupon, setUseCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [applyVolumeReward, setApplyVolumeReward] = useState(true);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();
            if (data.success) {
                setAppliedCoupon(data.coupon);
                setCouponError('');
            } else {
                setAppliedCoupon(null);
                setCouponError(data.message || 'Invalid coupon code');
            }
        } catch (err) {
            setCouponError('Failed to validate coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Modal & Order State
    const [customPricePerGram, setCustomPricePerGram] = useState<number>(6.75);
    const [orderStep, setOrderStep] = useState<'form' | 'preview' | 'success'>('form');
    const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
    const [uploadedFolderUrl, setUploadedFolderUrl] = useState('');
    const [quoteDetails, setQuoteDetails] = useState({ id: '', date: '', dueDate: '' });
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Detailed User Details State
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        doorNo: '',
        street: '',
        area: '',
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
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        getQuoteSettings().then(setSettings);
    }, []);

    // Handle preview scaling
    useEffect(() => {
        if (orderStep !== 'preview' || !previewContainerRef.current) return;

        const updateScale = () => {
            if (!previewContainerRef.current) return;
            const containerWidth = previewContainerRef.current.clientWidth - 32; // padding
            const targetWidth = 794; // A4 width in px
            if (containerWidth < targetWidth) {
                setPreviewScale(containerWidth / targetWidth);
            } else {
                setPreviewScale(1);
            }
        };

        const observer = new ResizeObserver(updateScale);
        observer.observe(previewContainerRef.current);
        updateScale();

        return () => observer.disconnect();
    }, [orderStep]);

    // Handle body scroll lock
    useEffect(() => {
        const isAnyModalOpen = showPaymentInfo || showTermsInfo || showContactForm || orderStep === 'preview' || orderStep === 'success';
        
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showPaymentInfo, showTermsInfo, showContactForm, orderStep]);

    // Pincode Lookup Handler
    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value;
        setUserDetails(prev => ({ ...prev, pincode: code }));

        if (code.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
                const data = await res.json();
                if (data[0].Status === "Success") {
                    const details = data[0].PostOffice[0];
                    setUserDetails(prev => ({
                        ...prev,
                        city: details.District,
                        district: details.District,
                        state: details.State,
                        area: details.Name,
                        pincode: code
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            }
        }
    };

    // Calculate shipping whenever location or products change
    useEffect(() => {
        if (uploadedFiles.length > 0) {
            const products = uploadedFiles.map(f => ({
                weight: (f.volume * 1.25) || 500, // 1.25g/cm3 density for PLA fallback
                dimensions: {
                    length: f.dimensions?.x || 15,
                    width: f.dimensions?.y || 15,
                    height: f.dimensions?.z || 10
                },
                quantity: f.quantity || 1
            }));

            // Calculate preliminary total for free shipping check
            let subtotal = 0;
            uploadedFiles.forEach(file => {
                if (file.volume > 0) {
                    const res = calculatePrice(file.volume, material, infillPercent, infillPattern, layerHeight, file.surfaceArea, file.height, file.color, settings || undefined, isAdminMode ? customPricePerGram : undefined);
                    subtotal += (file.customPriceOverride !== undefined ? file.customPriceOverride : res.price) * file.quantity;
                }
            });

            const details = calculateShipping(products, userDetails.state || "", subtotal, userDetails.pincode || "");
            setShippingDetails(details);
        } else {
            setShippingDetails(null);
        }
    }, [userDetails.state, userDetails.pincode, uploadedFiles, material, infillPercent, infillPattern, layerHeight, settings, isAdminMode, customPricePerGram]);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userDetails.phone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        if (!recaptchaToken && process.env.NODE_ENV === 'production') {
            alert('Please complete the reCAPTCHA verification');
            return;
        }

        setIsSending(true);
        try {
            console.log("[QuoteCalculator] Fetching sequential ID...");
            const prefix = source === 'gallery' ? 'IN' : 'VQ';
            const idRes = await fetch(`/api/generate-id?prefix=${prefix}`);
            const idData = await idRes.json();
            if (!idData.success) throw new Error("Failed to generate official ID");

            const quoteId = idData.trackingId;
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const quoteDate = `${day}-${month}-${now.getFullYear()}`;

            const dueDateObj = new Date(now);
            dueDateObj.setDate(dueDateObj.getDate() + 10);
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
        } catch (err) {
            console.error(err);
            alert("Failed to prepare quotation. Please try again.");
        } finally {
            setIsSending(false);
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
                    settings || undefined,
                    isAdminMode ? customPricePerGram : undefined
                );
                const activePrice = file.customPriceOverride !== undefined ? file.customPriceOverride : res.price;
                totalPrice += activePrice * file.quantity;
                totalWeight += res.weight * file.quantity;
                totalTime += res.time * file.quantity;
                hasVolume = true;
            }
        });

        if (!hasVolume && uploadedFiles.length > 0) return null; // Calculating...
        if (uploadedFiles.length === 0) return null;

        let discount = 0;
        let activeTier = null;

        // Use settings or fallback to defaults for calculation
        const tiers = settings?.discountTiers?.length ? settings.discountTiers : [
            { threshold: 1500, percentage: 5 },
            { threshold: 2500, percentage: 10 },
            { threshold: 3500, percentage: 20 }
        ];

        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                discount = (totalPrice * appliedCoupon.value) / 100;
            } else if (appliedCoupon.type === 'fixed') {
                discount = appliedCoupon.value;
            }
        } else if (applyVolumeReward) {
            // Find the highest qualifying tier
            const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);
            activeTier = sortedTiers.find(t => totalPrice >= t.threshold);
            if (activeTier) {
                discount = (totalPrice * activeTier.percentage) / 100;
            }
        }

        const finalTotal = Math.max(0, totalPrice - discount);
        const shipping = shippingDetails?.totalShipping || 0;

        return {
            subtotal: totalPrice,
            weight: totalWeight,
            time: totalTime,
            discount,
            finalTotal,
            shipping,
            grandTotal: finalTotal + shipping,
            tier: activeTier
        };
    }, [uploadedFiles, material, infillPercent, infillPattern, layerHeight, appliedCoupon, settings, isAdminMode, customPricePerGram, shippingDetails, applyVolumeReward]);

    // Pre-calculate detailed items for email/API to ensure consistency
    const detailedItems = useMemo(() => {
        return uploadedFiles.map(f => {
            const res = calculatePrice(
                f.volume,
                material,
                infillPercent,
                infillPattern,
                layerHeight,
                f.surfaceArea,
                f.height,
                f.color,
                settings || undefined,
                isAdminMode ? customPricePerGram : undefined
            );
            const activePrice = f.customPriceOverride !== undefined ? f.customPriceOverride : res.price;
            return {
                id: f.id,
                name: f.file.name,
                dimensions: f.dimensions,
                scale: f.scale,
                volume: f.volume,
                color: f.color,
                quantity: f.quantity,
                price: activePrice,
                total: activePrice * f.quantity,
                fileUrl: '' // To be filled during upload
            };
        });
    }, [uploadedFiles, material, infillPercent, infillPattern, layerHeight, settings, isAdminMode, customPricePerGram]);

    // Celebration effect logic
    const [showCelebration, setShowCelebration] = useState(false);
    const lastDiscountRef = useRef(0);

    useEffect(() => {
        if (totalResults?.discount && totalResults.discount > lastDiscountRef.current) {
            setShowCelebration(true);
            const timer = setTimeout(() => setShowCelebration(false), 3000);
            lastDiscountRef.current = totalResults.discount;
            return () => clearTimeout(timer);
        }
        if (!totalResults?.discount) {
            lastDiscountRef.current = 0;
        }
    }, [totalResults?.discount]);

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
                color: '#000000',
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

    const generatePDFBlob = async (): Promise<Blob | null> => {
        const input = document.getElementById('quotation-paper');
        if (!input) return null;

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
            return pdf.output('blob');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            return null;
        }
    };

    const handleDownloadPDF = async () => {
        const blob = await generatePDFBlob();
        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quotation_${quoteDetails.id}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const getColorName = (hex: string) => {
        const lowerHex = hex.toLowerCase();
        if (settings?.colors && settings.colors[lowerHex]) {
            return settings.colors[lowerHex].name;
        }
        if (settings?.colors) {
            // Fallback to searching by key if literal match fails
            const found = Object.entries(settings.colors).find(([h]) => h.toLowerCase() === lowerHex);
            if (found) return found[1].name;
        }

        const colorMap: Record<string, string> = {
            '#2563eb': 'Blue',
            '#ef4444': 'Red',
            '#22c55e': 'Green',
            '#eab308': 'Yellow',
            '#ffffff': 'White',
            '#000000': 'Black'
        };
        return colorMap[lowerHex] || 'Custom';
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
                            className="aspect-square lg:aspect-video w-full cursor-pointer hover:opacity-100 transition-all relative group border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/30 p-3 sm:p-4"
                            onClick={() => !selectedFile && open()}
                        >
                            <input {...getInputProps()} />
                            {selectedFile?.file && selectedFile.file.name.toLowerCase().endsWith('.stl') ? (
                                <STLViewer
                                    file={selectedFile.file}
                                    color={selectedFile.color || '#000000'}
                                    onStatsCalculated={handleStatsCalculated}
                                    onDimensionsCalculated={handleDimensionsCalculated}
                                    scale={selectedFile.scale || 1}
                                    onScaleChange={handleScaleChange}
                                    rotation={rotation}
                                    onRotationChange={setRotation}
                                    uploadedCount={uploadedFiles.length}
                                />
                            ) : selectedFile?.file ? (
                                <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-cyan-400/40 dark:border-cyan-500/20 bg-cyan-50/30 dark:bg-cyan-950/10 text-center p-8 transition-all">
                                    <div className="mb-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-4">
                                        <FileText className="text-cyan-500" size={48} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-2">{selectedFile.file.name}</h3>
                                    <p className="text-sm text-slate-700 dark:text-slate-400">
                                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">STL 3D Model</p>
                                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 animate-pulse font-medium">Processing 3D model...</p>
                                </div>
                            ) : (
                                <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-cyan-400/40 dark:border-cyan-500/20 hover:border-cyan-500/60 bg-cyan-50/30 dark:bg-cyan-950/10 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all text-center p-8 group">
                                    <div className="mb-6 rounded-full bg-cyan-100/50 dark:bg-cyan-900/30 p-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                        <Upload className="text-cyan-600 dark:text-cyan-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Click to Upload STL Files</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">or drag and drop below</p>
                                    
                                    <div className="mt-6 flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Specifications</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Max size: 25MB per file • Max files: 5</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">Format: STL files only</p>
                                    </div>

                                    <div className="mt-10 px-8 py-3 bg-white dark:bg-slate-800 rounded-full border border-cyan-500/20 shadow-xl shadow-cyan-500/5 group-hover:border-cyan-500/40 transition-all">
                                        <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em]">
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
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-cyan-500">
                                        <FileBox size={20} />
                                    </div>
                                    <div>
                                        <div className="text-slate-900 dark:text-white font-medium">{selectedFile.file.name}</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-500">{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-700 dark:text-slate-400 mb-1">Dimensions</div>
                                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                                        {selectedFile.dimensions.x} x {selectedFile.dimensions.y} x {selectedFile.dimensions.z} mm
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                            <h3 className="text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.2em] mb-5 flex justify-between items-center">
                                <span>MODEL LIST</span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 normal-case tracking-normal">
                                    {uploadedFiles.length} / 5 Models
                                </span>
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
                                            settings || undefined,
                                            isAdminMode ? customPricePerGram : undefined
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
                                                "relative p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group",
                                                selectedFileId === file.id
                                                    ? "bg-cyan-500/5 border-cyan-500/50 shadow-xl shadow-cyan-500/10"
                                                    : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30 shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    selectedFileId === file.id ? "bg-cyan-500 text-white" : "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500"
                                                )}>
                                                    <FileText size={24} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                        <div className="truncate w-full sm:w-auto">
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                                {file.file.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
                                                                {(file.file.size / 1024 / 1024).toFixed(2)} MB • {material}
                                                            </div>
                                                        </div>
                                                        <div className="sm:text-right shrink-0">
                                                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Dimensions</div>
                                                            <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                                                                {dimString}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Scale</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(file.scale * 100)}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Qty</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{file.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Weight</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fileStats?.weight || 0}g</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Color</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: file.color }} />
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{getColorName(file.color)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-auto flex items-center gap-4">
                                                            <div className="text-right">
                                                                <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Item Total</div>
                                                                <div className="text-lg font-black text-cyan-500 leading-none">
                                                                    ₹{((fileStats?.price || 0) * file.quantity).toFixed(0)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => removeFile(file.id, e)}
                                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                                                title="Remove model"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
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
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between gap-2">
                                <span>Print Settings</span>
                                {isAdminMode && (
                                    <div className="flex items-center gap-1.5 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 shadow-sm transition-all hover:bg-cyan-500/20">
                                        <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest cursor-pointer">
                                            1G = ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={customPricePerGram}
                                            onChange={(e) => setCustomPricePerGram(Number(e.target.value))}
                                            step="0.01"
                                            className="w-14 bg-transparent text-sm font-black text-cyan-600 dark:text-cyan-400 outline-none p-0 m-0 border-b border-transparent focus:border-cyan-500/50 transition-colors"
                                            title="Edit price per gram (Admin Only)"
                                        />
                                    </div>
                                )}
                            </h3>
                            <div className="space-y-4 mb-6">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Material</label>
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
                                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-cyan-500/50"
                                                            : "bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
                                                )}
                                            >
                                                <span className={cn(!isAvailable && "line-through decoration-slate-500/50 decoration-2")}>
                                                    {m}
                                                </span>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Color</label>
                                    <div className="flex gap-2">
                                        {(settings?.colors ? Object.keys(settings.colors).filter(hex => settings.colors[hex].isAvailable) : ['#2563eb', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000']).map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorChange(c)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                                    selectedFile?.color === c 
                                                        ? "border-slate-900 dark:border-white scale-110" 
                                                        : c === '#ffffff' 
                                                            ? "border-slate-200 dark:border-transparent" 
                                                            : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                                aria-label={`Select color ${c}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Quantity</label>
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-300 dark:border-slate-700">
                                        <button
                                            onClick={() => {
                                                if (!selectedFile) return;
                                                const newQty = Math.max(1, selectedFile.quantity - 1);
                                                setUploadedFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, quantity: newQty } : f));
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-200 dark:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        </button>
                                        <span className="w-10 text-center font-bold text-slate-900 dark:text-white">{selectedFile?.quantity || 1}</span>
                                        <button
                                            onClick={() => {
                                                if (!selectedFile) return;
                                                const newQty = (selectedFile.quantity || 1) + 1;
                                                setUploadedFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, quantity: newQty } : f));
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-200 dark:bg-slate-700 rounded-md transition-colors"
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
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Infill Pattern</label>
                                    <div className="grid grid-cols-4 gap-2">
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
                                                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                                                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700 hover:border-slate-400 dark:border-slate-600"
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
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-400 block">Density</label>
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
                                            ...[5, 10, 15, 20, 50, 70, 100].map(val => ({ value: String(val), label: `${val}%` })),
                                            { value: 'custom', label: 'Custom' }
                                        ]}
                                        className="flex-1"
                                        noScroll
                                    />

                                    {isCustomDensity && (
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={infillPercent}
                                                onChange={(e) => setInfillPercent(Math.min(100, Math.max(1, Number(e.target.value))))}
                                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-700 dark:text-slate-500">%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                                {/* Detailed Item Breakdown (Model Wise) */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mb-6 space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Model Wise breakdown</h4>
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
                                                    settings || undefined,
                                                    isAdminMode ? customPricePerGram : undefined
                                                ) : null;

                                                if (!res) return null;

                                                const activePrice = file.customPriceOverride !== undefined ? file.customPriceOverride : res.price;
                                                const itemTotal = activePrice * file.quantity;
                                                const dimString = file.dimensions
                                                    ? `${(file.dimensions.x * file.scale).toFixed(1)} × ${(file.dimensions.y * file.scale).toFixed(1)} × ${(file.dimensions.z * file.scale).toFixed(1)} mm`
                                                    : '--';

                                                return (
                                                    <div key={file.id} className="text-[11px] pb-2 border-b border-slate-200 dark:border-white/5">
                                                        <div className="grid grid-cols-12 gap-2 items-start">
                                                            <div className="col-span-7">
                                                                <div className="font-bold text-slate-900 dark:text-slate-300 truncate">
                                                                    {idx + 1}. {file.file.name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-600 dark:text-slate-500 mt-0.5">
                                                                    {dimString}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 text-center text-slate-700 dark:text-slate-400">
                                                                Nos {file.quantity}
                                                            </div>
                                                            <div className="col-span-3 text-right text-cyan-400 font-black">
                                                                {isAdminMode ? (
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-1 focus-within:ring-1 ring-cyan-500 transition-shadow mt-[-4px]">
                                                                            <span className="text-[10px] text-slate-500">₹</span>
                                                                            <input 
                                                                                type="number"
                                                                                value={file.customPriceOverride !== undefined ? file.customPriceOverride : res.price}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                                                    setUploadedFiles(prev => prev.map(f => f.id === file.id ? { ...f, customPriceOverride: val } : f));
                                                                                }}
                                                                                className="w-16 bg-transparent text-[11px] font-black text-cyan-500 text-right outline-none p-0 m-0"
                                                                                title="Override individual model price"
                                                                            />
                                                                        </div>
                                                                        {file.quantity > 1 && (
                                                                            <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Total: ₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    `₹${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                )}
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
                                        {/* Tiered Discount Bar - Always Visible */}
                                        {applyVolumeReward && (() => {
                                            const tiers = settings?.discountTiers?.length ? settings.discountTiers : [
                                                { threshold: 1500, percentage: 5 },
                                                { threshold: 2500, percentage: 10 },
                                                { threshold: 3500, percentage: 20 }
                                            ];
                                            const currentPrice = totalResults?.subtotal || 0;
                                            const nextTier = [...tiers].sort((a, b) => a.threshold - b.threshold).find(t => currentPrice < t.threshold);
                                            const maxThreshold = tiers[tiers.length - 1].threshold * 1.1;
                                            
                                            return (
                                                <div className="space-y-3 mb-8 bg-slate-50 dark:bg-slate-900/50 pt-12 pb-10 px-4 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-inner relative overflow-visible">
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-end mb-1">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Volume Rewards</span>
                                                        {nextTier ? (
                                                            <span className="text-[10px] font-bold text-cyan-500 uppercase italic animate-pulse">
                                                                Add ₹{(nextTier.threshold - currentPrice).toFixed(0)} more for {nextTier.percentage}% OFF!
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-emerald-500 uppercase italic">MAX DISCOUNT UNLOCKED!</span>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <div className="h-3 w-full bg-white dark:bg-slate-950 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-sm">
                                                            {/* Track progress */}
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-1000 ease-out relative"
                                                                style={{ width: `${Math.min(100, (currentPrice / maxThreshold) * 100)}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                                                            </div>
                                                        </div>

                                                        {/* Tier Markers - Split: Offer Top, Price Bottom */}
                                                        {tiers.map((tier, idx) => {
                                                            const leftPos = (tier.threshold / maxThreshold) * 100;
                                                            const isAchieved = currentPrice >= tier.threshold;
                                                            return (
                                                                <div key={idx} className="absolute top-0 bottom-0 w-px" style={{ left: `${leftPos}%` }}>
                                                                    {/* Marker Dot */}
                                                                    <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-20 transition-all duration-500 ${isAchieved ? 'bg-emerald-400 border-white shadow-[0_0_15px_rgba(52,211,153,1)]' : 'bg-slate-300 border-slate-100 dark:border-slate-900'}`} />
                                                                    
                                                                    {/* OFFER - ABOVE */}
                                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAchieved ? 'text-emerald-500 scale-110' : 'text-slate-500'} transition-all`}>
                                                                            {tier.percentage}% OFF
                                                                        </span>
                                                                    </div>

                                                                    {/* PRICE - BELOW */}
                                                                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                        <span className={`text-[11px] font-black tracking-tight ${isAchieved ? 'text-emerald-600/80' : 'text-slate-400'} transition-all`}>
                                                                            ₹{tier.threshold.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="pt-6" />
                                                </div>
                                            );
                                        })()}

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-700 dark:text-slate-400 font-bold">Subtotal</span>
                                            {isCalculating ? (
                                                <Skeleton variant="text" width={120} height={28} />
                                            ) : (
                                                <span className="text-xl font-black text-slate-500">
                                                    ₹{(totalResults?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Volume Reward Discount Display */}
                                        {totalResults?.tier && !appliedCoupon && (
                                            <div className="flex justify-between items-center text-sm text-emerald-500 font-black animate-in fade-in slide-in-from-right duration-500">
                                                <span className="uppercase tracking-widest text-[10px]">Volume Reward ({totalResults.tier.percentage}%)</span>
                                                <span>- ₹{totalResults.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center text-sm text-green-500 font-black animate-in fade-in slide-in-from-right duration-500">
                                                <span className="uppercase tracking-widest text-[10px]">Coupon Discount ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : 'Fixed'})</span>
                                                <span>- ₹{(totalResults?.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        {showCelebration && (
                                            <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
                                                <DotLottieReact
                                                    src="https://lottie.host/0cd5b8a6-a751-4c86-a698-96d3d4228271/3D8mhnU1H0.lottie"
                                                    autoplay
                                                    className="w-full h-full max-w-2xl opacity-80"
                                                />
                                            </div>
                                        )}

                                        {totalResults?.shipping !== undefined && (
                                            <div className="flex justify-between items-center text-[12.5px] font-bold">
                                                <span className="text-slate-700 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider">Handling</span>
                                                <span className="text-slate-900 dark:text-slate-200">
                                                    ₹{(totalResults?.shipping || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center text-[12.5px] font-bold">
                                            <span className="text-slate-700 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider">Round off</span>
                                            <span className={(() => {
                                                const total = totalResults?.grandTotal || 0;
                                                const rounded = Math.round(total);
                                                const diff = rounded - total;
                                                return diff === 0 ? "text-slate-700 dark:text-slate-400 text-[10px] uppercase font-medium" : "text-slate-900 dark:text-slate-200";
                                            })()}>
                                                {(() => {
                                                    const total = totalResults?.grandTotal || 0;
                                                    const rounded = Math.round(total);
                                                    const diff = rounded - total;
                                                    if (diff === 0) {
                                                        return 'Zero Rupees Only';
                                                    }
                                                    return `${diff >= 0 ? '+' : '-'} ₹${Math.abs(diff).toFixed(2)}`;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-300 dark:border-slate-700/50 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-700 dark:text-slate-300 font-bold">Estimated Total</span>
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                    ₹{Math.round(totalResults?.grandTotal || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className="text-[10px] text-slate-600 dark:text-slate-500 uppercase">
                                                    {numberToWords(Math.round(totalResults?.grandTotal || 0))}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Admin Volume Reward Toggle */}
                                        {isAdminMode && (
                                            <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-800/50 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="apply-volume-reward"
                                                        checked={applyVolumeReward}
                                                        onChange={(e) => setApplyVolumeReward(e.target.checked)}
                                                        className="appearance-none w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                    />
                                                    <label htmlFor="apply-volume-reward" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        Apply Volume Reward
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Coupon Code */}
                                        <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-800/50 mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="use-coupon"
                                                    checked={useCoupon}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setUseCoupon(checked);
                                                        if (!checked) {
                                                            setAppliedCoupon(null);
                                                            setCouponCode('');
                                                            setCouponError('');
                                                        }
                                                    }}
                                                    className="appearance-none w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                />
                                                <label htmlFor="use-coupon" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    Apply Coupon Code
                                                </label>
                                            </div>
                                            {useCoupon && (
                                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                            placeholder="ENTER CODE"
                                                            className={cn(
                                                                "flex-1 bg-white dark:bg-slate-950 border rounded-lg px-3 py-2 text-xs font-mono tracking-widest focus:outline-none focus:border-cyan-500",
                                                                couponError ? "border-red-500/50" : (appliedCoupon ? "border-green-500/50" : "border-slate-200 dark:border-slate-800")
                                                            )}
                                                        />
                                                        <button 
                                                            onClick={handleApplyCoupon}
                                                            disabled={isApplyingCoupon || !couponCode}
                                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider disabled:opacity-50"
                                                        >
                                                            {isApplyingCoupon ? '...' : (appliedCoupon ? 'Applied' : 'Apply')}
                                                        </button>
                                                    </div>
                                                    {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                                                    {appliedCoupon && (
                                                        <p className="text-[10px] text-green-500 font-bold">
                                                            Discount Applied: {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isPaymentAccepted}
                                                    onChange={(e) => setIsPaymentAccepted(e.target.checked)}
                                                    className="mt-1 peer appearance-none w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                />
                                                <div className="text-xs text-slate-700 dark:text-slate-300">
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
                                                    className="mt-1 peer appearance-none w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                                />
                                                <div className="text-xs text-slate-700 dark:text-slate-300">
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
                                            disabled={!totalResults || (!isAdminMode && (!isPaymentAccepted || !isTermsAccepted))}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-4"
                                        >
                                            {isAdminMode ? 'Generate Offline Quotation' : 'Proceed with Order'}
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
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        {isSending && (
                            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
                                <div className="relative w-72 h-72 max-w-full flex items-center justify-center mb-4">
                                    <DotLottieReact
                                        src="https://lottie.host/b072fe0b-2f02-4ab0-9091-875a4204dff8/za5tOt9uj4.lottie"
                                        autoplay
                                        loop
                                        className="w-full h-full"
                                    />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2 italic">
                                    {uploadStatus}
                                </h3>
                                <p className="text-cyan-600 dark:text-cyan-400 font-black text-sm uppercase tracking-widest mb-3">
                                    Progress: {uploadProgress}%
                                </p>
                                <div className="w-56 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner border border-slate-300 dark:border-slate-750">
                                    <div
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-4 max-w-xs uppercase font-bold tracking-widest animate-pulse">
                                    Securing your payload... Please do not close this window.
                                </p>
                            </div>
                        )}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
                            <button onClick={() => setOrderStep('form')} className="text-cyan-400 font-bold">Back</button>
                            <span className="font-bold text-slate-900 dark:text-white">Quotation Preview</span>
                        </div>

                        <div
                            ref={previewContainerRef}
                            className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 bg-slate-100 custom-scrollbar flex flex-col items-center"
                            onScroll={handleScroll}
                        >
                            {/* Standalone Quotation Template Component */}
                             <div 
                                className="origin-top transition-transform duration-300 shadow-2xl mb-8"
                                style={{ 
                                    transform: `scale(${previewScale})`,
                                    width: `${794 * previewScale}px`,
                                    height: `${1123 * previewScale}px`,
                                    minHeight: `${1123 * previewScale}px`
                                }}
                             >
                                <QuotationDocument
                                    quoteId={quoteDetails.id}
                                    date={quoteDetails.date}
                                    dueDate={quoteDetails.dueDate}
                                    client={{
                                        name: userDetails.name || 'name',
                                        details: 'customer details, phone number',
                                        address: `${userDetails.doorNo}, ${userDetails.street}, ${userDetails.area}, ${userDetails.city} - ${userDetails.pincode}`,
                                        email: userDetails.email || 'mail ID',
                                        phone: `${userDetails.countryCode}${userDetails.phone}`
                                    }}
                                    items={detailedItems.map(item => ({
                                        name: item.name,
                                        description: `${material} • ${infillPercent}% • ${item.dimensions ? `${(item.dimensions.x * item.scale).toFixed(1)}x${(item.dimensions.y * item.scale).toFixed(1)}x${(item.dimensions.z * item.scale).toFixed(1)}` : '--'}mm • ${item.volume.toFixed(1)}g`,
                                        price: item.price,
                                        quantity: item.quantity,
                                        total: item.total,
                                        color: item.color,
                                        id: item.id
                                    }))}
                                    totalAmount={totalResults?.grandTotal || 0}
                                    totalQty={uploadedFiles.reduce((acc, f) => acc + f.quantity, 0)}
                                    material={material}
                                    infillPercent={infillPercent}
                                    infillPattern={infillPattern}
                                    discount={totalResults?.discount || 0}
                                    shippingCost={totalResults?.shipping || 0}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                            <button
                                onClick={() => setOrderStep('form')}
                                className="text-slate-900 dark:text-slate-400 hover:text-cyan-500 font-bold px-6 flex items-center gap-2 group transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                                Edit Details
                            </button>
                            <div className="flex flex-col w-full">
                                {isSending && (
                                    <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{uploadStatus}</span>
                                            <span className="text-slate-900 dark:text-white font-black text-sm">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    {(function() {
                                        const handleFinalSubmission = async (isCheckout: boolean) => {
                                            setIsSending(true);
                                            setUploadProgress(5);
                                            setUploadStatus('Uploading Models...');

                                            try {
                                                let uploadedUrls: string[] = [];
                                                for (let i = 0; i < uploadedFiles.length; i++) {
                                                    const fileData = uploadedFiles[i];
                                                    const formData = new FormData();
                                                    formData.append('file', fileData.file);
                                                    formData.append('quotationID', quoteDetails.id);
                                                    formData.append('rootFolder', rootFolder);
                                                    const response = await fetch('/api/upload-to-mega', { method: 'POST', body: formData });
                                                    const result = await response.json();
                                                    if (!result.success) throw new Error(result.error || "Upload failed");
                                                    uploadedUrls.push(result.data.url);
                                                    setUploadProgress(10 + ((i + 1) / uploadedFiles.length) * 50);
                                                    if (i < uploadedFiles.length - 1) await new Promise(r => setTimeout(r, 2000));
                                                }

                                                setUploadStatus('Generating & Uploading PDF...');
                                                const pdfBlob = await generatePDFBlob();
                                                let pdfUrl = '';
                                                if (pdfBlob) {
                                                    const pdfFormData = new FormData();
                                                    pdfFormData.append('file', pdfBlob, `VQ-${quoteDetails.id}.pdf`);
                                                    pdfFormData.append('quotationID', quoteDetails.id);
                                                    pdfFormData.append('rootFolder', rootFolder);
                                                    const pdfRes = await fetch('/api/upload-to-mega', { method: 'POST', body: pdfFormData });
                                                    const pdfData = await pdfRes.json();
                                                    if (pdfData.success) {
                                                        pdfUrl = pdfData.data.url;
                                                        setUploadedPdfUrl(pdfUrl);
                                                    }
                                                }

                                                const fullAddress = `${userDetails.doorNo}, ${userDetails.street}, ${userDetails.area}, ${userDetails.city}, ${userDetails.district} - ${userDetails.pincode}, ${userDetails.state}`;
                                                
                                                if (!isCheckout) {
                                                    setUploadStatus('Sending Quotation Email...');
                                                    await fetch('/api/send-quote', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            user: { ...userDetails, address: fullAddress },
                                                            recaptchaToken: recaptchaToken || 'offline_bypass',
                                                            order: {
                                                                id: quoteDetails.id,
                                                                pdfUrl,
                                                                models: detailedItems.map((item, i) => ({ ...item, fileUrl: uploadedUrls[i] })),
                                                                total: {
                                                                    subtotal: totalResults?.subtotal || 0,
                                                                    shipping: totalResults?.shipping || 0,
                                                                    discount: totalResults?.discount || 0,
                                                                    grandTotal: totalResults?.grandTotal || 0,
                                                                },
                                                                material, infillPercent, infillPattern
                                                            }
                                                        })
                                                    });
                                                }

                                                if (isCheckout) {
                                                    setUploadStatus('Initializing Payment...');
                                                    const cashfreeRes = await fetch('/api/create-order', {
                                                         method: 'POST',
                                                         headers: { 'Content-Type': 'application/json' },
                                                         body: JSON.stringify({
                                                             totalAmount: Math.round(totalResults?.grandTotal || 0),
                                                             customerName: userDetails.name,
                                                             email: userDetails.email,
                                                             phone: `${userDetails.countryCode}${userDetails.phone}`,
                                                             trackingId: quoteDetails.id,
                                                             address: fullAddress,
                                                             message: userDetails.message,
                                                             recaptchaToken: recaptchaToken || 'offline_bypass',
                                                             pdfUrl,
                                                             megaFolderUrl: uploadedFolderUrl,
                                                             items: detailedItems.map((item, i) => ({
                                                                 id: item.id,
                                                                 name: item.name,
                                                                 quantity: item.quantity,
                                                                 price: item.price,
                                                                 total: item.total,
                                                                 selectedColor: item.color,
                                                                 fileUrl: uploadedUrls[i],
                                                                 dimensions: item.dimensions,
                                                                 scale: item.scale,
                                                                 description: `${material} • ${infillPercent}% • ${item.dimensions ? `${(item.dimensions.x * item.scale).toFixed(1)}x${(item.dimensions.y * item.scale).toFixed(1)}x${(item.dimensions.z * item.scale).toFixed(1)}` : '--'}mm • ${item.volume.toFixed(1)}g`
                                                             })),
                                                             shipping: totalResults?.shipping || 0,
                                                             discount: totalResults?.discount || 0,
                                                             subtotal: totalResults?.subtotal || 0,
                                                             roundOff: (Math.round(totalResults?.grandTotal || 0)) - ((totalResults?.subtotal || 0) - (totalResults?.discount || 0) + (totalResults?.shipping || 0))
                                                         })
                                                     });
                                                    const cashfreeData = await cashfreeRes.json();
                                                    if (!cashfreeData.success || !cashfreeData.payment_session_id) {
                                                        throw new Error(cashfreeData.error || "Failed to initialize payment session.");
                                                    }
                                                    await redirectToCashfree(cashfreeData.payment_session_id, quoteDetails.id);
                                                } else {
                                                    if (pdfBlob) {
                                                        const url = URL.createObjectURL(pdfBlob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `VQ_${quoteDetails.id}.pdf`;
                                                        link.click();
                                                    }
                                                    setOrderStep('success');
                                                }
                                            } catch (err: any) {
                                                alert(err.message || "An error occurred");
                                            } finally {
                                                setIsSending(false);
                                            }
                                        };

                                        return (
                                            <>
                                                <button
                                                    onClick={() => handleFinalSubmission(false)}
                                                    disabled={isSending}
                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                    Download Quotation Only
                                                </button>
                                                {session ? (
                                                    <button
                                                        onClick={() => handleFinalSubmission(true)}
                                                        disabled={isSending}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                                        Proceed with Checkout
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => signIn('google')}
                                                        className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-3 border border-slate-200"
                                                    >
                                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                                        Sign in to Checkout
                                                    </button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}


        {orderStep === 'success' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full relative z-10">
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
                                    area: '',
                                    city: '',
                                    district: '',
                                    state: '',
                                    pincode: '',
                                    message: ''
                                });
                            }}
                            className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-white transition-colors p-1 z-30"
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
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quote Sent Successfully! 🎉</h2>
                            <p className="text-slate-700 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                                We have sent the quotation summary to <b>{userDetails.email}</b>. Our team will review the files and contact you shortly.
                            </p>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={`https://wa.me/${userDetails.countryCode.replace('+', '')}${userDetails.phone}?text=Hi, I just requested a quote (ID: ${orderId}) for ${uploadedFiles.reduce((acc, f) => acc + f.quantity, 0)} items across ${uploadedFiles.length} models.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 w-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    Contact on WhatsApp
                                </a>

                                {uploadedPdfUrl && (
                                    <a
                                        href={uploadedPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-14 w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg shadow-cyan-500/10"
                                    >
                                        <FileText size={16} />
                                        Preview Official Quotation
                                    </a>
                                )}
                                {uploadedFolderUrl && (
                                    <a
                                        href={uploadedFolderUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 flex h-14 w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg shadow-cyan-500/10"
                                    >
                                        <FileText size={16} />
                                        View Folder
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Info Modal */}
            {showPaymentInfo && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowPaymentInfo(false)}>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full overscroll-behavior-contain" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payment Details</h3>
                        <div className="space-y-3 text-sm text-slate-800 dark:text-slate-300">
                            <p>To start the manufacturing process, we require <strong>100% advance payment</strong>.</p>

                            {/* Shipping Notice */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                                <h4 className="font-bold text-amber-500 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    Shipping Cost Not Included
                                </h4>
                                <p className="text-slate-700 dark:text-slate-300">The quoted price covers <strong>manufacturing only</strong>. Shipping charges will be communicated to you via <strong className="text-[#25D366]">WhatsApp</strong> based on your delivery location.</p>
                                <a
                                    href="https://wa.me/918903595542?text=Hi, I'd like to know the shipping cost for my order."
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 mt-1 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg text-[#25D366] font-bold text-xs hover:bg-[#25D366]/20 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    Chat with us on WhatsApp
                                </a>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-1">
                                <h4 className="font-semibold text-cyan-400 mb-1">Order Notes</h4>
                                <p>• Payment is processed securely via our payment gateway.</p>
                                <p>• Your order will be confirmed within 24 hours of payment.</p>
                                <p>• You will receive tracking details via email once shipped.</p>
                                <p>• Estimated delivery: 10–14 working days after dispatch.</p>
                            </div>
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
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowTermsInfo(false)}>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto overscroll-behavior-contain" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Terms & Conditions</h3>
                        <div className="space-y-4 text-sm text-slate-800 dark:text-slate-300">
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
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowContactForm(false)}>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-behavior-contain" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Details</h3>
                        <form onSubmit={handleContactSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.name}
                                        onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Email Address *</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.email}
                                        onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shrink-0"
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
                                            className="w-[180px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
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
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Pincode *</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.pincode}
                                        onChange={handlePincodeChange}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Door No / Building *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.doorNo}
                                        onChange={e => setUserDetails({ ...userDetails, doorNo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Street *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.street}
                                        onChange={e => setUserDetails({ ...userDetails, street: e.target.value })}
                                        placeholder="Main Road, Cross Street..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Area / Landmark *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.area}
                                        onChange={e => setUserDetails({ ...userDetails, area: e.target.value })}
                                        placeholder="Fetched automatically"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">City</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.city}
                                        onChange={e => setUserDetails({ ...userDetails, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">District</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.district}
                                        onChange={e => setUserDetails({ ...userDetails, district: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">State</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        value={userDetails.state}
                                        onChange={e => setUserDetails({ ...userDetails, state: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-400">Message / Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                                        value={userDetails.message}
                                        onChange={e => setUserDetails({ ...userDetails, message: e.target.value })}
                                        placeholder="Any additional information or special requirements..."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-center mt-6">
                                {!isAdminMode && <Recaptcha onChange={setRecaptchaToken} />}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowContactForm(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!recaptchaToken && process.env.NODE_ENV === 'production'}
                                    className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {recaptchaToken ? 'Generate Quotation' : 'Loading Verification...'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
