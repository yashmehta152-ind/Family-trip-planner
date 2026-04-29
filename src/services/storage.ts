import { TripData } from '../types';

const TRIPS_KEY = 'ftv3:trips';

export const storage = {
  getTrips(): TripData[] {
    const data = localStorage.getItem(TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getTrip(id: string): Promise<TripData | null> {
    const trips = this.getTrips();
    return trips.find(t => t.id === id) || null;
  },

  async createTrip(id: string, data: any): Promise<void> {
    const trips = this.getTrips();
    const newTrip = { ...data, id, createdAt: new Date().toISOString() };
    localStorage.setItem(TRIPS_KEY, JSON.stringify([...trips, newTrip]));
  },

  async updateTrip(id: string, data: Partial<TripData>): Promise<void> {
    const trips = this.getTrips();
    const updated = trips.map(t => t.id === id ? { ...t, ...data } : t);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
  },

  async deleteTrip(id: string): Promise<void> {
    const trips = this.getTrips();
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips.filter(t => t.id !== id)));
  },

  subscribeToTrip(id: string, callback: (data: TripData | null) => void) {
    // Simple polling for "sync" simulation in local mode if needed, 
    // or just trigger callback immediately
    this.getTrip(id).then(callback);
    return () => {}; // No-op for local
  },

  subscribeToTrips(callback: (trips: TripData[]) => void) {
    callback(this.getTrips());
    return () => {}; // No-op for local
  }
};
