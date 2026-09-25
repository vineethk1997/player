import React from 'react';
import { 
  Map, Calendar, Eye, Flame, UserCheck, Bot, Skull, 
  Target, ShoppingBag, CloudLightning
} from 'lucide-react';
import { MapId, DayId, FilterState, MatchSummary, HeatmapMode, EventType } from '../types';
import { MAP_CONFIGS, EVENT_COLORS } from '../utils/constants';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  matches: MatchSummary[];
  activeMatchSummary?: MatchSummary;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  matches,
  activeMatchSummary
}) => {
  // Available maps
  const maps: MapId[] = ['AmbroseValley', 'GrandRift', 'Lockdown'];

  // Available days
  const days: { id: DayId | 'all'; label: string }[] = [
    { id: 'all', label: 'All Dates' },
    { id: 'February_10', label: 'Feb 10' },
    { id: 'February_11', label: 'Feb 11' },
    { id: 'February_12', label: 'Feb 12' },
    { id: 'February_13', label: 'Feb 13' },
    { id: 'February_14', label: 'Feb 14 (Partial)' }
  ];

  // Filter matches based on selected map and date
  const filteredMatches = matches.filter(m => {
    if (m.map_id !== filters.mapId) return false;
    if (filters.day !== 'all' && m.day !== filters.day) return false;
    return true;
  });

  const handleToggleEvent = (eventType: EventType) => {
    onFilterChange({
      visibleEvents: {
        ...filters.visibleEvents,
        [eventType]: !filters.visibleEvents[eventType]
      }
    });
  };

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto shrink-0 select-none text-xs">
      <div className="p-4 space-y-6">

        {/* 1. Map Selection */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 font-bold text-slate-200 text-xs tracking-wider uppercase">
            <Map className="w-4 h-4 text-rose-500" />
            <span>Select Map</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {maps.map(mId => (
              <button
                key={mId}
                onClick={() => {
                  // When map changes, auto select first available match for that map
                  const firstMatch = matches.find(m => m.map_id === mId);
                  onFilterChange({
                    mapId: mId,
                    matchId: firstMatch ? firstMatch.match_id : ''
                  });
                }}
                className={`px-2 py-2 rounded-lg font-semibold border text-center transition ${
                  filters.mapId === mId
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80 hover:text-slate-200'
                }`}
              >
                {MAP_CONFIGS[mId].name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Date & Match Filters */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="flex items-center space-x-2 font-bold text-slate-200 text-xs tracking-wider uppercase">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Date & Match Filter</span>
          </label>

          {/* Date Selector */}
          <div>
            <span className="text-[11px] text-slate-400 font-medium mb-1 block">Date Range</span>
            <select
              value={filters.day}
              onChange={(e) => {
                const newDay = e.target.value as DayId | 'all';
                const available = matches.filter(m => m.map_id === filters.mapId && (newDay === 'all' || m.day === newDay));
                onFilterChange({
                  day: newDay,
                  matchId: available.length > 0 ? available[0].match_id : ''
                });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {days.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Match Selector */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Match Session</span>
              <span className="text-[10px] text-slate-500">{filteredMatches.length} available</span>
            </div>
            <select
              value={filters.matchId}
              onChange={(e) => onFilterChange({ matchId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
            >
              {filteredMatches.map(m => (
                <option key={m.match_id} value={m.match_id}>
                  {m.match_id.substring(0, 8)}... ({Math.floor(m.duration_s / 60)}m {m.duration_s % 60}s | {m.human_count}H/{m.bot_count}B)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Player Filter (Humans vs Bots) */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="flex items-center space-x-2 font-bold text-slate-200 text-xs tracking-wider uppercase">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Player Types</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFilterChange({ showHumans: !filters.showHumans })}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border font-medium transition ${
                filters.showHumans
                  ? 'bg-sky-950/80 text-sky-300 border-sky-600/80 shadow-sm'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Humans ({activeMatchSummary?.human_count || 0})</span>
            </button>
            <button
              onClick={() => onFilterChange({ showBots: !filters.showBots })}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border font-medium transition ${
                filters.showBots
                  ? 'bg-slate-800 text-slate-200 border-slate-600 shadow-sm'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <Bot className="w-4 h-4 text-slate-400" />
              <span>Bots ({activeMatchSummary?.bot_count || 0})</span>
            </button>
          </div>
        </div>

        {/* 4. Event Filters */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="flex items-center space-x-2 font-bold text-slate-200 text-xs tracking-wider uppercase">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Visible Events</span>
          </label>
          <div className="space-y-1.5">
            <button
              onClick={() => handleToggleEvent('Kill')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                filters.visibleEvents.Kill ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS.Kill }}></span>
                <span>PvP Kills</span>
              </div>
              <Target className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleToggleEvent('Killed')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                filters.visibleEvents.Killed ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS.Killed }}></span>
                <span>PvP Deaths</span>
              </div>
              <Skull className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleToggleEvent('BotKill')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                filters.visibleEvents.BotKill ? 'bg-teal-950/40 border-teal-800 text-teal-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS.BotKill }}></span>
                <span>Bot Kills</span>
              </div>
              <Bot className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleToggleEvent('Loot')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                filters.visibleEvents.Loot ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS.Loot }}></span>
                <span>Loot Pickup</span>
              </div>
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleToggleEvent('KilledByStorm')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                filters.visibleEvents.KilledByStorm ? 'bg-purple-950/40 border-purple-800 text-purple-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS.KilledByStorm }}></span>
                <span>Storm Deaths</span>
              </div>
              <CloudLightning className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5. Heatmap Overlay */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="flex items-center space-x-2 font-bold text-slate-200 text-xs tracking-wider uppercase">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Heatmap Overlay Mode</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['none', 'traffic', 'kills', 'deaths', 'loot'] as HeatmapMode[]).map(hm => (
              <button
                key={hm}
                onClick={() => onFilterChange({ heatmapMode: hm })}
                className={`px-2.5 py-1.5 rounded-lg font-medium border text-center transition capitalize ${
                  filters.heatmapMode === hm
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80 hover:text-slate-200'
                }`}
              >
                {hm === 'none' ? 'Off' : `${hm} Density`}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Active Match Quick Stats Summary */}
        {activeMatchSummary && (
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="font-bold text-slate-300 flex items-center justify-between">
              <span>Match Summary</span>
              <span className="font-mono text-slate-400">{activeMatchSummary.day}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Duration</span>
                <strong className="text-slate-200 font-mono">
                  {Math.floor(activeMatchSummary.duration_s / 60)}m {activeMatchSummary.duration_s % 60}s
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Players</span>
                <strong className="text-slate-200">{activeMatchSummary.total_players} total</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Combat Kills</span>
                <strong className="text-emerald-400">{activeMatchSummary.kill_count} kills</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Loot Events</span>
                <strong className="text-amber-400">{activeMatchSummary.loot_count} items</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
