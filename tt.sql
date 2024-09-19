USE travel_booking_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS travel_packages;

-- Create travel_packages table
CREATE TABLE travel_packages (
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
);

-- Create bookings table
CREATE TABLE bookings (
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
);

-- Create indexes
CREATE INDEX idx_travel_packages_destination ON travel_packages(destination);
CREATE INDEX idx_bookings_user_email ON bookings(email);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);

-- Insert sample data
INSERT INTO travel_packages (destination, description, price, rating, start_date, end_date, duration, image_url, facilities)
VALUES
('Paris, France', 'Romantic getaway in the City of Light', 1500.00, 4.8, '2023-07-01', '2023-07-07', 7, '/assets/location1.jpg', JSON_ARRAY('Wi-Fi', 'Breakfast', 'City Tour')),
('Tokyo, Japan', 'Experience the blend of tradition and modernity', 2000.00, 4.7, '2023-08-15', '2023-08-25', 11, '/assets/location2.jpg', JSON_ARRAY('Wi-Fi', 'Robot Hotel', 'Bullet Train Pass')),
('Bali, Indonesia', 'Relax on beautiful beaches and explore lush jungles', 1200.00, 4.6, '2023-09-01', '2023-09-08', 8, '/assets/location3.jpg', JSON_ARRAY('Pool', 'Spa', 'Scuba Diving')),
('Cairo, Egypt', 'Escape to the Egyptian culture and delicious food', 1800.00, 4.9, '2023-10-01', '2023-10-07', 7, '/assets/location4.jpg', JSON_ARRAY('Wi-Fi', 'Breakfast', 'City Tour')),
('London, UK', 'Experience the city life with a different perspective', 2500.00, 4.5, '2023-11-01', '2023-11-07', 7, '/assets/location5.jpg', JSON_ARRAY('Wi-Fi', 'Breakfast', 'City Tour')),
('Hong Kong, China', 'Experience the city life with a different perspective', 2500.00, 4.5, '2023-11-01', '2023-11-07', 7, '/assets/location6.jpg', JSON_ARRAY('Wi-Fi', 'Breakfast', 'City Tour')),
('New York, USA', 'Explore the Big Apple and its iconic landmarks', 2200.00, 4.7, '2023-12-01', '2023-12-07', 7, '/assets/location7.jpg', JSON_ARRAY('Wi-Fi', 'City Pass', 'Broadway Show')),
('Rome, Italy', 'Immerse yourself in ancient history and delicious cuisine', 1800.00, 4.8, '2024-01-15', '2024-01-22', 8, '/assets/location8.jpg', JSON_ARRAY('Wi-Fi', 'Colosseum Tour', 'Cooking Class')),
('Sydney, Australia', 'Experience the vibrant culture and stunning beaches', 2300.00, 4.6, '2024-02-01', '2024-02-08', 8, '/assets/location9.jpg', JSON_ARRAY('Wi-Fi', 'Harbor Cruise', 'Surf Lesson')),
('Bangkok, Thailand', 'Discover the bustling streets and ornate temples', 1300.00, 4.5, '2024-03-01', '2024-03-08', 8, '/assets/location10.jpg', JSON_ARRAY('Wi-Fi', 'Street Food Tour', 'Temple Visit')),
('Rio de Janeiro, Brazil', 'Enjoy the vibrant culture and beautiful beaches', 1900.00, 4.7, '2024-04-01', '2024-04-08', 8, '/assets/location11.jpg', JSON_ARRAY('Wi-Fi', 'Samba Class', 'Christ the Redeemer Tour')),
('Dubai, UAE', 'Experience luxury and modernity in the desert', 2800.00, 4.9, '2024-05-01', '2024-05-08', 8, '/assets/location12.jpg', JSON_ARRAY('Wi-Fi', 'Desert Safari', 'Burj Khalifa Visit'));


