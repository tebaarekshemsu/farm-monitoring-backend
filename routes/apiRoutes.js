"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController = __importStar(require("../controllers/authController"));
const dashboardController = __importStar(require("../controllers/dashboardController"));
const deviceController = __importStar(require("../controllers/deviceController"));
const readingController = __importStar(require("../controllers/readingController"));
const setupController = __importStar(require("../controllers/setupController"));
const router = (0, express_1.Router)();
// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Dashboard Routes
router.get('/dashboard', authMiddleware_1.authenticateToken, dashboardController.getDashboard);
router.get('/dashboard-detail/:layer', authMiddleware_1.authenticateToken, dashboardController.getDashboardDetail);
// Device Routes
router.post('/device', authMiddleware_1.authenticateToken, deviceController.registerDevice);
// Reading Routes
router.post('/reading', authMiddleware_1.authenticateToken, readingController.postReading);
// Setup and Initialization Routes (Admin/Dev Use)
router.get('/setup/create-tables', setupController.createTables);
router.get('/setup/seed-database', setupController.seedDatabase);
exports.default = router;
