import os
import json
import pyarrow.parquet as pq
import pandas as pd
import numpy as np

def main():
    # Base raw data directory
    raw_data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "player_data")
    if not os.path.exists(raw_data_dir):
        # Fallback if scripts folder is sibling
        raw_data_dir = r"C:\Users\vinee\OneDrive\Desktop\player_data\player_data"
        
    days = ['February_10', 'February_11', 'February_12', 'February_13', 'February_14']
    
    print(f"Reading raw data from: {raw_data_dir}")
    
    all_dfs = []
    for d in days:
        folder = os.path.join(raw_data_dir, d)
        if not os.path.exists(folder):
            continue
        for fname in os.listdir(folder):
            fpath = os.path.join(folder, fname)
            try:
                t = pq.read_table(fpath)
                m_df = t.to_pandas()
                m_df['day'] = d
                all_dfs.append(m_df)
            except Exception as e:
                print(f"Error reading {fname}: {e}")

    df = pd.concat(all_dfs, ignore_index=True)
    
    # 1. Decode event strings from bytes
    df['event'] = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else str(x))
    
    # 2. Classify humans vs bots
    df['is_bot'] = df['user_id'].str.contains(r'^\d+$') | df['event'].isin(['BotPosition', 'BotKill', 'BotKilled'])
    
    # 3. Handle raw timestamp values (int seconds)
    ts_int = df['ts'].astype('int64')
    df['timestamp'] = ts_int

    # 4. Map configurations for UV coordinate conversion
    configs = {
        'AmbroseValley': {'scale': 900, 'origin_x': -370, 'origin_z': -473},
        'GrandRift': {'scale': 581, 'origin_x': -290, 'origin_z': -290},
        'Lockdown': {'scale': 1000, 'origin_x': -500, 'origin_z': -500}
    }

    df['u'] = 0.0
    df['v'] = 0.0

    for map_name, cfg in configs.items():
        mask = df['map_id'] == map_name
        df.loc[mask, 'u'] = (df.loc[mask, 'x'] - cfg['origin_x']) / cfg['scale']
        df.loc[mask, 'v'] = (df.loc[mask, 'z'] - cfg['origin_z']) / cfg['scale']

    # Round coordinates to 4 decimal places for efficiency
    df['u'] = df['u'].round(4)
    df['v'] = df['v'].round(4)
    df['x'] = df['x'].round(2)
    df['y'] = df['y'].round(2)
    df['z'] = df['z'].round(2)

    # Output directory setup
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public", "data")
    os.makedirs(output_dir, exist_ok=True)

    summary_list = []
    matches_dict = {}

    print("Processing match trajectories and events...")
    for match_id, m_group in df.groupby('match_id'):
        map_id = m_group['map_id'].iloc[0]
        day = m_group['day'].iloc[0]
        min_ts = int(m_group['timestamp'].min())
        max_ts = int(m_group['timestamp'].max())
        duration_s = max_ts - min_ts
        
        human_count = int((~m_group['is_bot']).nunique()) # count unique human user_ids
        bot_count = int(m_group[m_group['is_bot']]['user_id'].nunique())
        
        events_breakdown = m_group['event'].value_counts().to_dict()
        kill_count = int(events_breakdown.get('Kill', 0) + events_breakdown.get('BotKill', 0))
        death_count = int(events_breakdown.get('Killed', 0) + events_breakdown.get('BotKilled', 0) + events_breakdown.get('KilledByStorm', 0))
        loot_count = int(events_breakdown.get('Loot', 0))
        
        players = {}
        for user_id, u_group in m_group.groupby('user_id'):
            is_bot = bool(u_group['is_bot'].iloc[0])
            events = []
            for _, row in u_group.iterrows():
                rel_ts = int(row['timestamp'] - min_ts)
                events.append({
                    't': rel_ts,
                    'e': row['event'],
                    'x': float(row['x']),
                    'y': float(row['y']),
                    'z': float(row['z']),
                    'u': float(row['u']),
                    'v': float(row['v'])
                })
            # Sort events by time
            events.sort(key=lambda item: item['t'])
            players[user_id] = {
                'is_bot': is_bot,
                'events': events
            }

        summary_list.append({
            'match_id': match_id,
            'map_id': map_id,
            'day': day,
            'min_ts': min_ts,
            'max_ts': max_ts,
            'duration_s': duration_s,
            'total_players': len(players),
            'human_count': human_count,
            'bot_count': bot_count,
            'kill_count': kill_count,
            'death_count': death_count,
            'loot_count': loot_count
        })

        matches_dict[match_id] = {
            'match_id': match_id,
            'map_id': map_id,
            'day': day,
            'min_ts': min_ts,
            'max_ts': max_ts,
            'duration_s': duration_s,
            'players': players
        }

    # Sort summary by day, map, duration
    summary_list.sort(key=lambda item: (item['day'], item['map_id'], item['match_id']))

    # Write summary.json
    summary_file = os.path.join(output_dir, "summary.json")
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary_list, f, indent=2)
    print(f"Saved {summary_file} ({os.path.getsize(summary_file)/1024:.1f} KB)")

    # Write matches.json
    matches_file = os.path.join(output_dir, "matches.json")
    with open(matches_file, 'w', encoding='utf-8') as f:
        json.dump(matches_dict, f)
    print(f"Saved {matches_file} ({os.path.getsize(matches_file)/1024/1024:.2f} MB)")

    # Map-level aggregate heatmap data (all positions, kills, deaths per map)
    map_aggregates = {}
    for map_id, map_group in df.groupby('map_id'):
        positions = map_group[map_group['event'].isin(['Position', 'BotPosition'])][['u', 'v', 'is_bot']].to_dict(orient='records')
        kills = map_group[map_group['event'].isin(['Kill', 'BotKill'])][['u', 'v', 'is_bot']].to_dict(orient='records')
        deaths = map_group[map_group['event'].isin(['Killed', 'BotKilled', 'KilledByStorm'])][['u', 'v', 'event', 'is_bot']].to_dict(orient='records')
        loots = map_group[map_group['event'] == 'Loot'][['u', 'v', 'is_bot']].to_dict(orient='records')
        
        map_aggregates[map_id] = {
            'positions': positions,
            'kills': kills,
            'deaths': deaths,
            'loots': loots
        }
    
    map_agg_file = os.path.join(output_dir, "map_aggregates.json")
    with open(map_agg_file, 'w', encoding='utf-8') as f:
        json.dump(map_aggregates, f)
    print(f"Saved {map_agg_file} ({os.path.getsize(map_agg_file)/1024/1024:.2f} MB)")

    print("\nData preprocessing complete!")

if __name__ == '__main__':
    main()
