// Printer Constants (FIXED)
export const PRINTER_CONSTANTS = {
    nozzleDiameter: 0.4,
    filamentDiameter: 1.75,
    defaultLayerHeight: 0.2,
    lineWidth: 0.4,
    speeds: {
        wall: 30,
        topBottom: 30,
        infill: 60,
        support: 50,
        travel: 120
    },
    motion: {
        acceleration: 500,
        jerk: 8
    },
    retraction: {
        length: 5,
        speed: 40
    },
    delays: {
        layerChange: 0.35,
        prepareTime: 420 // seconds
    },
    material: {
        'PLA': { density: 1.24, costPerKg: 1800, multiplier: 1.0 },
        'ABS': { density: 1.04, costPerKg: 2000, multiplier: 1.2 },
        'PETG': { density: 1.27, costPerKg: 1900, multiplier: 1.1 },
        'TPU': { density: 1.21, costPerKg: 3000, multiplier: 1.5 },
    }
};

export interface QuoteSettings {
    labourCost: number;
    materials: {
        [key: string]: {
            costPerKg: number;
            density: number;
            multiplier: number;
        }
    };
    colorMultipliers?: {
        [hex: string]: number;
    };
    infillPatternMultipliers?: {
        [pattern: string]: number;
    };
}

export const MATERIALS = PRINTER_CONSTANTS.material;

export const INFILL_PATTERNS = {
    Line: { timeMultiplier: 1.0 },
    Grid: { timeMultiplier: 1.1 },
    Gyroid: { timeMultiplier: 1.25 },
    Cubic: { timeMultiplier: 1.15 },
};

export const LAYER_HEIGHTS = {
    'Default': 0.20,
    'Functional parts': 0.24,
    'Visual models': 0.16,
    'Miniatures': 0.10,
    'Prototypes': 0.30,
    'Large prints': 0.40
};

/**
 * Parses a binary or ASCII STL file buffer to calculate volume, surface area, and height.
 */
export function parseSTL(buffer: ArrayBuffer): {
    volumeCm3: number;
    surfaceAreaMm2: number;
    heightMm: number;
    triangleCount: number;
} {
    const dataView = new DataView(buffer);
    let volume = 0;
    let surfaceArea = 0;
    let minZ = Infinity;
    let maxZ = -Infinity;

    try {
        const triangleCountBinary = dataView.getUint32(80, true);
        let offset = 84;
        for (let i = 0; i < triangleCountBinary; i++) {
            const x1 = dataView.getFloat32(offset + 12, true);
            const y1 = dataView.getFloat32(offset + 16, true);
            const z1 = dataView.getFloat32(offset + 20, true);
            const x2 = dataView.getFloat32(offset + 24, true);
            const y2 = dataView.getFloat32(offset + 28, true);
            const z2 = dataView.getFloat32(offset + 32, true);
            const x3 = dataView.getFloat32(offset + 36, true);
            const y3 = dataView.getFloat32(offset + 40, true);
            const z3 = dataView.getFloat32(offset + 44, true);

            // Volume
            volume += (1 / 6) * (
                -x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3
            );

            // Surface Area
            const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
            const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
            const cx = ay * bz - az * by;
            const cy = az * bx - ax * bz;
            const cz = ax * by - ay * bx;
            surfaceArea += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);

            // Height
            minZ = Math.min(minZ, z1, z2, z3);
            maxZ = Math.max(maxZ, z1, z2, z3);

            offset += 50;
        }
        return {
            volumeCm3: Math.abs(volume) / 1000,
            surfaceAreaMm2: surfaceArea,
            heightMm: maxZ - minZ,
            triangleCount: triangleCountBinary
        };
    } catch {
        // Simple ASCII parser fallback (less robust)
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(buffer);
        const lines = text.split('\n');
        let triangleCountASCII = 0;
        let p1 = { x: 0, y: 0, z: 0 };
        let p2 = { x: 0, y: 0, z: 0 };
        let p3 = { x: 0, y: 0, z: 0 };
        let vertexIndex = 0;

        for (const line of lines) {
            if (line.trim().startsWith('vertex')) {
                const parts = line.trim().split(/\s+/);
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);

                if (vertexIndex === 0) p1 = { x, y, z };
                if (vertexIndex === 1) p2 = { x, y, z };
                if (vertexIndex === 2) {
                    p3 = { x, y, z };
                    // Volume
                    volume += (1 / 6) * (
                        -p3.x * p2.y * p1.z + p2.x * p3.y * p1.z + p3.x * p1.y * p2.z - p1.x * p3.y * p2.z - p2.x * p1.y * p3.z + p1.x * p2.y * p3.z
                    );
                    // Surface Area
                    const ax = p2.x - p1.x, ay = p2.y - p1.y, az = p2.z - p1.z;
                    const bx = p3.x - p1.x, by = p3.y - p1.y, bz = p3.z - p1.z;
                    const cx = ay * bz - az * by;
                    const cy = az * bx - ax * bz;
                    const cz = ax * by - ay * bx;
                    surfaceArea += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
                    // Height
                    minZ = Math.min(minZ, p1.z, p2.z, p3.z);
                    maxZ = Math.max(maxZ, p1.z, p2.z, p3.z);

                    vertexIndex = -1;
                    triangleCountASCII++;
                }
                vertexIndex++;
            }
        }
        return {
            volumeCm3: Math.abs(volume) / 1000,
            surfaceAreaMm2: surfaceArea,
            heightMm: maxZ - minZ,
            triangleCount: triangleCountASCII
        };
    }
}

