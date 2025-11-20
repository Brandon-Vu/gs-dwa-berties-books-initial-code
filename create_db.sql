# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the tables
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id));

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  first VARCHAR(50),
  last VARCHAR(50),
  email VARCHAR(255),
  hashedPassword VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS login_audit (
  id INT AUTO_INCREMENT,
  username VARCHAR(50),
  success BOOLEAN,
  ip_address VARCHAR(45),
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);