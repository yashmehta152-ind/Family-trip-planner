import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// Minimal database interface
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

interface Trip {
  id: string;
  data: any;
}

const DATA_FILE = path.join(process.cwd(), "data.json");

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch (e) {
      return { users: [], trips: [] };
    }
  }
  return { users: [], trips: [] };
}

function saveData(data: any) {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    const data = loadData();
    
    if (data.users.find((u: User) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 9),
      email,
      passwordHash,
      name
    };

    data.users.push(newUser);
    saveData(data);

    res.json({ id: newUser.id, email: newUser.email, name: newUser.name });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const data = loadData();
    const user = data.users.find((u: User) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ id: user.id, email: user.email, name: user.name });
  });

  // Trip proxy routes
  app.get("/api/trips", (req, res) => {
     const data = loadData();
     res.json(data.trips || []);
  });

  app.get("/api/trips/code/:code", (req, res) => {
    const { code } = req.params;
    const data = loadData();
    const trip = (data.trips || []).find((t: any) => t.code === code.toUpperCase());
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  });

  app.post("/api/trips", (req, res) => {
    const trip = req.body;
    const data = loadData();
    data.trips = data.trips || [];
    const idx = data.trips.findIndex((t: any) => t.id === trip.id);
    if (idx >= 0) {
      data.trips[idx] = trip;
    } else {
      data.trips.push(trip);
    }
    saveData(data);
    res.json(trip);
  });

  app.delete("/api/trips/:id", (req, res) => {
    const { id } = req.params;
    const data = loadData();
    data.trips = (data.trips || []).filter((t: any) => t.id !== id);
    saveData(data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
