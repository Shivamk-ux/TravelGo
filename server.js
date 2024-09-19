const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: 'root123',
  database: 'travel_booking_db',
  connectionLimit: 10
});

function initDatabase() {
  const createTravelPackagesTable = `
    CREATE TABLE IF NOT EXISTS travel_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      destination VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      rating DECIMAL(3, 2) DEFAULT 0,
      start_date DATE,
      end_date DATE,
      duration INT NOT NULL,
      image_url VARCHAR(255),
      facilities JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      package_id INT NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      travelers INT NOT NULL,
      travel_date DATE NOT NULL,
      special_requests TEXT,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (package_id) REFERENCES travel_packages(id) ON DELETE CASCADE
    )
  `;

  db.query(createTravelPackagesTable, (err) => {
    if (err) console.error('Error creating travel_packages table:', err);
    else console.log('travel_packages table created or already exists');
  });

  db.query(createBookingsTable, (err) => {
    if (err) console.error('Error creating bookings table:', err);
    else console.log('bookings table created or already exists');
  });
}

initDatabase();

app.get('/api/packages', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = 'SELECT * FROM travel_packages LIMIT ? OFFSET ?';
  db.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error('Error fetching packages:', err);
      res.status(500).json({ error: 'An error occurred while fetching packages' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/packages/search', (req, res) => {
  const { destination, startDate, endDate, minPrice, maxPrice, minRating } = req.query;
  let sql = 'SELECT * FROM travel_packages WHERE 1=1';
  const values = [];

  if (destination) {
    sql += ' AND destination LIKE ?';
    values.push(`%${destination}%`);
  }
  if (startDate && endDate) {
    sql += ' AND start_date >= ? AND end_date <= ?';
    values.push(startDate, endDate);
  }
  if (minPrice && !isNaN(minPrice)) {
    sql += ' AND price >= ?';
    values.push(parseFloat(minPrice));
  }
  if (maxPrice && !isNaN(maxPrice)) {
    sql += ' AND price <= ?';
    values.push(parseFloat(maxPrice));
  }
  if (minRating && !isNaN(minRating)) {
    sql += ' AND rating >= ?';
    values.push(parseFloat(minRating));
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error searching packages:', err);
      res.status(500).json({ error: 'An error occurred while searching packages' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/packages/:id', (req, res) => {
  const sql = 'SELECT * FROM travel_packages WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching package details:', err);
      res.status(500).json({ error: 'An error occurred while fetching package details' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }
    const package = result[0];
    try {
      package.facilities = JSON.parse(package.facilities || '[]');
    } catch (jsonError) {
      console.error('Error parsing facilities JSON:', jsonError);
      package.facilities = [];
    }
    res.json(package);
  });
});

app.post('/api/bookings', (req, res) => {
  const { package_id, user_name, email, phone, travelers, travel_date, special_requests } = req.body;

  if (!package_id || !user_name || !email || !travelers || !travel_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'INSERT INTO bookings (package_id, user_name, email, phone, travelers, travel_date, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [package_id, user_name, email, phone, travelers, travel_date, special_requests], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      res.status(500).json({ error: 'An error occurred while creating the booking' });
      return;
    }
    res.json({ message: 'Booking created successfully', id: result.insertId });
  });
});

app.get('/api/featured-packages', (req, res) => {
  const sql = 'SELECT * FROM travel_packages WHERE rating >= 4.5 ORDER BY rating DESC LIMIT 5';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching featured packages:', err);
      res.status(500).json({ error: 'An error occurred while fetching featured packages' });
      return;
    }
    res.json(results);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
