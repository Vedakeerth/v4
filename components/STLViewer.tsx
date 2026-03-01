'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import {
    ZoomIn, ZoomOut,
    Box, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface STLViewerProps {
    file: File | null;
    color: string;
    onStatsCalculated?: (stats: { volumeCm3: number; surfaceAreaMm2: number; heightMm: number }) => void;
    onDimensionsCalculated?: (dimensions: { x: number; y: number; z: number }) => void;
    scale: number;
    onScaleChange: (scale: number) => void;
    uploadedCount?: number;
}

function ViewControls({ onScale, scale }: { onScale: (val: number) => void; scale: number }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState((scale * 100).toFixed(0));

    useEffect(() => {
        setEditValue((scale * 100).toFixed(0));
    }, [scale]);

    const handleBlur = () => {
        setIsEditing(false);
        const val = parseFloat(editValue);
        if (!isNaN(val)) {
            onScale(Math.min(3.0, Math.max(0.1, val / 100)));
        } else {
            setEditValue((scale * 100).toFixed(0));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue((scale * 100).toFixed(0));
        }
    };

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/90 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700 shadow-xl z-20">
            <span className="text-xs text-slate-400 font-medium">Scale</span>
            <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => onScale(parseFloat(e.target.value))}
                className="w-32 accent-cyan-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="w-16 flex items-center justify-end">
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="w-10 bg-slate-800 border-b border-cyan-500 text-xs font-bold text-cyan-400 outline-none text-right px-0.5"
                        />
                        <span className="text-[10px] text-cyan-500/50">%</span>
                    </div>
                ) : (
                    <span
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-bold text-cyan-400 cursor-text hover:bg-slate-800/50 px-1 rounded transition-colors"
                    >
                        {(scale * 100).toFixed(0)}%
                    </span>
                )}
            </div>
            <button
                onClick={() => onScale(1)}
                className="ml-1 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 transition-all border border-slate-700 active:scale-95 flex items-center justify-center shrink-0"
                title="Reset Scale"
            >
                <RotateCcw size={14} />
            </button>
        </div>
    );
}

// Component inside Canvas to sync zoom continuously
function ZoomSync({ controlsRef, onZoomChange }: { controlsRef: React.RefObject<any>; onZoomChange: (zoom: number) => void }) {
    const lastZoomRef = useRef<number>(-1);

    useFrame(() => {
        if (!controlsRef.current) return;

        const controls = controlsRef.current;
        const distance = controls.object.position.distanceTo(controls.target);
        const min = controls.minDistance;
        const max = controls.maxDistance;

        // Logarithmic mapping for more natural feel
        const normalized = 100 - ((Math.log(distance) - Math.log(min)) / (Math.log(max) - Math.log(min)) * 100);
        const clampedZoom = Math.min(100, Math.max(0, normalized));

        // Only update if zoom changed significantly (more than 0.5 to avoid excessive updates)
        if (Math.abs(clampedZoom - lastZoomRef.current) > 0.5) {
            lastZoomRef.current = clampedZoom;
            onZoomChange(clampedZoom);
        }
    });

    return null;
}

function ZoomSlider({ controlsRef, zoom, onZoomUpdate }: { controlsRef: React.RefObject<any>; zoom: number; onZoomUpdate: (zoom: number) => void }) {

    const handleZoomChange = (val: number) => {
        if (!controlsRef.current) return;
        const controls = controlsRef.current;
        const min = controls.minDistance;
        const max = controls.maxDistance;

        // Inverse logarithmic mapping
        const t = (100 - val) / 100;
        const distance = Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)));

        const direction = controls.object.position.clone().sub(controls.target).normalize();
        controls.object.position.copy(controls.target.clone().add(direction.multiplyScalar(distance)));
        controls.update();
        onZoomUpdate(val);
    };

    return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-slate-950/90 backdrop-blur-sm p-3 rounded-full border border-slate-700 shadow-xl z-20">
            <button
                onClick={() => handleZoomChange(Math.min(100, zoom + 10))}
                className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
            >
                <ZoomIn size={16} />
            </button>
            <div className="h-32 w-6 flex items-center justify-center relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                    className="h-full accent-cyan-500 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                />
            </div>
            <button
                onClick={() => handleZoomChange(Math.max(0, zoom - 10))}
                className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
            >
                <ZoomOut size={16} />
            </button>
        </div>
    );
}

