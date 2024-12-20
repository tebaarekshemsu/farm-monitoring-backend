import { Request, Response } from 'express';
import pool from '../config/db';import { RequestWithUser } from '../types/RequestWithUser';


// Function to fetch the dashboard data
export const getDashboard = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    // Fetch devices along with their latest value
    const devices = await pool.query(
      `
      SELECT 
        d.name AS name,
        d.layer AS layer,
        d.unit AS unit,
        d.status AS status,
        d.type AS type,
        latest_data.value AS value
      FROM device d
      LEFT JOIN (
        SELECT 
          device_id,
          value,
          timestamp
        FROM data
        WHERE (device_id, timestamp) IN (
          SELECT device_id, MAX(timestamp) AS max_timestamp
          FROM data
          GROUP BY device_id
        )
      ) latest_data ON d.device_id = latest_data.device_id
      `
    );

    // Respond with the fetched data
    res.status(200).json(devices.rows);
    return;
  } catch (error: any) {
    console.error('Error fetching dashboard:', error.message);
    res.status(500).json({ error: 'Error fetching dashboard' });
    return;
  }
};


// Function to fetch detailed dashboard data for a specific layer
export const getDashboardDetail = async (req: RequestWithUser, res: Response): Promise<void> => {
  // const userId = req.user?.user_id;
  const { layer } = req.params;

  // if (!userId) {
  //   res.status(401).json({ error: 'Unauthorized access' });
  // }

  if (!layer) {
    res.status(400).json({ error: 'Layer parameter is required' });
    return;
  }

  try {
    // Fetch detailed data for the specified layer
    const data = await pool.query(
      `SELECT d.*, da.value, da.timestamp
       FROM device d
       LEFT JOIN data da ON d.device_id = da.device_id
       WHERE  d.layer = $1
       ORDER BY da.timestamp DESC`,
      [layer]
    );

    // Respond with the fetched data
    res.status(200).json(data.rows);
    return;
  } catch (error: any) {
    console.error('Error fetching layer details:', error.message);
     res.status(500).json({ error: 'Error fetching layer details' });
     return;
  }
};
