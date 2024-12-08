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
exports.getDashboardDetail = exports.getDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
// Function to fetch the dashboard data
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized access' });
    }
    try {
        // Fetch devices associated with the user
        const devices = yield db_1.default.query('SELECT * FROM device WHERE user_id = $1', [userId]);
        // Respond with the fetched devices
        res.status(200).json(devices.rows);
    }
    catch (error) {
        console.error('Error fetching dashboard:', error.message);
        res.status(500).json({ error: 'Error fetching dashboard' });
    }
});
exports.getDashboard = getDashboard;
// Function to fetch detailed dashboard data for a specific layer
const getDashboardDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
    const { layer } = req.params;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized access' });
    }
    if (!layer) {
        res.status(400).json({ error: 'Layer parameter is required' });
    }
    try {
        // Fetch detailed data for the specified layer
        const data = yield db_1.default.query(`SELECT d.*, da.value, da.timestamp
       FROM device d
       LEFT JOIN data da ON d.device_id = da.device_id
       WHERE d.user_id = $1 AND d.layer = $2
       ORDER BY da.timestamp DESC`, [userId, layer]);
        // Respond with the fetched data
        res.status(200).json(data.rows);
    }
    catch (error) {
        console.error('Error fetching layer details:', error.message);
        res.status(500).json({ error: 'Error fetching layer details' });
    }
});
exports.getDashboardDetail = getDashboardDetail;
