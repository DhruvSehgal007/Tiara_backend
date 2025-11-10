const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const session = require('express-session');

dotenv.config();

const app = express();

// ✅ Enable CORS for all origins
// ✅ Allow specific origins (local + staging)


const cors = require('cors');
const allowedOrigins = [
  "https://localhost",
  "http://localhost:8100", // Ionic dev server
  "https://staging.ekarigar.com"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed for this origin: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// explicitly handle OPTIONS preflight
app.options("*", cors());

// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure:true when using HTTPS
}));
