import React, { useRef, useEffect, useState } from 'react';
import { MatchDetails, FilterState, TelemetryEvent, MapId } from '../types';
import { MAP_CONFIGS, EVENT_COLORS } from '../utils/constants';
import { drawHeatmap } from '../utils/heatmap';

interface MapExplorerProps {
  matchData?: MatchDetails;
  filters: FilterState;
  currentTime: number;
  mapAggregates?: Record<MapId, any>;
  onSelectPlayer: (playerId: string | null) => void;
}

interface HoverInfo {
  pixelX: number;
  pixelY: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  u: number;
  v: number;
  playerHover?: {
    id: string;
    isBot: boolean;
    event?: TelemetryEvent;
  };
}

export const MapExplorer: React.FC<MapExplorerProps> = ({
  matchData,
  filters,
  currentTime,
  mapAggregates,
  onSelectPlayer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const mapConfig = MAP_CONFIGS[filters.mapId];

  // Render Map & Overlay Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const heatmapCanvas = heatmapCanvasRef.current;
    if (!canvas || !heatmapCanvas) return;

    const ctx = canvas.getContext('2d');
    const hCtx = heatmapCanvas.getContext('2d');
    if (!ctx || !hCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvases
    ctx.clearRect(0, 0, width, height);
    hCtx.clearRect(0, 0, width, height);

    // 1. Draw Heatmap Overlay if active
    if (filters.heatmapMode !== 'none') {
      let heatPoints: { u: number; v: number; weight?: number }[] = [];

      if (mapAggregates && mapAggregates[filters.mapId]) {
        const agg = mapAggregates[filters.mapId];
        if (filters.heatmapMode === 'traffic') {
          heatPoints = agg.positions || [];
        } else if (filters.heatmapMode === 'kills') {
          heatPoints = agg.kills || [];
        } else if (filters.heatmapMode === 'deaths') {
          heatPoints = agg.deaths || [];
        } else if (filters.heatmapMode === 'loot') {
          heatPoints = agg.loots || [];
        }
      }

      drawHeatmap(hCtx, width, height, heatPoints, 30, 20);
    }

    // 2. Draw Player Journeys & Events if matchData is available
    if (!matchData) return;

    const players = matchData.players;

    // Iterate through players
    for (const [playerId, player] of Object.entries(players)) {
      // Check human vs bot filter
      if (player.is_bot && !filters.showBots) continue;
      if (!player.is_bot && !filters.showHumans) continue;

      const isSelected = filters.selectedPlayerId === playerId;
      const isDimmed = filters.selectedPlayerId !== null && !isSelected;

      // Filter events up to currentTime
      const pastEvents = player.events.filter(ev => ev.t <= currentTime);
      if (pastEvents.length === 0) continue;

      // Path line color
      const pathColor = player.is_bot ? EVENT_COLORS.BotPosition : EVENT_COLORS.Position;

      // Draw trajectory polyline
      ctx.beginPath();
      ctx.lineWidth = isSelected ? 3.5 : isDimmed ? 1.0 : 2.0;
      ctx.strokeStyle = isSelected ? '#38bdf8' : pathColor;
      ctx.globalAlpha = isDimmed ? 0.25 : 0.8;

      let first = true;
      for (const ev of pastEvents) {
        if (ev.e === 'Position' || ev.e === 'BotPosition') {
          const px = ev.u * width;
          const py = (1 - ev.v) * height; // Top-left origin flip
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Current player position marker (latest position event up to currentTime)
      const currentPosEvent = pastEvents
        .filter(ev => ev.e === 'Position' || ev.e === 'BotPosition')
        .pop();

      if (currentPosEvent) {
        const px = currentPosEvent.u * width;
        const py = (1 - currentPosEvent.v) * height;

        ctx.globalAlpha = isDimmed ? 0.3 : 1.0;
        // Outer halo glow
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = player.is_bot ? '#94a3b8' : '#38bdf8';
        ctx.fill();

        // Inner core
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Draw discrete event markers (Kills, Deaths, Loot, Storm)
      for (const ev of pastEvents) {
        if (ev.e === 'Position' || ev.e === 'BotPosition') continue;
        if (!filters.visibleEvents[ev.e]) continue;

        const px = ev.u * width;
        const py = (1 - ev.v) * height;

        ctx.globalAlpha = isDimmed ? 0.3 : 1.0;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = EVENT_COLORS[ev.e] || '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
    }
  }, [matchData, filters, currentTime, mapAggregates]);

  // Mouse move coordinate converter & inspector
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    const u = Math.min(1, Math.max(0, pixelX / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (pixelY / rect.height)));

    // Reconstruct world coords
    const worldX = mapConfig.originX + (u * mapConfig.scale);
    const worldZ = mapConfig.originZ + (v * mapConfig.scale);

    setHoverInfo({
      pixelX,
      pixelY,
      worldX: Math.round(worldX * 100) / 100,
      worldY: 0,
      worldZ: Math.round(worldZ * 100) / 100,
      u: Math.round(u * 10000) / 10000,
      v: Math.round(v * 10000) / 10000
    });
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !matchData) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    const u = Math.min(1, Math.max(0, pixelX / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (pixelY / rect.height)));

    // Find closest player to click
    let closestId: string | null = null;
    let minDist = 0.05; // Maximum normalized UV click radius

    for (const [pId, p] of Object.entries(matchData.players)) {
      if (p.is_bot && !filters.showBots) continue;
      if (!p.is_bot && !filters.showHumans) continue;

      const latestPos = p.events.filter(ev => ev.t <= currentTime && (ev.e === 'Position' || ev.e === 'BotPosition')).pop();
      if (latestPos) {
        const du = latestPos.u - u;
        const dv = latestPos.v - v;
        const dist = Math.sqrt(du * du + dv * dv);
        if (dist < minDist) {
          minDist = dist;
          closestId = pId;
        }
      }
    }

    onSelectPlayer(filters.selectedPlayerId === closestId ? null : closestId);
  };

  const handleMouseLeave = () => setHoverInfo(null);

  return (
    <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden select-none p-4">
      {/* Map Aspect Ratio Wrapper (1024x1024 base square map) */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-square max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 group cursor-crosshair"
        style={{ height: 'min(85vh, 85vw)' }}
      >
        {/* Background Minimap Image */}
        <img
          src={mapConfig.imagePath}
          alt={mapConfig.name}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Heatmap Overlay Canvas */}
        <canvas
          ref={heatmapCanvasRef}
          width={1024}
          height={1024}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80 mix-blend-screen"
        />

        {/* Trajectories & Events Canvas */}
        <canvas
          ref={canvasRef}
          width={1024}
          height={1024}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Mouse Hover Coordinate & Telemetry Inspector Box */}
        {hoverInfo && (
          <div 
            className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-2 rounded-lg text-[11px] font-mono text-slate-300 shadow-xl space-y-0.5 pointer-events-none z-10"
          >
            <div className="text-slate-400 font-sans font-bold flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <span>{mapConfig.name} Coordinates</span>
              <span className="text-[10px] text-sky-400">UV ({hoverInfo.u}, {hoverInfo.v})</span>
            </div>
            <div>World X: <strong className="text-slate-100">{hoverInfo.worldX}</strong></div>
            <div>World Z: <strong className="text-slate-100">{hoverInfo.worldZ}</strong></div>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-300 space-y-1.5 shadow-lg pointer-events-none">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-0.5 bg-blue-500"></span>
            <span>Human Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-0.5 bg-slate-400"></span>
            <span>Bot Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black"></span>
            <span>PvP Kill</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></span>
            <span>PvP Death</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></span>
            <span>Loot Item</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-black"></span>
            <span>Storm Death</span>
          </div>
        </div>
      </div>
    </div>
  );
};
