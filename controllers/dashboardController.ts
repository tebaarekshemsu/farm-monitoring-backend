import { Request, Response } from 'express';
import pool from '../config/db';

// Function to fetch the dashboard data
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.user_id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized access' });
  }

  try {
    // Fetch devices associated with the user
    const devices = await pool.query(
      'SELECT * FROM device WHERE user_id = $1',
      [userId]
    );

    // Respond with the fetched devices
  res.status(200).json(devices.rows);
  } catch (error: any) {
    console.error('Error fetching dashboard:', error.message);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
};

// Function to fetch detailed dashboard data for a specific layer
export const getDashboardDetail = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.user_id;
  const { layer } = req.params;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized access' });
  }

  if (!layer) {
    res.status(400).json({ error: 'Layer parameter is required' });
  }

  try {
    // Fetch detailed data for the specified layer
    const data = await pool.query(
      `SELECT d.*, da.value, da.timestamp
       FROM device d
       LEFT JOIN data da ON d.device_id = da.device_id
       WHERE d.user_id = $1 AND d.layer = $2
       ORDER BY da.timestamp DESC`,
      [userId, layer]
    );

    // Respond with the fetched data
    res.status(200).json(data.rows);
  } catch (error: any) {
    console.error('Error fetching layer details:', error.message);
     res.status(500).json({ error: 'Error fetching layer details' });
  }
};
