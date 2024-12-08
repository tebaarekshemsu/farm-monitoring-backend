import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as authController from '../controllers/authController';
import * as dashboardController from '../controllers/dashboardController';
import * as deviceController from '../controllers/deviceController';
import * as readingController from '../controllers/readingController';
import * as setupController from '../controllers/setupController';

const router = Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Dashboard Routes
router.get('/dashboard', authenticateToken, dashboardController.getDashboard);
router.get('/dashboard-detail/:layer', authenticateToken, dashboardController.getDashboardDetail);

// Device Routes
router.post('/device', authenticateToken, deviceController.registerDevice);

// Reading Routes
router.post('/reading', authenticateToken, readingController.postReading);

// Setup and Initialization Routes (Admin/Dev Use)
router.get('/setup/create-tables', setupController.createTables);
router.get('/setup/seed-database', setupController.seedDatabase);

export default router;
