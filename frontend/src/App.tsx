import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapExplorer } from './components/MapExplorer';
import { TimelineControls } from './components/TimelineControls';
import { InsightsDrawer } from './components/InsightsDrawer';
import { FilterState, MatchSummary, MatchDetails, MapId } from './types';

export const App: React.FC = () => {
  const [summaryList, setSummaryList] = useState<MatchSummary[]>([]);
  const [allMatches, setAllMatches] = useState<Record<string, MatchDetails>>({});
  const [mapAggregates, setMapAggregates] = useState<Record<MapId, any>>({} as Record<MapId, any>);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    mapId: 'AmbroseValley',
    day: 'all',
    matchId: '',
    showHumans: true,
    showBots: true,
    visibleEvents: {
      Position: true,
      BotPosition: true,
      Kill: true,
      Killed: true,
      BotKill: true,
      BotKilled: true,
      KilledByStorm: true,
      Loot: true
    },
    heatmapMode: 'none',
    selectedPlayerId: null
  });

  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isInsightsOpen, setIsInsightsOpen] = useState<boolean>(false);

  // Fetch preprocessed JSON datasets
  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, matchRes, aggRes] = await Promise.all([
          fetch('/data/summary.json'),
          fetch('/data/matches.json'),
          fetch('/data/map_aggregates.json')
        ]);

        const summaryData: MatchSummary[] = await sumRes.json();
        const matchesData: Record<string, MatchDetails> = await matchRes.json();
        const aggregatesData = await aggRes.json();

        setSummaryList(summaryData);
        setAllMatches(matchesData);
        setMapAggregates(aggregatesData);

        // Auto-select initial match for AmbroseValley
        const initialMatch = summaryData.find(m => m.map_id === 'AmbroseValley');
        if (initialMatch) {
          setFilters(f => ({ ...f, matchId: initialMatch.match_id }));
          setCurrentTime(initialMatch.duration_s); // Default show end of match
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load telemetry data:", err);
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Active match data lookup
  const activeMatch = filters.matchId ? allMatches[filters.matchId] : undefined;
  const activeSummary = summaryList.find(s => s.match_id === filters.matchId);
  const matchDuration = activeSummary ? activeSummary.duration_s : 0;

  // Handle Playback Animation Loop
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (timestamp - lastTimeRef.current) / 1000.0;
        setCurrentTime(prev => {
          const next = prev + (deltaSeconds * playbackSpeed);
          if (next >= matchDuration) {
            setIsPlaying(false);
            return matchDuration;
          }
          return next;
        });
      }
      lastTimeRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, matchDuration]);

  // When match selection changes, seek to max duration
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      if (newFilters.matchId && newFilters.matchId !== prev.matchId) {
        const sum = summaryList.find(s => s.match_id === newFilters.matchId);
        if (sum) {
          setCurrentTime(sum.duration_s);
          setIsPlaying(false);
        }
      }
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-100">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        <div className="font-bold text-base tracking-wide">Loading LILA BLACK Telemetry Data...</div>
        <p className="text-xs text-slate-400">Parsing 1,243 parquet matches (89.1K events)</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <Header
        onOpenInsights={() => setIsInsightsOpen(true)}
        totalMatches={summaryList.length}
        totalPlayers={339}
      />

      {/* Main Workspace (Sidebar + Map Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          matches={summaryList}
          activeMatchSummary={activeSummary}
        />

        <MapExplorer
          matchData={activeMatch}
          filters={filters}
          currentTime={currentTime}
          mapAggregates={mapAggregates}
          onSelectPlayer={(pId) => handleFilterChange({ selectedPlayerId: pId })}
        />
      </div>

      {/* Timeline Controls Footer */}
      <TimelineControls
        currentTime={currentTime}
        duration={matchDuration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSeek={(t) => setCurrentTime(t)}
        onSpeedChange={(s) => setPlaybackSpeed(s)}
        onReset={() => {
          setCurrentTime(0);
          setIsPlaying(false);
        }}
      />

      {/* Insights Drawer */}
      <InsightsDrawer
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />
    </div>
  );
};
