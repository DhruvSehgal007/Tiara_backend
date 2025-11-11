const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

// ✅ Updated allowed origins
const allowedOrigins = [
  "http://localhost:8100",
  "http://127.0.0.1:8100",
  "https://localhost",         // <-- add this
  "capacitor://localhost",
  "https://staging.ekarigar.com"
];

// ✅ CORS setup (keep this BEFORE routes)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.error("❌ CORS blocked origin:", origin);
    return callback(new Error("CORS not allowed for this origin: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Preflight support
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes (after CORS)
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
