/**
 * Shipping Calculator Utility
 * Origin: Coimbatore, Tamil Nadu (641034)
 */

export interface ShippingDimensions {
    length: number; // in cm
    width: number;  // in cm
    height: number; // in cm
}

export interface ShippingProduct {
    weight: number;    // in grams
    dimensions: ShippingDimensions;
    quantity: number;
}

export interface ShippingDetails {
    baseCharge: number;
    weightCharge: number;
    totalShipping: number;
    isFreeShipping: boolean;
    estimatedDays: string;
    chargeableWeightKg: number;
    region: string;
}

const ORIGIN_PINCODE = "641034";

const SOUTH_INDIA_STATES = [
    "KERALA", "KARNATAKA", "ANDHRA PRADESH", "TELANGANA"
];

const PACKAGING_EXTRA_WEIGHT = 100; // Average 100g
const PACKAGING_DIMENSION_PADDING = 2; // 2cm padding total

export function calculateShipping(
    products: ShippingProduct[],
    state: string,
    orderAmount: number,
    pincode?: string
): ShippingDetails {
    // 1. Coimbatore North local pincode: free shipping
    if (pincode === "641034") {
        return {
            baseCharge: 0,
            weightCharge: 0,
            totalShipping: 0,
            isFreeShipping: true,
            estimatedDays: getEstimatedDays(state, pincode),
            chargeableWeightKg: 0,
            region: getRegion(state, pincode)
        };
    }

    // 2. Free shipping check
    if (orderAmount >= 999) {
        return {
            baseCharge: 0,
            weightCharge: 0,
            totalShipping: 0,
            isFreeShipping: true,
            estimatedDays: getEstimatedDays(state, pincode),
            chargeableWeightKg: 0,
            region: getRegion(state, pincode)
        };
    }

    let totalActualWeight = 0;
    let totalVolumetricWeight = 0;

    products.forEach(p => {
        // Actual Weight including packaging
        const actualWeightPerUnit = p.weight + PACKAGING_EXTRA_WEIGHT;
        totalActualWeight += actualWeightPerUnit * p.quantity;

        // Volumetric Weight: (L x W x H) / 5000
        const l = p.dimensions.length + PACKAGING_DIMENSION_PADDING;
        const w = p.dimensions.width + PACKAGING_DIMENSION_PADDING;
        const h = p.dimensions.height + PACKAGING_DIMENSION_PADDING;
        const volWeightPerUnit = (l * w * h) / 5000 * 1000; // Convert to grams
        totalVolumetricWeight += volWeightPerUnit * p.quantity;
    });

    const chargeableWeightGrams = Math.max(totalActualWeight, totalVolumetricWeight);
    const chargeableWeightKg = Math.ceil(chargeableWeightGrams / 1000);

    const region = getRegion(state, pincode);
    
    // Calculate dynamic handling fee based on part/model sizes
    let baseCharge = 0;
    products.forEach(p => {
        const length = p.dimensions?.length || 15;
        const width = p.dimensions?.width || 15;
        const height = p.dimensions?.height || 10;
        
        const maxDimOriginal = Math.max(length, width, height);
        // Convert to cm if it's in mm (if max dimension > 35, it's in mm)
        const maxDimCm = maxDimOriginal > 35 ? maxDimOriginal / 10 : maxDimOriginal;
        
        // Handling fee between 40 and 250 depends on the model size in cm
        const minSize = 2; // 2cm
        const maxSize = 30; // 30cm
        const minFee = 40;
        const maxFee = 250;
        
        let modelFee = minFee;
        if (maxDimCm > minSize) {
            modelFee = minFee + ((maxDimCm - minSize) / (maxSize - minSize)) * (maxFee - minFee);
        }
        modelFee = Math.min(maxFee, Math.max(minFee, Math.round(modelFee)));
        
        baseCharge += modelFee * p.quantity;
    });

    const weightCharge = 0; // only use the handling fee (baseCharge), do not include shipping cost (weightCharge)
    const totalShipping = Number(baseCharge) || 0;

    return {
        baseCharge: Number(baseCharge) || 0,
        weightCharge: 0,
        totalShipping: isNaN(totalShipping) ? baseCharge : totalShipping,
        isFreeShipping: false,
        estimatedDays: getEstimatedDays(state, pincode),
        chargeableWeightKg,
        region
    };
}

function getRegion(state: string, pincode?: string): string {
    if (pincode === ORIGIN_PINCODE) return "LOCAL";
    const normalized = state.trim().toUpperCase();
    if (normalized === "TAMIL NADU" || normalized === "TN") return "TAMIL NADU";
    if (SOUTH_INDIA_STATES.includes(normalized)) return "SOUTH INDIA";
    return "OTHER";
}

function getEstimatedDays(state: string, pincode?: string): string {
    const region = getRegion(state, pincode);
    if (region === "LOCAL") return "1-2 Working Days";
    if (region === "TAMIL NADU") return "3-5 Working Days";
    if (region === "SOUTH INDIA") return "3-6 Working Days";
    return "3-7 Working Days";
}
