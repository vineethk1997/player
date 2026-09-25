import os
import pyarrow.parquet as pq
import pandas as pd
import numpy as np

def analyze():
    raw_data_dir = r"C:\Users\vinee\OneDrive\Desktop\player_data\player_data"
    days = ['February_10', 'February_11', 'February_12', 'February_13', 'February_14']
    
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
                all_dfs.append(m_df)
            except Exception as e:
                pass

    df = pd.concat(all_dfs, ignore_index=True)
    df['event'] = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else str(x))
    df['is_bot'] = df['user_id'].str.contains(r'^\d+$') | df['event'].isin(['BotPosition', 'BotKill', 'BotKilled'])

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

    print("=== INSIGHT 1 VERIFICATION: AMBROSE VALLEY CHOKEPOINT ===")
    av_df = df[df['map_id'] == 'AmbroseValley']
    av_kills = av_df[av_df['event'].isin(['Kill', 'Killed', 'BotKill', 'BotKilled'])]
    # Central corridor bounds u: 0.30-0.50, v: 0.40-0.60
    choke_kills = av_kills[(av_kills['u'] >= 0.30) & (av_kills['u'] <= 0.50) & (av_kills['v'] >= 0.40) & (av_kills['v'] <= 0.60)]
    print(f"Ambrose Valley Total Combat Kills/Deaths: {len(av_kills)}")
    print(f"Kills in Central Canyon Chokepoint (u: 0.3-0.5, v: 0.4-0.6): {len(choke_kills)} ({len(choke_kills)/len(av_kills)*100:.1f}%)")

    print("\n=== INSIGHT 2 VERIFICATION: BOT MOVEMENT & DEATHS ===")
    gr_df = df[df['map_id'] == 'GrandRift']
    bot_positions = gr_df[gr_df['event'] == 'BotPosition']
    bot_deaths = gr_df[gr_df['event'] == 'BotKilled']
    print(f"Grand Rift Bot Position events: {len(bot_positions)}")
    print(f"Grand Rift Bot Deaths: {len(bot_deaths)}")

    print("\n=== INSIGHT 3 VERIFICATION: STORM DEATHS ON LOCKDOWN ===")
    storm_deaths = df[df['event'] == 'KilledByStorm']
    lockdown_storm = storm_deaths[storm_deaths['map_id'] == 'Lockdown']
    print(f"Total Storm Deaths Across All Maps: {len(storm_deaths)}")
    print(f"Storm Deaths on Lockdown: {len(lockdown_storm)} / {len(storm_deaths)} ({len(lockdown_storm)/len(storm_deaths)*100:.1f}%)")

if __name__ == '__main__':
    analyze()
