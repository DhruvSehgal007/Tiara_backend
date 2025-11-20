const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const session = require("express-session");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

// ✅ Allow all origins
app.use(cors({
  origin: true,             // Reflects the request origin (like '*', but allows credentials)
  credentials: true,        // Allows cookies/sessions if needed
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight
app.options("*", cors());

// ✅ Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session (optional)
// app.use(session({
//   secret: process.env.SESSION_SECRET || "default_secret",
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }));

// ✅ Routes
app.use("/api", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
