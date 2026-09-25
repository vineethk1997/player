export type MapId = 'AmbroseValley' | 'GrandRift' | 'Lockdown';
export type DayId = 'February_10' | 'February_11' | 'February_12' | 'February_13' | 'February_14';

export type EventType = 
  | 'Position' 
  | 'BotPosition' 
  | 'Kill' 
  | 'Killed' 
  | 'BotKill' 
  | 'BotKilled' 
  | 'KilledByStorm' 
  | 'Loot';

export interface TelemetryEvent {
  t: number;      // relative timestamp in seconds from match start
  e: EventType;   // event name
  x: number;      // world X coordinate
  y: number;      // world Y (elevation) coordinate
  z: number;      // world Z coordinate
  u: number;      // normalized minimap U coordinate [0, 1]
  v: number;      // normalized minimap V coordinate [0, 1]
}

export interface PlayerData {
  is_bot: boolean;
  events: TelemetryEvent[];
}

export interface MatchSummary {
  match_id: string;
  map_id: MapId;
  day: DayId;
  min_ts: number;
  max_ts: number;
  duration_s: number;
  total_players: number;
  human_count: number;
  bot_count: number;
  kill_count: number;
  death_count: number;
  loot_count: number;
}

export interface MatchDetails {
  match_id: string;
  map_id: MapId;
  day: DayId;
  min_ts: number;
  max_ts: number;
  duration_s: number;
  players: Record<string, PlayerData>;
}

export type HeatmapMode = 'none' | 'traffic' | 'kills' | 'deaths' | 'loot';

export interface FilterState {
  mapId: MapId;
  day: DayId | 'all';
  matchId: string;
  showHumans: boolean;
  showBots: boolean;
  visibleEvents: Record<EventType, boolean>;
  heatmapMode: HeatmapMode;
  selectedPlayerId: string | null;
}

export interface MapConfig {
  name: string;
  scale: number;
  originX: number;
  originZ: number;
  imagePath: string;
}
