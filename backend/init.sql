-- Создание базы данных
CREATE DATABASE receipts;

-- Подключение к созданной базе данных
\c receipts;

-- Создание таблицы hotels
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL
);

-- Создание таблицы car_rentals
CREATE TABLE car_rentals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

-- Создание таблицы receipts
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    receipt_date TIMESTAMP NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    property_address TEXT NOT NULL,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    amount_paid DECIMAL(10, 2) NOT NULL,
    city_tax DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы activities
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    property_name VARCHAR(255) NOT NULL,
    property_address TEXT NOT NULL,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    car_model VARCHAR(100),
    car_plate VARCHAR(50),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    transfer_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных для отелей
INSERT INTO hotels (name, address, city) VALUES
('Hilton Tashkent City', 'Amir Temur Square 107/B', 'Tashkent'),
('Hyatt Regency Tashkent', 'Navoi Street 1A', 'Tashkent'),
('InterContinental Tashkent', 'Shakhrisabz Street 2', 'Tashkent'),
('Wyndham Tashkent', 'Amir Temur Avenue 56', 'Tashkent'),
('Lotte City Hotel Tashkent Palace', 'Buyuk Turon Street 56', 'Tashkent');

-- Вставка тестовых данных для компаний аренды авто
INSERT INTO car_rentals (name, address) VALUES
('Uzbekistan Airways Car Rental', 'Tashkent Airport'),
('Avis Uzbekistan', 'Downtown Tashkent'),
('Local Car Rent', 'City Center'),
('UzAuto Rent', 'Chilanzar District'),
('Express Car Rental', 'Yunusobod District');