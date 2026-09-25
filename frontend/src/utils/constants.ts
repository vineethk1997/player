import { MapConfig, MapId, EventType } from '../types';

export const MAP_CONFIGS: Record<MapId, MapConfig> = {
  AmbroseValley: {
    name: 'Ambrose Valley',
    scale: 900,
    originX: -370,
    originZ: -473,
    imagePath: '/minimaps/AmbroseValley_Minimap.png'
  },
  GrandRift: {
    name: 'Grand Rift',
    scale: 581,
    originX: -290,
    originZ: -290,
    imagePath: '/minimaps/GrandRift_Minimap.png'
  },
  Lockdown: {
    name: 'Lockdown',
    scale: 1000,
    originX: -500,
    originZ: -500,
    imagePath: '/minimaps/Lockdown_Minimap.jpg'
  }
};

export const EVENT_COLORS: Record<EventType, string> = {
  Position: '#3b82f6',     // Blue (Human path)
  BotPosition: '#94a3b8',  // Slate (Bot path)
  Kill: '#22c55e',         // Green (Human Kill)
  Killed: '#ef4444',       // Red (Human Death)
  BotKill: '#10b981',      // Emerald (Kill Bot)
  BotKilled: '#f97316',    // Orange (Bot Killed Human)
  KilledByStorm: '#a855f7',// Purple (Storm Death)
  Loot: '#eab308'          // Yellow (Loot)
};

export const EVENT_LABELS: Record<EventType, string> = {
  Position: 'Human Trajectory',
  BotPosition: 'Bot Trajectory',
  Kill: 'PvP Kill',
  Killed: 'PvP Death',
  BotKill: 'Bot Kill',
  BotKilled: 'Killed by Bot',
  KilledByStorm: 'Storm Death',
  Loot: 'Item Looted'
};
