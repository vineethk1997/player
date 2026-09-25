import React from 'react';
import { Map, Layers, Users, Zap, BarChart2 } from 'lucide-react';

interface HeaderProps {
  onOpenInsights: () => void;
  totalMatches: number;
  totalPlayers: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInsights, totalMatches, totalPlayers }) => {
  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between backdrop-blur z-20 shrink-0 select-none">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-slate-100 tracking-tight text-sm sm:text-base">
              LILA BLACK
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
              Map Explorer
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Player Journey & Telemetry Visualization Tool for Level Designers
          </p>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="hidden md:flex items-center space-x-6 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-rose-400" />
          <span><strong className="text-slate-100">{totalMatches}</strong> Matches</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-sky-400" />
          <span><strong className="text-slate-100">{totalPlayers}</strong> Players</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span><strong className="text-slate-100">89.1K</strong> Telemetry Events</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenInsights}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition shadow-sm"
        >
          <BarChart2 className="w-4 h-4 text-rose-400" />
          <span>3 Level Design Insights</span>
        </button>
      </div>
    </header>
  );
};
