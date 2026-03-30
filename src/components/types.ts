export interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  type: string;
  sport_type?: string;
  map?: {
    summary_polyline?: string;
  };
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  timezone?: string;
  average_speed?: number;
  average_temp?: number | null;
  gear_id?: string | null;
  total_elevation_gain?: number;
  start_latlng?: [number, number] | null;
  resolved_city?: string | null;
  resolved_country?: string | null;
}

export interface ShoeData {
  id: string;
  name: string;
  distance: number;
  primary: boolean;
  retired: boolean;
}
