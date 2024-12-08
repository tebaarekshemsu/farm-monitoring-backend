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
exports.postReading = void 0;
const db_1 = __importDefault(require("../config/db"));
const socketHandler_1 = __importDefault(require("../src/socketHandler"));
const postReading = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { device_id, value } = req.body;
    // Validate request data
    if (!device_id || value === undefined) {
        res.status(400).json({ error: 'Device ID and value are required' });
    }
    try {
        // Insert new reading into the "data" table
        const result = yield db_1.default.query('INSERT INTO "data" (device_id, value, timestamp) VALUES ($1, $2, NOW()) RETURNING *', [device_id, value]);
        const newData = result.rows[0];
        // Fetch device details
        const deviceResult = yield db_1.default.query('SELECT * FROM "device" WHERE device_id = $1', [device_id]);
        const device = deviceResult.rows[0];
        if (!device) {
            res.status(404).json({ error: 'Device not found' });
        }
        const { critical_high, critical_low, type, name, user_id } = device;
        let notificationMessage = '';
        // Trigger notifications for sensors
        if (type === 'sensor') {
            if (critical_high !== null && newData.value > critical_high) {
                notificationMessage = `Warning: ${name} value ${newData.value} exceeds critical high (${critical_high})!`;
            }
            else if (critical_low !== null && newData.value < critical_low) {
                notificationMessage = `Warning: ${name} value ${newData.value} is below critical low (${critical_low})!`;
            }
            if (notificationMessage) {
                socketHandler_1.default.to(user_id).emit('notification', {
                    device: name,
                    message: notificationMessage,
                    value: newData.value,
                });
            }
        }
        // Emit real-time data updates
        socketHandler_1.default.to(user_id).emit('dataUpdate', {
            device: name,
            value: newData.value,
            timestamp: newData.timestamp,
        });
        res.status(201).json({ message: 'Reading saved', data: newData });
    }
    catch (error) {
        console.error('Error saving reading:', error.message);
        // Handle foreign key constraint errors (e.g., invalid `device_id`)
        if (error.code === '23503') {
            res.status(400).json({ error: 'Invalid device ID' });
        }
        res.status(500).json({ error: 'Error saving reading' });
    }
});
exports.postReading = postReading;