function STLMesh({
    file,
    color,
    scale,
    onStatsCalculated,
    onDimensionsCalculated,
    onGeometryLoaded
}: {
    file: File;
    color: string;
    scale: number;
    onStatsCalculated?: (stats: { volumeCm3: number; surfaceAreaMm2: number; heightMm: number }) => void;
    onDimensionsCalculated?: (dimensions: { x: number; y: number; z: number }) => void;
    onGeometryLoaded?: (geometry: THREE.BufferGeometry) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [originalGeometry, setOriginalGeometry] = useState<THREE.BufferGeometry | null>(null);

    const calculateMetrics = useCallback((geo: THREE.BufferGeometry, currentScale: number) => {
        // Calculate volume on original geometry
        let volume = 0;
        let surfaceArea = 0;
        const position = geo.attributes.position;
        for (let i = 0; i < position.count; i += 3) {
            const v1 = new THREE.Vector3().fromBufferAttribute(position, i);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1);
            const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2);

            // Volume (Signed Tetrahedron Method)
            volume += v1.dot(v2.clone().cross(v3)) / 6;

            // Surface Area
            const edge1 = v2.clone().sub(v1);
            const edge2 = v3.clone().sub(v1);
            const faceArea = edge1.cross(edge2).length() / 2;
            surfaceArea += faceArea;
        }

        // Apply Scale to Metrics
        const scaledVolumeCm3 = (Math.abs(volume) * Math.pow(currentScale, 3)) / 1000;
        const scaledSurfaceAreaMm2 = surfaceArea * Math.pow(currentScale, 2);

        // Height (Z dimension)
        const size = new THREE.Vector3();
        geo.boundingBox!.getSize(size);
        const scaledHeightMm = size.z * currentScale;

        onStatsCalculated?.({
            volumeCm3: scaledVolumeCm3,
            surfaceAreaMm2: scaledSurfaceAreaMm2,
            heightMm: scaledHeightMm
        });
    }, [onStatsCalculated]);

    // Load Geometry
    useEffect(() => {
        if (!file) return;

        const loader = new STLLoader();
        const url = URL.createObjectURL(file);

        loader.load(
            url,
            (loadedGeometry) => {
                // Determine bounding box and center
                loadedGeometry.computeBoundingBox();
                loadedGeometry.computeVertexNormals();

                const box = loadedGeometry.boundingBox!;
                const center = new THREE.Vector3();
                box.getCenter(center);

                // Auto-Orient: Lay Flat
                // We want the smallest dimension to be the vertical (Y) axis
                const initialSize = new THREE.Vector3();
                box.getSize(initialSize);

                if (initialSize.x < initialSize.y && initialSize.x < initialSize.z) {
                    // X is smallest, rotate Z to bring X to Y
                    loadedGeometry.rotateZ(Math.PI / 2);
                } else if (initialSize.z < initialSize.y && initialSize.z < initialSize.x) {
                    // Z is smallest (typical Z-up model), rotate X to bring Z to Y
                    loadedGeometry.rotateX(-Math.PI / 2);
                }

                // Recompute BB after potential rotation
                loadedGeometry.computeBoundingBox();

                // Align to bottom (Y=0) and Center (X=0, Z=0)
                loadedGeometry.center(); // Centers BB at 0,0,0
                loadedGeometry.computeBoundingBox();
                const b = loadedGeometry.boundingBox!;
                // Move up so the lowest point (min.y) lies on the Y=0 plane
                loadedGeometry.translate(0, -b.min.y, 0);

                // Recompute BB after move to be safe
                loadedGeometry.computeBoundingBox();

                // Get Base Dimensions (Scale 100%)
                const size = new THREE.Vector3();
                loadedGeometry.boundingBox!.getSize(size);

                setOriginalGeometry(loadedGeometry); // Store original for scaling logic if needed
                onGeometryLoaded?.(loadedGeometry);

                // Initial Calculations (Scale 1)
                calculateMetrics(loadedGeometry, 1);

                // Pass BASE dimensions
                onDimensionsCalculated?.({
                    x: Math.round(size.x * 10) / 10,
                    y: Math.round(size.y * 10) / 10,
                    z: Math.round(size.z * 10) / 10
                });
            },
            undefined,
            (error) => console.error('Error loading STL:', error)
        );

        return () => {
            URL.revokeObjectURL(url);
            if (originalGeometry) originalGeometry.dispose();
        };

    }, [file, calculateMetrics, onDimensionsCalculated, onGeometryLoaded, originalGeometry]); // Removed originalGeometry from deps to avoid loop if it was there, though setOriginalGeometry is fine.

    // Handle Scaling Changes
    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.scale.set(scale, scale, scale);

            if (originalGeometry) {
                calculateMetrics(originalGeometry, scale);

                // Update dimensions for parent
                if (originalGeometry.boundingBox) {
                    const size = new THREE.Vector3();
                    originalGeometry.boundingBox.getSize(size);
                    onDimensionsCalculated?.({
                        x: Math.round(size.x * scale * 10) / 10,
                        y: Math.round(size.y * scale * 10) / 10,
                        z: Math.round(size.z * scale * 10) / 10
                    });
                }
            }
        }
    }, [scale, originalGeometry, calculateMetrics, onDimensionsCalculated]);

    if (!originalGeometry) return null;

    return (
        <mesh ref={meshRef} geometry={originalGeometry} castShadow receiveShadow>
            <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function CameraController({
    viewPosition,
    viewTarget,
    resetTrigger
}: {
    viewPosition: [number, number, number] | null;
    viewTarget: [number, number, number] | null;
    resetTrigger: number;
}) {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (viewPosition && viewTarget && controls) {
            camera.position.set(...viewPosition);
            (controls as any).target.set(...viewTarget);
            (controls as any).update();
        }
    }, [viewPosition, viewTarget]);

    return null;
}

