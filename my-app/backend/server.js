const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',  
  user: 'root',       
  password: 'bob',    
  database: 'COP4710',
});

// Password validation helper function
function isPasswordValid(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/; // At least one uppercase letter, one number, and 8 characters long
  return regex.test(password);
}

// /register endpoint
app.post('/register', (req, res) => {
    const { username, password, firstName, lastName, role } = req.body;
    const roleToInt = {
        Admin: 2,
        Student: 3,
    };
    // Validate password
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long, contain an uppercase letter, and a number.',
      });
    }
  
    // Check if username exists
    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    db.execute(checkUserQuery, [username], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking username' });
      }
  
      if (result.length > 0) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
  
      // Insert new user into the database
      const insertQuery = 'INSERT INTO Users (username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)';
      db.execute(insertQuery, [username, password, firstName, lastName, roleToInt[role]], (err, result) => {

        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error registering user' });
        }
  
        return res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
      });
    });
  });

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if username exists
    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    db.execute(checkUserQuery, [username], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking username' });
      }
  
      if (result.length === 0) {
        return res.status(400).json({ error: 'Username not found' });
      }
  
      // Check if password matches
      const user = result[0];
      if (user.password !== password) {
        return res.status(400).json({ error: 'Incorrect password' });
      }
  
      // If login is successful
      return res.status(200).json({ message: 'Login successful', userId: user.id, username: user.username });
    });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
