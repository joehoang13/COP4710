const express = require('express');
const mysql = require('mysql2/promise');
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
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// Email validation helper function
function isEmailValid(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// Update user role
app.put('/users/:id', async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  try {
    const updateRoleQuery = `UPDATE users SET role = ? WHERE id = ?`;
    await db.execute(updateRoleQuery, [role, userId]);
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Register user
app.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, role, email, universityId } = req.body;

  const roleToInt = {
    SuperAdmin: 1,
    Admin: 2,
    Student: 3,
  };

  if (!isEmailValid(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!isPasswordValid(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long, contain an uppercase letter, and a number.' });
  }

  try {
    const [userCheck] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);
    if (userCheck.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const [emailCheck] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const insertQuery = `INSERT INTO Users (username, password, first_name, last_name, email, role, university_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(insertQuery, [username, password, firstName, lastName, email, roleToInt[role], universityId]);

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(400).json({ error: 'Username not found' });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    res.status(200).json({
      message: 'Login successful',
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Create university
app.post('/universities', async (req, res) => {
  const { name, location, description, numberOfStudents } = req.body;

  if (!name || !location || !numberOfStudents) {
    return res.status(400).json({ error: 'Name, location, and number of students are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO universities (name, location, description, num_students)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertQuery, [name, location, description, numberOfStudents]);

    res.status(201).json({ message: 'University created successfully', universityId: result.insertId });
  } catch (err) {
    console.error('Error inserting university:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all universities
app.get('/universities', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM universities');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching universities:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create RSO
app.post('/rsos', async (req, res) => {
    const { name, description, universityId, adminId, studentEmails } = req.body;
  
    if (!name || !description || !universityId || !adminId || !studentEmails || studentEmails.length < 5) {
      return res.status(400).json({ error: 'All fields are required and at least 5 student emails are needed.' });
    }
  
    const connection = await db.getConnection();
    try {
      // Start the transaction
      await connection.beginTransaction();
  
      const emailDomains = studentEmails.map(email => email.split('@')[1]);
      const currentUserDomain = emailDomains[0];
      const sameDomainEmails = emailDomains.filter(domain => domain === currentUserDomain);
  
      if (sameDomainEmails.length < 5) {
        throw new Error('At least 5 members with the same email domain as the admin are required to create an RSO.');
      }
  
      const insertRSOQuery = `
        INSERT INTO rsos (name, description, university_id, admin_id) 
        VALUES (?, ?, ?, ?)
      `;
  
      const [rsoResult] = await connection.execute(insertRSOQuery, [name, description, universityId, adminId]);
      const rsoId = rsoResult.insertId;
  
      // Add admin to rso_memberships
      const adminEmail = await connection.execute('SELECT email FROM users WHERE id = ?', [adminId]);
      const filteredEmails = studentEmails.filter(email => email !== adminEmail[0].email);

      for (const email of filteredEmails) {
        const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
          const userId = users[0].id;
          await connection.execute('INSERT INTO rso_memberships (user_id, rso_id) VALUES (?, ?)', [userId, rsoId]);
        } else {
          console.error(`User with email ${email} not found`);
          // You can choose whether to throw an error here or continue.
          throw new Error(`User with email ${email} not found`);
        }
      }
  
      // Commit the transaction if everything is good
      await connection.commit();
  
      res.status(201).json({ message: 'RSO created successfully and members added.', rsoId });
    } catch (err) {
      // Rollback the transaction in case of error
      await connection.rollback();
      console.error('Error creating RSO:', err);
      res.status(500).json({ error: 'Error creating RSO' });
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  });
  

// Get all RSOs
app.get('/rsos', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM rsos');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching all RSOs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get RSOs for a user
app.get('/rsos/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [results] = await db.execute(`
      SELECT rsos.id, rsos.name, rsos.description
      FROM rsos
      JOIN rso_memberships ON rsos.id = rso_memberships.rso_id
      WHERE rso_memberships.user_id = ?
    `, [userId]);

    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching RSOs for user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get available events for a user
app.get('/events/available/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [results] = await db.execute(`
      SELECT DISTINCT e.*, 
        l.name AS location_name, 
        l.address AS address,
        l.latitude AS latitude,
        l.longitude AS longitude,
        et.name AS event_type_name,
        COALESCE(AVG(r.rating), 0) AS avg_rating
      FROM events e
      JOIN locations l ON e.location_id = l.id
      JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN rso_memberships rm ON e.rso_id = rm.rso_id AND rm.user_id = ?
      JOIN users u ON u.id = ?
      LEFT JOIN ratings r ON r.event_id = e.id
      WHERE 
        e.visibility = 'public'
        OR (e.visibility = 'private' AND e.university_id = u.university_id)
        OR (e.visibility = 'rso' AND rm.user_id IS NOT NULL)
      GROUP BY e.id
    `, [userId, userId]);

    res.json(results);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get comments for a specific event
app.get('/events/:eventId/comments', async (req, res) => {
  const { eventId } = req.params;

  try {
    const [results] = await db.execute(`
      SELECT c.id AS comment_id, c.comment, u.first_name, u.last_name, c.user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.event_id = ?
    `, [eventId]);

    res.json(results);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to an event
app.post('/events/:eventId/comments', async (req, res) => {
  const { eventId } = req.params;
  const { userId, comment } = req.body;

  if (!comment || !userId) {
    return res.status(400).json({ error: 'Comment and user ID are required' });
  }

  try {
    const [result] = await db.execute(`
      INSERT INTO comments (event_id, user_id, comment)
      VALUES (?, ?, ?)
    `, [eventId, userId, comment]);

    res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add rating to an event
app.post('/events/:eventId/rating', async (req, res) => {
    const { eventId } = req.params;
    const { userId, rating } = req.body;
  
    // Validate input
    if (rating === undefined || userId === undefined) {
      return res.status(400).json({ error: 'Rating and user ID are required' });
    }
  
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }
  
    try {
      // Check if the user has already rated the event
      const [existingRating] = await db.execute(`
        SELECT * FROM ratings WHERE event_id = ? AND user_id = ?
      `, [eventId, userId]);
  
      if (existingRating.length > 0) {
        // User has already rated this event, update the rating
        const [result] = await db.execute(`
          UPDATE ratings SET rating = ? WHERE event_id = ? AND user_id = ?
        `, [rating, eventId, userId]);
  
        if (result.affectedRows > 0) {
          return res.status(200).json({ message: 'Rating updated successfully' });
        } else {
          return res.status(400).json({ error: 'Failed to update rating' });
        }
      } else {
        // No existing rating, insert a new one
        const [result] = await db.execute(`
          INSERT INTO ratings (event_id, user_id, rating)
          VALUES (?, ?, ?)
        `, [eventId, userId, rating]);
  
        return res.status(201).json({ message: 'Rating added successfully', ratingId: result.insertId });
      }
    } catch (err) {
      console.error('Error adding/updating rating:', err);
      res.status(500).json({ error: 'Failed to process rating' });
    }
  });
  

// Join RSO
app.post('/rso_memberships', async (req, res) => {
  const { userId, rsoId } = req.body;

  if (!userId || !rsoId) {
    return res.status(400).json({ error: 'User ID and RSO ID are required.' });
  }

  try {
    const [membership] = await db.execute(`
      SELECT * FROM rso_memberships
      WHERE user_id = ? AND rso_id = ?
    `, [userId, rsoId]);

    if (membership.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this RSO.' });
    }

    const [result] = await db.execute(`
      INSERT INTO rso_memberships (user_id, rso_id)
      VALUES (?, ?)
    `, [userId, rsoId]);

    res.status(201).json({
      message: 'User successfully joined the RSO.',
      membershipId: result.insertId,
    });
  } catch (err) {
    console.error('Error adding membership:', err);
    res.status(500).json({ error: 'Failed to add user to RSO.' });
  }
});

// Get all event types
app.get('/event-types', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM event_types');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching event types:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create an event
app.post('/events', async (req, res) => {
    const {
      name,
      description,
      university_id,
      event_type_id,
      start_time,
      end_time,
      visibility,
      created_by,
      location,
      rso_id,
      contact_email,
      contact_phone_number
    } = req.body;
  
    if (!name || !description || !university_id || !event_type_id || !start_time || !end_time || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
  
      const [locationResult] = await connection.execute(`
        INSERT INTO locations (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
      `, [location.name, location.address, location.latitude, location.longitude]);
  
      const locationId = locationResult.insertId;
  
      await connection.execute(`
        INSERT INTO events (name, description, university_id, event_type_id, start_time, end_time, visibility, created_by, location_id, rso_id, contact_email, contact_phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name,
        description,
        university_id,
        event_type_id,
        start_time,
        end_time,
        visibility,
        created_by,
        locationId,
        rso_id || null,
        contact_email,
        contact_phone_number
      ]);
  
      await connection.commit();
      res.status(201).json({ message: 'Event created successfully' });
    } catch (err) {
      await connection.rollback();
      
      // If the error is a MySQL error related to the trigger, send the error message
      if (err.code === 'ER_SIGNAL_EXCEPTION') {
        res.status(400).json({ error: err.message });  // Send back the trigger error message
      } else {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Failed to create event' });
      }
    } finally {
      connection.release();
    }
  });
  

app.put('/events/:eventId/comments/:commentId', async (req, res) => {
    const { eventId, commentId } = req.params;
    const { userId, comment } = req.body;
  
    // Validate input
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
  
    try {
      // Check if the comment exists and belongs to the user
      const [existingComment] = await db.execute(`
        SELECT * FROM comments WHERE id = ? AND user_id = ?
      `, [commentId, userId]);
  
      if (existingComment.length === 0) {
        return res.status(404).json({ error: 'Comment not found or does not belong to the user' });
      }
  
      // Update the comment
      const [result] = await db.execute(`
        UPDATE comments SET comment = ? WHERE id = ?
      `, [comment, commentId]);
  
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Comment updated successfully' });
      } else {
        return res.status(400).json({ error: 'Failed to update comment' });
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  app.delete('/events/:eventId/comments/:commentId', async (req, res) => {
    const { eventId, commentId } = req.params;
    const { userId } = req.body;  // Get the user who wants to delete the comment
  
    try {
      // Directly delete the comment if it belongs to the user and is in the correct event
      const result = await db.query(
        'DELETE FROM comments WHERE id = ? AND event_id = ? AND user_id = ?',
        [commentId, eventId, userId]
      );
  
      // Check if any rows were affected (this means the comment was found and deleted)
      if (result.affectedRows === 0) {
        return res.status(404).send('Comment not found or you are not authorized to delete it');
      }
  
      res.status(200).send('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send('Internal server error');
    }
  });
  
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
