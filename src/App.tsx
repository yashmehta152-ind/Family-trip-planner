/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { storage } from "./services/storage";
import { TripData } from "./types";
import { Loader } from "lucide-react";

import AuthScreen from "./components/AuthScreen";
import LobbyScreen from "./components/LobbyScreen";
import PlannerScreen from "./components/PlannerScreen";
import ChecklistScreen from "./components/ChecklistScreen";


const USER_SESSION_KEY = "ftv3:user";

export default function App() {
  const [screen, setScreen] = useState<"boot" | "auth" | "lobby" | "planner" | "checklist">("boot");
  const [currentUser, setCurrentUser] = useState<{ id: string, email: string, name: string } | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [openTrip, setOpenTrip] = useState<TripData | null>(null);
  const [trans, setTrans] = useState(false);

  const myName = currentUser?.name || "";

  useEffect(() => {
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (session) {
      setCurrentUser(JSON.parse(session));
      setScreen("lobby");
    } else {
      setScreen("auth");
    }
  }, []);

  useEffect(() => {
    if (screen === "lobby" && currentUser) {
      storage.getTrips().then(setTrips);
    }
  }, [screen, currentUser]);

  function go(scr: typeof screen, delay = 350) {
    setTrans(true);
    setTimeout(() => {
      setScreen(scr);
      setTrans(false);
    }, delay);
  }

  function handleAuthSuccess(user: { id: string, email: string, name: string }) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
    go("lobby", 200);
  }

  function handleLogout() {
    localStorage.removeItem(USER_SESSION_KEY);
    setCurrentUser(null);
    setScreen("auth");
  }

  async function handleJoinByCode(code: string) {
    const trip = await storage.getTripByCode(code);
    if (!trip) return false;
    
    // Add user to members if not already there
    if (!trip.members.includes(myName)) {
      const updatedMembers = [...trip.members, myName];
      await storage.updateTrip(trip.id, {
        members: updatedMembers
      });
      const updatedTrips = await storage.getTrips();
      setTrips(updatedTrips);
    }
    return true;
  }

  async function handleCreateTrip(plan: any) {
    const id = Math.random().toString(36).slice(2, 9);
    const initialCategories = [
      { id: "documents", label: "Documents", icon: "FileText", color: "#3b82f6", bg: "#eff6ff", custom: false, items: [{ id: "d1", text: "Flight / Train Tickets", checkedBy: [] }, { id: "d2", text: "ID Cards & Passports", checkedBy: [] }] },
      { id: "electronics", label: "Electronics", icon: "Zap", color: "#f59e0b", bg: "#fffbeb", custom: false, items: [{ id: "e1", text: "Phone Chargers", checkedBy: [] }, { id: "e2", text: "Power Banks", checkedBy: [] }] },
      { id: "personal-care", label: "Personal Care", icon: "Heart", color: "#ec4899", bg: "#fdf2f8", custom: false, items: [{ id: "p1", text: "Sunscreen", checkedBy: [] }, { id: "p2", text: "First-Aid Kit", checkedBy: [] }] },
      { id: "clothing", label: "Clothing", icon: "Shirt", color: "#10b981", bg: "#ecfdf5", custom: false, items: [{ id: "c1", text: "Weather-appropriate Outfits", checkedBy: [] }, { id: "c2", text: "Walking Shoes", checkedBy: [] }] },
    ];

    const tripData = {
      plan,
      categories: initialCategories,
      createdBy: myName,
      members: [myName],
    };

    await storage.createTrip(id, tripData);
    const updatedTrips = await storage.getTrips();
    setTrips(updatedTrips);
    setOpenTrip({ id, ...tripData, createdAt: new Date() } as any);
    go("checklist");
  }

  async function handleJoinTrip(trip: any) {
    if (!trip.members.includes(myName)) {
      const updatedMembers = [...trip.members, myName];
      await storage.updateTrip(trip.id, {
        members: updatedMembers
      });
      trip.members = updatedMembers;
    }
    setOpenTrip(trip);
    go("checklist");
  }

  async function handleRequestJoin(tripId: string) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newRequest = {
      id: Math.random().toString(36).slice(2, 9),
      userName: myName,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    const joinRequests = trip.joinRequests || [];
    await storage.updateTrip(tripId, {
      joinRequests: [...joinRequests, newRequest]
    });
    const updatedTrips = await storage.getTrips();
    setTrips(updatedTrips);
  }

  async function handleApproveMember(requestId: string) {
    if (!openTrip) return;
    const request = openTrip.joinRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequests = openTrip.joinRequests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' } : r
    );
    
    const updatedMembers = [...openTrip.members, request.userName];
    
    await storage.updateTrip(openTrip.id, {
      joinRequests: updatedRequests as any,
      members: updatedMembers
    });
    
    setOpenTrip({ ...openTrip, joinRequests: updatedRequests as any, members: updatedMembers });
    const updatedTrips = await storage.getTrips();
    setTrips(updatedTrips);
  }

  async function handleDeclineMember(requestId: string) {
    if (!openTrip) return;
    const updatedRequests = openTrip.joinRequests.map(r => 
      r.id === requestId ? { ...r, status: 'declined' } : r
    );
    
    await storage.updateTrip(openTrip.id, {
      joinRequests: updatedRequests as any
    });
    
    setOpenTrip({ ...openTrip, joinRequests: updatedRequests as any });
    const updatedTrips = await storage.getTrips();
    setTrips(updatedTrips);
  }

  async function handleDeleteTrip(id: string) {
    const trip = trips.find(t => t.id === id);
    if (trip?.createdBy !== myName) {
      alert("Only the trip creator can delete this trip!");
      return;
    }
    if (window.confirm("Delete this trip?")) {
      await storage.deleteTrip(id);
      const updatedTrips = await storage.getTrips();
      setTrips(updatedTrips);
    }
  }

  async function handleUpdateCategories(cats: any) {
    if (openTrip) {
      await storage.updateTrip(openTrip.id, { categories: cats });
      setOpenTrip({ ...openTrip, categories: cats });
    }
  }

  return (
    <div className={`min-h-screen font-caveat transition-opacity duration-350 bg-linear-to-br from-sky-100 via-yellow-50 to-pink-100 ${trans ? 'opacity-0' : 'opacity-100'}`}>
      {screen === "boot" && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader size={36} className="text-sky-500 animate-spin" />
          <p className="text-xl text-sky-700">Loading your adventure...</p>
        </div>
      )}

      {screen === "auth" && <AuthScreen onAuthSuccess={handleAuthSuccess} />}

      {screen === "lobby" && currentUser && (
        <LobbyScreen 
          myName={myName} 
          trips={trips} 
          onJoin={handleJoinTrip} 
          onRequestJoin={handleRequestJoin}
          onJoinByCode={handleJoinByCode}
          onNew={() => go("planner")} 
          onDelete={handleDeleteTrip}
          onLogout={handleLogout}
        />
      )}

      {screen === "planner" && (
        <PlannerScreen 
          myName={myName!} 
          onBack={() => go("lobby")} 
          onCreate={handleCreateTrip} 
        />
      )}

      {screen === "checklist" && openTrip && (
        <ChecklistScreen 
          myName={myName!} 
          trip={openTrip} 
          onBack={() => go("lobby")} 
          onUpdateCategories={handleUpdateCategories}
          onUpdateExpenses={(expenses) => {
            storage.updateTrip(openTrip.id, { expenses });
            setOpenTrip({ ...openTrip, expenses });
          }}
          onUpdateTransfers={(transfers) => {
            storage.updateTrip(openTrip.id, { transfers });
            setOpenTrip({ ...openTrip, transfers });
          }}
          onApproveMember={handleApproveMember}
          onDeclineMember={handleDeclineMember}
        />
      )}
    </div>
  );
}
