import { Request, Response } from 'express';
import pool from '../config/db';
import { Device } from '../models/types';

// Function to register a new device
export const registerDevice = async (req: Request, res: Response): Promise<void> => {
  const { device_id, name, layer, unit, type, critical_high, critical_low } = req.body;
  const userId = req.user?.user_id; // Extracted from authentication middleware

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
    const result = await pool.query(
      'INSERT INTO "device" (device_id, name, layer, unit, type, critical_high, critical_low, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        device_id,
        name,
        layer,
        unit,
        type,
        critical_high || null,
        critical_low || null,
        userId,
        type === 'motor' ? 'inactive' : 'active', // Default status based on device type
      ]
    );

    const newDevice: Device = result.rows[0]; // Extract the newly inserted device
    res.status(201).json({ message: 'Device registered', device: newDevice });
  } catch (error: any) {
    console.error('Error registering device:', error.message);

    // Detect duplicate device_id error (PostgreSQL specific error code)
    if (error.code === '23505') {
      res.status(409).json({ error: 'Device ID already exists' });
    }

    res.status(500).json({ error: 'Error registering device' });
  }
};
