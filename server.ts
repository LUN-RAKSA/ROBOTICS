import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent data paths
const DATA_DIR = path.join(process.cwd(), "data");
const SATURDAY_FILE = path.join(DATA_DIR, "saturday_students.json");
const SUNDAY_FILE = path.join(DATA_DIR, "sunday_students.json");
const LOGIN_EVENTS_FILE = path.join(DATA_DIR, "login_events.json");

// Initial seeds
const INITIAL_STUDENTS = [
  {
    id: 'STU01',
    fullName: 'SOPHIA MARTINEZ',
    age: 18,
    course: 'Level 1',
    session: 'Session01',
    level: '3D',
    email: 'sophia.m@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'A', week4: 'P', week5: 'L', week6: 'P', week7: 'E', week8: 'P'
    }
  },
  {
    id: 'STU02',
    fullName: 'ALEXANDER WRIGHT',
    age: 17,
    course: 'Level 2',
    session: 'Session02',
    level: 'Python',
    email: 'a.wright@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'A', week5: 'P', week6: 'L', week7: 'P'
    }
  },
  {
    id: 'STU03',
    fullName: 'EMILY JOHNSON',
    age: 15,
    course: 'Level 3',
    session: 'Session03',
    level: 'Sensor',
    email: 'emily.j@school.edu',
    attendance: {
      week1: 'P', week2: 'A', week3: 'L', week4: 'P', week5: 'P', week6: 'E', week7: 'P', week8: 'P'
    }
  },
  {
    id: 'STU04',
    fullName: 'DANIEL KIM',
    age: 18,
    course: 'Level 4',
    session: 'Session04',
    level: 'AI',
    email: 'd.kim2026@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'P', week5: 'A', week6: 'P', week7: 'P'
    }
  },
  {
    id: 'STU05',
    fullName: 'OLIVIA CHEN',
    age: 17,
    course: 'Level 5',
    session: 'Session05',
    level: 'Super:Bit',
    email: 'o.chen@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'L', week5: 'P', week6: 'P', week7: 'P', week8: 'A'
    }
  }
];

const INITIAL_SUNDAY_STUDENTS = INITIAL_STUDENTS.map(s => {
  if (s.id === 'STU01') return { ...s, fullName: 'AMARA SATO', email: 'amara.sato@school.edu' };
  if (s.id === 'STU02') return { ...s, fullName: 'LIAM O\'CONNOR', email: 'liam.oc@school.edu' };
  return s;
});

const INITIAL_LOGIN_EVENTS = [
  {
    id: 'LOG005',
    email: 'raksalun7@gmail.com',
    role: 'admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    browser: 'Chrome',
    platform: 'macOS',
    ipAddress: '103.216.142.18'
  },
  {
    id: 'LOG004',
    email: 'srun.vanna@school.co.kh',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    browser: 'Safari',
    platform: 'iOS',
    ipAddress: '116.12.44.89'
  },
  {
    id: 'LOG003',
    email: 'chhay.kim@robotics.edu',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    browser: 'Firefox',
    platform: 'Windows',
    ipAddress: '203.189.155.201'
  },
  {
    id: 'LOG002',
    email: 'seyha.ly@gmail.com',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    browser: 'Chrome',
    platform: 'Android',
    ipAddress: '175.100.22.14'
  },
  {
    id: 'LOG001',
    email: 'raksalun7@gmail.com',
    role: 'admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    browser: 'Chrome',
    platform: 'macOS',
    ipAddress: '103.216.142.18'
  }
];

// Ensure file storage setup is initialized
function ensureDataSetup() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SATURDAY_FILE)) {
    fs.writeFileSync(SATURDAY_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2));
  }
  if (!fs.existsSync(SUNDAY_FILE)) {
    fs.writeFileSync(SUNDAY_FILE, JSON.stringify(INITIAL_SUNDAY_STUDENTS, null, 2));
  }
  if (!fs.existsSync(LOGIN_EVENTS_FILE)) {
    fs.writeFileSync(LOGIN_EVENTS_FILE, JSON.stringify(INITIAL_LOGIN_EVENTS, null, 2));
  }
}

// Helpers
function readStudents(day: string): any[] {
  ensureDataSetup();
  const filePath = day === "sunday" ? SUNDAY_FILE : SATURDAY_FILE;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${day} students:`, error);
    return day === "sunday" ? INITIAL_SUNDAY_STUDENTS : INITIAL_STUDENTS;
  }
}

function writeStudents(day: string, students: any[]) {
  ensureDataSetup();
  const filePath = day === "sunday" ? SUNDAY_FILE : SATURDAY_FILE;
  fs.writeFileSync(filePath, JSON.stringify(students, null, 2));
}

function readLoginEvents(): any[] {
  ensureDataSetup();
  try {
    const content = fs.readFileSync(LOGIN_EVENTS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading login events:", error);
    return INITIAL_LOGIN_EVENTS;
  }
}

function writeLoginEvents(events: any[]) {
  ensureDataSetup();
  fs.writeFileSync(LOGIN_EVENTS_FILE, JSON.stringify(events, null, 2));
}

// REST API Routes
app.get("/api/students/:day", (req, res) => {
  const { day } = req.params;
  const students = readStudents(day);
  res.json(students);
});

app.post("/api/students/:day", (req, res) => {
  const { day } = req.params;
  const newStudent = req.body;
  const students = readStudents(day);
  
  // Guard for duplicate ID
  if (students.some(s => s.id === newStudent.id)) {
    return res.status(400).json({ error: "Student ID already exists." });
  }

  students.push(newStudent);
  writeStudents(day, students);
  res.status(201).json(newStudent);
});

app.put("/api/students/:day/:id", (req, res) => {
  const { day, id } = req.params;
  const updatedFields = req.body;
  const students = readStudents(day);
  
  const index = students.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  students[index] = { ...students[index], ...updatedFields };
  writeStudents(day, students);
  res.json(students[index]);
});

app.delete("/api/students/:day/:id", (req, res) => {
  const { day, id } = req.params;
  const students = readStudents(day);
  
  const index = students.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  const deleted = students.splice(index, 1);
  writeStudents(day, students);
  res.json({ success: true, deleted: deleted[0] });
});

app.post("/api/students/:day/reset", (req, res) => {
  const { day } = req.params;
  const initial = day === "sunday" ? INITIAL_SUNDAY_STUDENTS : INITIAL_STUDENTS;
  writeStudents(day, initial);
  res.json(initial);
});

app.get("/api/login-events", (req, res) => {
  const events = readLoginEvents();
  res.json(events);
});

app.delete("/api/login-events", (req, res) => {
  writeLoginEvents([]);
  res.json({ success: true });
});

app.post("/api/login-events", (req, res) => {
  const newEvent = req.body;
  const events = readLoginEvents();
  events.unshift(newEvent);
  writeLoginEvents(events);
  res.status(201).json(newEvent);
});

async function run() {
  ensureDataSetup();

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
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

run();
