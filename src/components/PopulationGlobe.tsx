import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { CountryCensus, GlobeTheme, VizMode } from '../types';
import { populationData, countryNumericMap } from '../data/populationData';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';

interface PopulationGlobeProps {
  selectedCountry: CountryCensus | null;
  onSelectCountry: (country: CountryCensus | null) => void;
  theme: GlobeTheme;
  vizMode: VizMode;
  autoRotate: boolean;
  rotationSpeed: number;
  minPopulationFilter: number;
}

export default function PopulationGlobe({
  selectedCountry,
  onSelectCountry,
  theme,
  vizMode,
  autoRotate,
  rotationSpeed,
  minPopulationFilter,
}: PopulationGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map topologies and geojson
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Globe state: scale and rotations
  const [scale, setScale] = useState<number>(200);
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0]); // [lambda (yaw), phi (pitch), gamma (roll)]
  const [hoveredCountry, setHoveredCountry] = useState<CountryCensus | null>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Refs to avoid stale React state in the animation loop
  const stateRef = useRef({
    scale,
    rotation,
    theme,
    vizMode,
    selectedCountry,
    hoveredCountry,
    autoRotate,
    rotationSpeed,
    minPopulationFilter,
    dimensions,
  });

  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = {
      scale,
      rotation,
      theme,
      vizMode,
      selectedCountry,
      hoveredCountry,
      autoRotate,
      rotationSpeed,
      minPopulationFilter,
      dimensions,
    };
  }, [scale, rotation, theme, vizMode, selectedCountry, hoveredCountry, autoRotate, rotationSpeed, minPopulationFilter, dimensions]);

  // Fetch standard TopoJSON world atlas
  useEffect(() => {
    setLoading(true);
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load map data');
        return res.json();
      })
      .then((topojsonData) => {
        // Convert TopoJSON to GeoJSON features
        const countriesGeojson = feature(topojsonData, topojsonData.objects.countries);
        setWorldData(countriesGeojson);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching atlas:', err);
        setError('Could not download globe map features. Please check your internet connection.');
        setLoading(false);
      });
  }, []);

  // Handle responsive resize of canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const newSize = Math.max(280, Math.min(width, 600));
        setDimensions({ width: newSize, height: newSize });
        setScale(newSize * 0.45); // Proportionate scale
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Animation and Rotation update loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const { autoRotate, rotationSpeed, rotation } = stateRef.current;
      if (autoRotate && !loading && !error) {
        // Spin the globe slightly
        const deltaYaw = (rotationSpeed / 10) * 0.5;
        setRotation(([yaw, pitch, roll]) => [(yaw + deltaYaw) % 360, pitch, roll]);
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [loading, error]);

  // Helper: Find population data for a map feature
  const getCensusData = (featureId: string | number): CountryCensus | null => {
    // Map numerical features to ISO3 letters
    const numericId = String(featureId).padStart(3, '0');
    const iso3Code = countryNumericMap[numericId];
    if (!iso3Code) return null;
    return populationData.find((c) => c.id === iso3Code) || null;
  };

  // Main Canvas Rendering logic
  useEffect(() => {
    if (!canvasRef.current || !worldData) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = dimensions;
    const currentScale = scale;
    const [yaw, pitch, roll] = rotation;
    const currentTheme = theme;
    const currentVizMode = vizMode;
    const curSelected = selectedCountry;
    const curHovered = hoveredCountry;
    const minPop = minPopulationFilter;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Create D3 orthographic projection
    const projection = d3
      .geoOrthographic()
      .scale(currentScale)
      .translate([width / 2, height / 2])
      .clipAngle(90) // Render front hemisphere only
      .rotate([yaw, pitch, roll]);

    const pathGenerator = d3.geoPath(projection, context);

    // Get color palettes based on active theme
    const getThemeColors = () => {
      switch (currentTheme) {
        case 'cyberpunk':
          return {
            spaceBg: 'rgba(5, 5, 12, 0.95)',
            ocean: 'rgba(10, 6, 22, 0.9)',
            globeBorder: '#ef4444',
            grid: 'rgba(236, 72, 153, 0.08)',
            landNoData: 'rgba(40, 30, 60, 0.6)',
            hoverLand: 'rgba(244, 63, 94, 0.85)',
            selectedLand: 'rgba(236, 72, 153, 0.9)',
            border: 'rgba(236, 72, 153, 0.3)',
            spikeColor: '#10b981', // emerald neon spikes
            glow: 'rgba(139, 92, 246, 0.4)', // purple halo
          };
        case 'eco':
          return {
            spaceBg: 'rgba(3, 10, 8, 0.95)',
            ocean: 'rgba(4, 25, 18, 0.9)',
            globeBorder: '#10b981',
            grid: 'rgba(16, 185, 129, 0.08)',
            landNoData: 'rgba(45, 65, 55, 0.6)',
            hoverLand: 'rgba(52, 211, 153, 0.85)',
            selectedLand: 'rgba(16, 185, 129, 0.9)',
            border: 'rgba(16, 185, 129, 0.3)',
            spikeColor: '#facc15', // yellow spikes
            glow: 'rgba(16, 185, 129, 0.4)', // emerald halo
          };
        case 'vintage':
          return {
            spaceBg: '#fbf8f3',
            ocean: '#dfd7c2',
            globeBorder: '#8c7853',
            grid: 'rgba(140, 120, 83, 0.12)',
            landNoData: '#c8bda4',
            hoverLand: '#e07a5f',
            selectedLand: '#3d405b',
            border: '#f4f1de',
            spikeColor: '#e07a5f', // terracotta/orange spikes
            glow: 'rgba(140, 120, 83, 0.25)', // parchment glow
          };
        case 'classic':
        default:
          return {
            spaceBg: '#05070A',
            ocean: '#080B12',
            globeBorder: '#3b82f6',
            grid: 'rgba(255, 255, 255, 0.05)',
            landNoData: '#1A1F2B',
            hoverLand: 'rgba(59, 130, 246, 0.8)',
            selectedLand: 'rgba(37, 99, 235, 0.9)',
            border: 'rgba(255, 255, 255, 0.1)',
            spikeColor: '#60a5fa', // sleek blue spikes
            glow: 'rgba(59, 130, 246, 0.25)', // atmosphere blue glow
          };
      }
    };

    const palette = getThemeColors();

    // 1. Draw outer background glow behind the globe sphere (halo)
    const gradientGlow = context.createRadialGradient(
      width / 2,
      height / 2,
      currentScale * 0.95,
      width / 2,
      height / 2,
      currentScale * 1.15
    );
    gradientGlow.addColorStop(0, palette.glow);
    gradientGlow.addColorStop(0.5, palette.glow.replace('0.4', '0.15').replace('0.35', '0.12').replace('0.25', '0.08'));
    gradientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradientGlow;
    context.beginPath();
    context.arc(width / 2, height / 2, currentScale * 1.25, 0, 2 * Math.PI);
    context.fill();

    // 2. Draw globe ocean sphere
    context.beginPath();
    context.arc(width / 2, height / 2, currentScale, 0, 2 * Math.PI);
    context.fillStyle = palette.ocean;
    context.fill();

    // Add depth to ocean sphere (inner shadow radial gradient)
    const oceanDepth = context.createRadialGradient(
      width / 2 - currentScale * 0.3,
      height / 2 - currentScale * 0.3,
      currentScale * 0.1,
      width / 2,
      height / 2,
      currentScale
    );
    oceanDepth.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    oceanDepth.addColorStop(0.8, 'rgba(0, 0, 0, 0.2)');
    oceanDepth.addColorStop(1, 'rgba(0, 0, 0, 0.75)');

    context.fillStyle = oceanDepth;
    context.beginPath();
    context.arc(width / 2, height / 2, currentScale, 0, 2 * Math.PI);
    context.fill();

    // 3. Draw Grid/Graticules (Coordinate mesh)
    const graticule = d3.geoGraticule()();
    context.beginPath();
    pathGenerator(graticule);
    context.strokeStyle = palette.grid;
    context.lineWidth = 0.8;
    context.stroke();

    // Max population for normalizing choropleth colors & spikes
    const maxPop = 1450000000;

    // 4. Draw Land Features
    worldData.features.forEach((d: any) => {
      context.beginPath();
      pathGenerator(d);

      const census = getCensusData(d.id);
      const isSelected = curSelected && census && curSelected.id === census.id;
      const isHovered = curHovered && census && curHovered.id === census.id;

      if (isSelected) {
        context.fillStyle = palette.selectedLand;
      } else if (isHovered) {
        context.fillStyle = palette.hoverLand;
      } else if (census) {
        // Filter checks
        if (census.population2026 < minPop) {
          context.fillStyle = palette.landNoData;
        } else if (currentVizMode === 'choropleth') {
          // Color based on population density or population size
          const popRatio = Math.log(census.population2026) / Math.log(maxPop);
          
          if (currentTheme === 'cyberpunk') {
            // Dark magenta to intense cyan
            context.fillStyle = d3.interpolateRgb('rgba(88, 28, 135, 0.7)', 'rgba(6, 182, 212, 0.95)')(popRatio);
          } else if (currentTheme === 'eco') {
            // Sage green to deep forest emerald
            context.fillStyle = d3.interpolateRgb('rgba(52, 78, 65, 0.7)', 'rgba(56, 176, 0, 0.95)')(popRatio);
          } else if (currentTheme === 'vintage') {
            // Cream beige to terracotta crimson
            context.fillStyle = d3.interpolateRgb('rgba(197, 181, 155, 0.75)', 'rgba(180, 50, 40, 0.9)')(popRatio);
          } else {
            // Dark steel blue to vibrant sky blue
            context.fillStyle = d3.interpolateRgb('rgba(30, 41, 59, 0.7)', 'rgba(14, 165, 233, 0.95)')(popRatio);
          }
        } else {
          // Subtle default land for spike/dot views so map shape is clear
          context.fillStyle = currentTheme === 'vintage' ? 'rgba(150, 165, 140, 0.75)' : 'rgba(51, 65, 85, 0.5)';
        }
      } else {
        context.fillStyle = palette.landNoData;
      }

      context.fill();

      // Land outline borders
      context.strokeStyle = palette.border;
      context.lineWidth = isSelected || isHovered ? 1.5 : 0.5;
      context.stroke();
    });

    // 5. Render Spikes or Heat Rings Overlay
    // We render spikes originating from visible centroids
    if (currentVizMode === 'spikes' || currentVizMode === 'density-dots') {
      worldData.features.forEach((d: any) => {
        const census = getCensusData(d.id);
        if (!census || census.population2026 < minPop) return;

        // Calculate centroid of the country
        const centroid = d3.geoCentroid(d);

        // Check if the centroid is on the visible front hemisphere
        // D3 geo distance calculates distance on sphere in radians.
        // A coordinate is visible if distance from the center of the viewport is < PI/2 (90 degrees).
        const centerOfGlobe: [number, number] = [-yaw, -pitch];
        const dist = d3.geoDistance(centroid, centerOfGlobe);

        if (dist < Math.PI / 2) {
          const projectedPoint = projection(centroid);
          if (projectedPoint) {
            const [cx, cy] = projectedPoint;

            // Normalize population size
            const sizeRatio = Math.sqrt(census.population2026 / maxPop); // sqrt scales spikes nicer than linear

            if (currentVizMode === 'spikes') {
              // Draw 3D spikes pointing straight out of the sphere surface
              // Direction of spike vector is from center [width/2, height/2] through centroid [cx, cy]
              const globeCenterX = width / 2;
              const globeCenterY = height / 2;
              let dx = cx - globeCenterX;
              let dy = cy - globeCenterY;
              const len = Math.sqrt(dx * dx + dy * dy);

              if (len > 0) {
                // Direction normalized
                dx /= len;
                dy /= len;

                // Spike height
                const spikeHeight = Math.max(10, sizeRatio * 75);

                // Spike geometry (pyramid triangle representing a bar in isometric projection)
                const endX = cx + dx * spikeHeight;
                const endY = cy + dy * spikeHeight;

                // Transverse vector for the base width of the spike
                const tx = -dy;
                const ty = dx;
                const baseHalfWidth = Math.max(1.5, sizeRatio * 5);

                // Base points
                const bx1 = cx - tx * baseHalfWidth;
                const by1 = cy - ty * baseHalfWidth;
                const bx2 = cx + tx * baseHalfWidth;
                const by2 = cy + ty * baseHalfWidth;

                // Fill glowing spike pyramid
                context.beginPath();
                context.moveTo(bx1, by1);
                context.lineTo(endX, endY);
                context.lineTo(bx2, by2);
                context.closePath();

                // Gradient spike
                const spikeGrad = context.createLinearGradient(cx, cy, endX, endY);
                spikeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
                spikeGrad.addColorStop(0.3, palette.spikeColor);
                spikeGrad.addColorStop(1, '#ffffff');

                context.fillStyle = spikeGrad;
                context.fill();

                // Highlight border
                context.strokeStyle = palette.spikeColor;
                context.lineWidth = 0.8;
                context.stroke();

                // Base dot representing coordinate point
                context.fillStyle = '#ffffff';
                context.beginPath();
                context.arc(cx, cy, Math.max(1.5, sizeRatio * 3), 0, 2 * Math.PI);
                context.fill();
              }
            } else if (currentVizMode === 'density-dots') {
              // Dynamic pulsing density dots
              const maxRadius = Math.max(5, sizeRatio * 45);
              const pulse = (Date.now() % 2000) / 2000; // 0 to 1 loop

              // Inner core
              context.fillStyle = palette.spikeColor;
              context.beginPath();
              context.arc(cx, cy, Math.max(3, sizeRatio * 10), 0, 2 * Math.PI);
              context.fill();

              // Pulsing concentric rings
              context.strokeStyle = palette.spikeColor;
              context.lineWidth = 1.2;
              context.beginPath();
              context.arc(cx, cy, pulse * maxRadius, 0, 2 * Math.PI);
              context.strokeStyle = `rgba(${currentTheme === 'cyberpunk' ? '16, 185, 129' : currentTheme === 'eco' ? '250, 204, 21' : currentTheme === 'vintage' ? '224, 122, 95' : '249, 115, 22'}, ${1 - pulse})`;
              context.stroke();
            }
          }
        }
      });
    }

    // 6. Draw glowing atmosphere rim border around the globe
    const atmosphere = context.createRadialGradient(
      width / 2,
      height / 2,
      currentScale * 0.98,
      width / 2,
      height / 2,
      currentScale * 1.02
    );
    atmosphere.addColorStop(0, 'rgba(255, 255, 255, 0)');
    atmosphere.addColorStop(0.5, palette.globeBorder);
    atmosphere.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.strokeStyle = atmosphere;
    context.lineWidth = 6;
    context.beginPath();
    context.arc(width / 2, height / 2, currentScale, 0, 2 * Math.PI);
    context.stroke();
  }, [worldData, scale, rotation, theme, vizMode, selectedCountry, hoveredCountry, dimensions, minPopulationFilter]);

  // Pointer drag events for rotating globe
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startRot: [0, 0, 0] });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRot: [...rotation],
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDragging) {
      // Handle hover checks over countries!
      handleHover(e);
      return;
    }

    const { startX, startY, startRot } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Rotation sensitivity scale
    const sensitivity = 0.25;

    const newYaw = (startRot[0] + dx * sensitivity) % 360;
    // Clip latitude (pitch) between -90 and 90 to prevent upside-down flip
    const newPitch = Math.max(-85, Math.min(85, startRot[1] - dy * sensitivity));

    setRotation([newYaw, newPitch, startRot[2]]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current.isDragging) {
      canvasRef.current?.releasePointerCapture(e.pointerId);
      dragRef.current.isDragging = false;
    }
  };

  // Click on a country
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas || !worldData) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel to globe projection coordinate
    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .clipAngle(90)
      .rotate(rotation);

    // D3 invert maps pixel point back to geographical [longitude, latitude]
    const geoPoint = projection.invert([clickX, clickY]);

    if (!geoPoint) return;

    // Find if the point falls inside any country polygon
    let foundCountry: CountryCensus | null = null;

    // Iterate features to check containing polygons
    for (const f of worldData.features) {
      if (d3.geoContains(f, geoPoint)) {
        foundCountry = getCensusData(f.id);
        break;
      }
    }

    onSelectCountry(foundCountry);
  };

  // Detect hover over country features
  const handleHover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !worldData) return;

    const rect = canvas.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverY = e.clientY - rect.top;

    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .clipAngle(90)
      .rotate(rotation);

    const geoPoint = projection.invert([hoverX, hoverY]);

    if (!geoPoint) {
      setHoveredCountry(null);
      return;
    }

    // Check if the inverted point is actually inside the front circle projection boundary
    // i.e., distance from center is <= scale
    const dx = hoverX - dimensions.width / 2;
    const dy = hoverY - dimensions.height / 2;
    if (dx * dx + dy * dy > scale * scale) {
      setHoveredCountry(null);
      return;
    }

    let found: CountryCensus | null = null;
    for (const f of worldData.features) {
      if (d3.geoContains(f, geoPoint)) {
        found = getCensusData(f.id);
        break;
      }
    }

    if (found?.id !== hoveredCountry?.id) {
      setHoveredCountry(found);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setScale((s) => Math.min(450, s + 30));
  const handleZoomOut = () => setScale((s) => Math.max(120, s - 30));
  const resetOrientation = () => {
    setRotation([-10, -20, 0]);
    setScale(dimensions.width * 0.45);
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full h-full" ref={containerRef}>
      {/* HUD Compass / Stats indicator */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#0D1117]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-mono text-blue-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow text-blue-400" />
          <span>
            LAT: {Math.round(-rotation[1])}°N, LNG: {Math.round(-rotation[0])}°E
          </span>
        </div>
        {hoveredCountry && (
          <div className="bg-[#0D1117]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-blue-500/30 flex flex-col gap-0.5 shadow-lg shadow-black/40 max-w-xs pointer-events-auto">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: hoveredCountry.population2026 > 100000000 ? '#3b82f6' : '#60a5fa' }} />
              {hoveredCountry.name}
            </span>
            <span className="text-[11px] font-mono text-white/60">
              Pop: {(hoveredCountry.population2026 / 1000000).toFixed(1)}M • Density: {hoveredCountry.density}/km²
            </span>
          </div>
        )}
      </div>

      {/* Outer Earth Canvas Container */}
      <div className="relative flex-1 flex items-center justify-center w-full min-h-[320px] md:min-h-[420px]">
        {loading && (
          <div className="absolute inset-0 bg-[#05070A]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white/80 gap-3 z-20">
            <RotateCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium tracking-wide">Initializing 3D Globe Atlas...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-[#05070A]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 gap-3 z-20">
            <div className="text-red-400 font-mono text-xs max-w-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-black font-semibold px-4 py-2 rounded-lg text-xs tracking-wide transition-colors"
            >
              Retry Loading Map
            </button>
          </div>
        )}

        {/* The 3D canvas */}
        <canvas
          id="globe_canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleCanvasClick}
          onPointerLeave={() => setHoveredCountry(null)}
          className={`cursor-grab active:cursor-grabbing rounded-full touch-none select-none transition-transform duration-300 ${
            theme === 'cyberpunk'
              ? 'shadow-[0_0_40px_rgba(139,92,246,0.15)]'
              : theme === 'eco'
              ? 'shadow-[0_0_40px_rgba(16,185,129,0.15)]'
              : theme === 'vintage'
              ? 'shadow-[0_0_30px_rgba(140,120,83,0.1)]'
              : 'shadow-[0_0_40px_rgba(14,165,233,0.15)]'
          }`}
        />
      </div>

      {/* Floating View Controls HUD */}
      <div className="absolute bottom-4 z-10 flex items-center bg-[#0D1117] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl gap-3 text-white">
        <button
          id="zoom_in_btn"
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-white/10 rounded-full text-white/75 hover:text-blue-400 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="zoom_out_btn"
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-white/10 rounded-full text-white/75 hover:text-blue-400 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          id="reset_view_btn"
          onClick={resetOrientation}
          className="p-1.5 hover:bg-white/10 rounded-full text-white/75 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-[11px] font-mono tracking-wider cursor-pointer"
          title="Recenter"
        >
          <Compass className="w-4 h-4" />
          RESET
        </button>
      </div>
    </div>
  );
}
