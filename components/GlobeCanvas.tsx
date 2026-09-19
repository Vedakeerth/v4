"use client";

import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

// ── Types ─────────────────────────────────────────────────────────────────────
type Ring = number[][];
type GeoRings = Ring[][];

// ── Projection ────────────────────────────────────────────────────────────────
function project(lon: number, lat: number, rotDeg: number, R: number) {
  const l = ((lon + rotDeg) * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  const z = Math.cos(p) * Math.cos(l);
  return {
    x: Math.cos(p) * Math.sin(l) * R,
    y: -Math.sin(p) * R,
    visible: z > -0.08,
    depth: (z + 1) / 2,
  };
}

// ── Point-in-polygon (ray casting) ───────────────────────────────────────────
function pip(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function isOnLand(lon: number, lat: number, rings: Ring[]): boolean {
  return rings.some(ring => pip(lon, lat, ring));
}

interface GlobeCanvasProps {
  size?: number;
  className?: string;
}

export default function GlobeCanvas({ size = 720, className = "" }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const rotRef = useRef(0);
  const dotsRef = useRef<{ lon: number; lat: number; land: boolean }[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const [ready, setReady] = useState(false);

  // ── Load world-atlas + precompute land dots ───────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Dynamic import of the topojson data
        const topo = await import("world-atlas/land-110m.json") as unknown as Topology;
        const geo = feature(topo, topo.objects.land as GeometryCollection);

        // Extract all outer rings from all countries
        const rings: Ring[] = [];
        for (const f of geo.features) {
          const geom = f.geometry;
          if (!geom) continue;
          if (geom.type === "Polygon") {
            rings.push(geom.coordinates[0] as Ring);
          } else if (geom.type === "MultiPolygon") {
            for (const poly of geom.coordinates) rings.push(poly[0] as Ring);
          }
        }
        ringsRef.current = rings;

        // Precompute land/ocean dots
        const dots: { lon: number; lat: number; land: boolean }[] = [];
        const step = 2.5;
        for (let lat = -88; lat <= 88; lat += step) {
          const lonStep = step / Math.max(0.12, Math.cos((lat * Math.PI) / 180));
          for (let lon = -180; lon < 180; lon += lonStep) {
            dots.push({ lon, lat, land: isOnLand(lon, lat, rings) });
          }
        }
        dotsRef.current = dots;
        setReady(true);
      } catch (e) {
        console.error("GlobeCanvas load error", e);
        setReady(true); // still render grid even if geo fails
      }
    }
    load();
  }, []);

  // ── Render loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const R = size / 2 - 12;
    const cx = size / 2;
    const cy = size / 2;

    const isDark = () => document.documentElement.classList.contains("dark");

    const drawFrame = () => {
      ctx.clearRect(0, 0, size, size);
      const rot = rotRef.current;
      const dark = isDark();

      // ── Atmosphere glow ─────────────────────────────────────────────────
      const atm = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.18);
      atm.addColorStop(0, dark ? "rgba(6,182,212,0.06)" : "rgba(100,116,139,0.05)");
      atm.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      // ── Clip to sphere ──────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Lat/lon grid
      ctx.lineWidth = 0.45;
      ctx.strokeStyle = dark ? "rgba(148,163,184,0.08)" : "rgba(100,116,139,0.1)";
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 2) {
          const { x, y, visible } = project(lon, lat, rot, R);
          if (visible) { first ? ctx.moveTo(cx + x, cy + y) : ctx.lineTo(cx + x, cy + y); first = false; }
          else first = true;
        }
        ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 15) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 2) {
          const { x, y, visible } = project(lon, lat, rot, R);
          if (visible) { first ? ctx.moveTo(cx + x, cy + y) : ctx.lineTo(cx + x, cy + y); first = false; }
          else first = true;
        }
        ctx.stroke();
      }

      // Land & ocean dots
      for (const dot of dotsRef.current) {
        const { x, y, visible, depth } = project(dot.lon, dot.lat, rot, R);
        if (!visible) continue;
        if (dot.land) {
          ctx.beginPath();
          ctx.arc(cx + x, cy + y, 1.2 + 0.5 * depth, 0, Math.PI * 2);
          ctx.fillStyle = dark
            ? `rgba(34,211,238,${0.35 + 0.55 * depth})`
            : `rgba(51,65,85,${0.4 + 0.45 * depth})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(cx + x, cy + y, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = dark
            ? `rgba(148,163,184,${0.06 * depth})`
            : `rgba(100,116,139,${0.08 * depth})`;
          ctx.fill();
        }
      }

      // Country outline paths – Real Natural Earth data
      const rings = ringsRef.current;
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = dark ? "rgba(34,211,238,0.3)" : "rgba(51,65,85,0.28)";
      for (const ring of rings) {
        ctx.beginPath();
        let first = true;
        for (const [lon, lat] of ring) {
          const { x, y, visible } = project(lon, lat, rot, R);
          if (visible) {
            first ? ctx.moveTo(cx + x, cy + y) : ctx.lineTo(cx + x, cy + y);
            first = false;
          } else first = true;
        }
        ctx.stroke();
      }

      ctx.restore();

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = dark ? "rgba(34,211,238,0.2)" : "rgba(100,116,139,0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Specular highlight
      const hl = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.42, 0, cx - R * 0.1, cy - R * 0.1, R * 0.65);
      hl.addColorStop(0, dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.32)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = hl;
      ctx.fill();
      ctx.restore();

      rotRef.current = (rotRef.current + 0.04) % 360;
      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
