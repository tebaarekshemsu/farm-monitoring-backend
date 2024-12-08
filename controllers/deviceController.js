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
exports.registerDevice = void 0;
const db_1 = __importDefault(require("../config/db"));
// Function to register a new device
const registerDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { device_id, name, layer, unit, type, critical_high, critical_low } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id; // Extracted from authentication middleware
    // Validate user ID
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized access' });
    }
    // Validate required fields
    if (!device_id || !name || !layer || !unit || !type) {
        res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Insert the new device into the database
        const result = yield db_1.default.query('INSERT INTO "device" (device_id, name, layer, unit, type, critical_high, critical_low, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [
            device_id,
            name,
            layer,
            unit,
            type,
            critical_high || null,
            critical_low || null,
            userId,
            type === 'motor' ? 'inactive' : 'active', // Default status based on device type
        ]);
        const newDevice = result.rows[0]; // Extract the newly inserted device
        res.status(201).json({ message: 'Device registered', device: newDevice });
    }
    catch (error) {
        console.error('Error registering device:', error.message);
        // Detect duplicate device_id error (PostgreSQL specific error code)
        if (error.code === '23505') {
            res.status(409).json({ error: 'Device ID already exists' });
        }
        res.status(500).json({ error: 'Error registering device' });
    }
});
exports.registerDevice = registerDevice;
