// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Create/connect to SQLite database
const db = new sqlite3.Database('./weconnect.db', (err) => {
  if (err) console.error(err);
  console.log('Connected to SQLite database');
});

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    matricNumber TEXT UNIQUE,
    school TEXT,
    faculty TEXT,
    department TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )
`);

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, matricNumber, school, faculty, department, email, password, role } = req.body;

  if (!name || !matricNumber || !school || !faculty || !department || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, matricNumber, school, faculty, department, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, matricNumber, school, faculty, department, email, hashedPassword, role],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Email or Matric Number already exists' });
          }
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Remove password from response
    delete user.password;

    res.json({ message: 'Login successful', user });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));