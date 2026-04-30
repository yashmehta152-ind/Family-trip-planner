import { TripData } from '../types';

const TRIPS_KEY = 'ftv3:trips';

export const storage = {
  async getTrips(): Promise<TripData[]> {
    const res = await fetch("/api/trips");
    if (!res.ok) return [];
    return await res.json();
  },

  async getTrip(id: string): Promise<TripData | null> {
    const trips = await this.getTrips();
    return trips.find(t => t.id === id) || null;
  },

  async createTrip(id: string, data: any): Promise<void> {
    const code = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const trip = { ...data, id, code, createdAt: new Date().toISOString() };
    await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });
  },

  async getTripByCode(code: string): Promise<TripData | null> {
    const res = await fetch(`/api/trips/code/${code}`);
    if (!res.ok) return null;
    return await res.json();
  },

  async updateTrip(id: string, data: Partial<TripData>): Promise<void> {
    const existing = await this.getTrip(id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  },

  async deleteTrip(id: string): Promise<void> {
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
  },

  subscribeToTrip(id: string, callback: (data: TripData | null) => void) {
    this.getTrip(id).then(callback);
    return () => {};
  },

  subscribeToTrips(callback: (trips: TripData[]) => void) {
    this.getTrips().then(callback);
    return () => {};
  }
};