export default function STLViewer({ file, color, onStatsCalculated, onDimensionsCalculated, scale, onScaleChange, uploadedCount = 0 }: STLViewerProps) {
    const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);
    const [viewPosition, setViewPosition] = useState<[number, number, number] | null>(null);
    const [viewTarget, setViewTarget] = useState<[number, number, number] | null>(null);
    const [resetTrigger, setResetTrigger] = useState(0);
    const [zoom, setZoom] = useState(50); // Normalized 0-100
    const controlsRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Camera Setup
    useEffect(() => {
        if (dimensions) {
            // Isometric view
            // eslint-disable-next-line
            setViewPosition([50, 50, 50]);
            setViewTarget([0, 0, 0]);
        }
    }, [dimensions]);

    const handleStatsCalculated = useCallback((stats: { volumeCm3: number; surfaceAreaMm2: number; heightMm: number }) => {
        onStatsCalculated?.(stats);
    }, [onStatsCalculated]);

    const handleDimensionsCalculated = useCallback((dims: { x: number; y: number; z: number }) => {
        setDimensions(dims);
        onDimensionsCalculated?.(dims);
    }, [onDimensionsCalculated]);

    // Reset view logic
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const handleResetView = useCallback(() => {
        onScaleChange(1);
        setResetTrigger(prev => prev + 1);
        if (dimensions) {
            setViewPosition([50, 50, 50]);
            setViewTarget([0, 0, 0]);
        }
    }, [dimensions, onScaleChange]);

    // Wheel event handler for container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            const canvas = container.querySelector('canvas');

            // Only handle if the event is within our container
            if (container.contains(target)) {
                // If the event is on the canvas, OrbitControls will handle zoom
                // We just need to prevent page scrolling
                if (target === canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    // For overlay elements, prevent scrolling but allow events to reach canvas if needed
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        };

        // Use bubble phase so canvas gets the event first, then we prevent parent scrolling
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    if (!file) {
        return (
            <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all text-center p-8 group">
                <div className="mb-4 rounded-full bg-slate-800 p-4 group-hover:bg-cyan-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-cyan-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Click to Upload STL Files</h3>
                <p className="text-sm text-slate-500 mt-2">or drag and drop below</p>
                <p className="text-xs text-slate-600 mt-4">Max size: 25MB per file • Max files: 5</p>
                <p className="text-xs text-slate-600 mt-1">Format: STL files only</p>
                <div className="mt-8 px-6 py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Uploaded Models ({uploadedCount}/5)
                    </span>
                </div>
            </div>
        );
    }

    // Calculate Scaled Dimensions for Display
    const scaledDims = dimensions ? {
        x: (dimensions.x * scale).toFixed(1),
        y: (dimensions.y * scale).toFixed(1),
        z: (dimensions.z * scale).toFixed(1)
    } : null;

    return (
        <div
            ref={containerRef}
            className="h-full w-full min-h-[500px] overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 relative group"
        >
            <Canvas
                shadows
                camera={{ position: [50, 50, 50], fov: 50 }}
                className="bg-slate-950"
            >
                <CameraController
                    viewPosition={viewPosition}
                    viewTarget={viewTarget}
                    resetTrigger={resetTrigger}
                />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

                <STLMesh
                    file={file}
                    color={color}
                    scale={scale}
                    onStatsCalculated={handleStatsCalculated}
                    onDimensionsCalculated={handleDimensionsCalculated}
                />

                <gridHelper args={[200, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />

                <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={10}
                    maxDistance={500}
                    enableZoom={true}
                    zoomSpeed={1.2}
                />
                <ZoomSync controlsRef={controlsRef} onZoomChange={setZoom} />
                <Environment preset="city" />
            </Canvas>

            {/* Dimensions Overlay (Top-Left) */}
            {scaledDims && (
                <div className="absolute top-4 left-4 bg-slate-950/90 px-4 py-3 rounded-lg text-xs text-slate-300 backdrop-blur-sm border border-slate-700 shadow-xl transition-all duration-300">
                    <div className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                        <Box size={14} /> Size ({scale !== 1 ? 'Scaled' : 'Original'})
                    </div>
                    <div className="space-y-1 font-mono">
                        <div className="flex justify-between gap-4"><span>L:</span> <span className="text-white font-bold">{scaledDims.x} mm</span></div>
                        <div className="flex justify-between gap-4"><span>W:</span> <span className="text-white font-bold">{scaledDims.y} mm</span></div>
                        <div className="flex justify-between gap-4"><span>H:</span> <span className="text-white font-bold">{scaledDims.z} mm</span></div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <ViewControls
                onScale={onScaleChange}
                scale={scale}
            />

            {/* Vertical Zoom Control */}
            <ZoomSlider controlsRef={controlsRef} zoom={zoom} onZoomUpdate={setZoom} />

            <div className="absolute bottom-4 right-4 bg-slate-950/80 px-3 py-1 rounded-full text-xs text-slate-400 backdrop-blur-sm pointer-events-none">
                3D Preview ⦁ by VAELINSA
            </div>
        </div>
    );
}