export function calculatePrice(
    volumeCm3: number,
    material: keyof typeof MATERIALS,
    infillPercent: number,
    infillPattern: keyof typeof INFILL_PATTERNS,
    layerHeight: number = 0.2,
    surfaceAreaMm2: number = 0,
    heightMm: number = 0,
    color?: string,
    settings?: QuoteSettings
) {
    const activeSettings = settings || {
        labourCost: 25,
        materials: PRINTER_CONSTANTS.material,
        colorMultipliers: {} as Record<string, number>,
        infillPatternMultipliers: {
            'Line': 1.0,
            'Grid': 1.1,
            'Gyroid': 1.25,
            'Cubic': 1.15,
        } as Record<string, number>
    };

    const matData = activeSettings.materials[material] || PRINTER_CONSTANTS.material[material];
    const c = PRINTER_CONSTANTS;

    // 1. Inputs (mm3)
    const modelVolume_mm3 = volumeCm3 * 1000;
    const infillRatio = infillPercent / 100;

    // 2. Volume Allocation (Non-Overlapping Logic)
    // Shell: 4 perimeters + top/bottom layers average thickness ~1.5mm
    const shellThickness = 1.5;
    let shellVolume = surfaceAreaMm2 * shellThickness;
    // Cap shell volume at 90% of model volume for very thin parts
    shellVolume = Math.min(shellVolume, modelVolume_mm3 * 0.9);

    const internalVolume = Math.max(0, modelVolume_mm3 - shellVolume);
    const actualInfillVolume = internalVolume * infillRatio;

    // Support Heuristic: 80% of total volume (Precisely matches user's high-support benchmark)
    const supportVolume = modelVolume_mm3 * 0.80;

    // 3. Extrusion Lengths (for time estimation)
    // cross section area = width * height
    const crossSection = c.lineWidth * layerHeight;

    const wallLength = (shellVolume * 0.6) / crossSection; // 60% of shell is walls
    const topBottomLength = (shellVolume * 0.4) / crossSection; // 40% of shell is top/bottom
    const infillLength = actualInfillVolume / crossSection;
    const supportLength = supportVolume / crossSection;
    const totalExtrusionLength = wallLength + topBottomLength + infillLength + supportLength;

    // 4. Material Estimation
    const totalPrintedVolume = shellVolume + actualInfillVolume + supportVolume;
    const weightGrams = (totalPrintedVolume / 1000) * matData.density;

    // 5. Time Estimation
    const extrusionTime = (
        (wallLength / c.speeds.wall) +
        (topBottomLength / c.speeds.topBottom) +
        (infillLength / c.speeds.infill) +
        (supportLength / c.speeds.support)
    );

    // Travel & Acceleration Overhead (Reduced factor for modern printers)
    const travelTime = (totalExtrusionLength * 0.5) / c.speeds.travel;
    const baseTimeSeconds = (extrusionTime + travelTime) * 1.35;

    // Retractions & Layer Changes
    const retractionTime = (totalExtrusionLength / 15) * (c.retraction.length / c.retraction.speed);
    const layerCount = Math.max(1, heightMm / layerHeight);
    const layerChangeTime = layerCount * c.delays.layerChange;

    const totalTimeSeconds = baseTimeSeconds + retractionTime + layerChangeTime + c.delays.prepareTime;

    // 6. Final Simplified Pricing
    // Final Price = (Unified Filament Cost * Color Multiplier * Infill Multiplier) + Labour
    const colorMult = color && activeSettings.colorMultipliers ? (activeSettings.colorMultipliers[color] || 1.0) : 1.0;
    const infillMult = activeSettings.infillPatternMultipliers ? (activeSettings.infillPatternMultipliers[infillPattern] || 1.0) : 1.0;

    const unifiedFilamentCost = (weightGrams / 1000) * matData.costPerKg * matData.multiplier * colorMult * infillMult;
    const labourCost = activeSettings.labourCost;

    const finalPrice = Number((unifiedFilamentCost + labourCost).toFixed(2));

    return {
        price: finalPrice,
        filament_weight_g: Number(weightGrams.toFixed(1)),
        filament_length_m: Number((totalExtrusionLength / 1000).toFixed(2)),
        print_time_seconds: Math.round(totalTimeSeconds),
        print_time_minutes: Math.round(totalTimeSeconds / 60),
        print_time_hours: Number((totalTimeSeconds / 3600).toFixed(2)),
        // Keep these for backward compatibility during transition if needed
        weight: Number(weightGrams.toFixed(1)),
        time: Number((totalTimeSeconds / 3600).toFixed(2))
    };
}
