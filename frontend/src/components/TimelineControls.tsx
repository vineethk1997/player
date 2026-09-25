import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface TimelineControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTime,
  duration,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onReset
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center space-x-6 shrink-0 z-20 select-none">
      {/* Play/Pause & Step Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onReset}
          title="Reset Match Timeline"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          title="Rewind 5s"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 5))}
          title="Forward 5s"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Time Readout */}
      <div className="font-mono text-xs font-semibold text-slate-300 w-24">
        <span>{formatTime(currentTime)}</span>
        <span className="text-slate-500 mx-1">/</span>
        <span className="text-slate-500">{formatTime(duration)}</span>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #1e293b ${progress}%, #1e293b 100%)`
          }}
        />
      </div>

      {/* Speed Multiplier Controls */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {[1, 2, 5, 10].map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-md transition ${
              playbackSpeed === s
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
