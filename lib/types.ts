export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerActivityStatus {
  id: number;
  player_id: number;
  activity_id: number;
  is_completed: boolean;
  completed_at: string | null;
}

// Activity enriched with this player's completion state
export interface ChecklistEntry extends Activity {
  is_completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  completed: number;
  total: number;
}
