"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.createTables = void 0;
const db_1 = __importDefault(require("../config/db"));
const createTables = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    CREATE TABLE IF NOT EXISTS "user" (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "device" (
      device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      layer INT NOT NULL CHECK (layer >= 0),
      unit VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL CHECK (status IN ('active', 'inactive')),
      type VARCHAR(255) NOT NULL CHECK (type IN ('motor', 'sensor')),
      critical_high FLOAT,
      critical_low FLOAT,
      user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "data" (
      data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id UUID REFERENCES "device"(device_id) ON DELETE CASCADE,
      value FLOAT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        yield db_1.default.query(query);
        res.status(200).json({ message: 'Tables created successfully' });
    }
    catch (error) {
        console.error('Error creating tables:', error.message);
        res.status(500).json({
            error: 'Error creating tables',
            details: error.message,
        });
    }
});
exports.createTables = createTables;
const seedDatabase = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    INSERT INTO "user" (name, email, password)
    VALUES
      ('Alice', 'alice@example.com', 'password1'),
      ('Bob', 'bob@example.com', 'password2')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO "device" (name, layer, unit, status, type, user_id)
    VALUES
      ('Temperature Sensor', 0, '°C', 'active', 'sensor', (SELECT user_id FROM "user" WHERE name='Alice')),
      ('Soil Moisture Sensor', 1, '%', 'active', 'sensor', (SELECT user_id FROM "user" WHERE name='Alice')),
      ('Irrigation Pump', 0, 'ON/OFF', 'inactive', 'motor', (SELECT user_id FROM "user" WHERE name='Alice'))
    ON CONFLICT (device_id) DO NOTHING;
  `;
    try {
        yield db_1.default.query(query);
        res.status(200).json({ message: 'Database seeded successfully' });
    }
    catch (error) {
        console.error('Error seeding database:', error.message);
        res.status(500).json({
            error: 'Error seeding database',
            details: error.message,
        });
    }
});
exports.seedDatabase = seedDatabase;
