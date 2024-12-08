import { Request, Response } from 'express';
import pool from '../config/db';
import io from '../socketHandler';
import { Data } from '../models/types';
import { RequestWithUser } from '../types/RequestWithUser';

export const postReading = async (req: RequestWithUser, res: Response): Promise<void> => {
  const { device_id, value } = req.body;

  // Validate request data
  if (!device_id || value === undefined) {
  res.status(400).json({ error: 'Device ID and value are required' });
  }

  try {
    // Insert new reading into the "data" table
    const result = await pool.query(
      'INSERT INTO "data" (device_id, value, timestamp) VALUES ($1, $2, NOW()) RETURNING *',
      [device_id, value]
    );

    const newData: Data = result.rows[0];

    // Fetch device details
    const deviceResult = await pool.query(
      'SELECT * FROM "device" WHERE device_id = $1',
      [device_id]
    );

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
      } else if (critical_low !== null && newData.value < critical_low) {
        notificationMessage = `Warning: ${name} value ${newData.value} is below critical low (${critical_low})!`;
      }

      if (notificationMessage) {
        io.to(user_id).emit('notification', {
          device: name,
          message: notificationMessage,
          value: newData.value,
        });
      }
    }

    // Emit real-time data updates
    io.to(user_id).emit('dataUpdate', {
      device: name,
      value: newData.value,
      timestamp: newData.timestamp,
    });

    res.status(201).json({ message: 'Reading saved', data: newData });
  } catch (error: any) {
    console.error('Error saving reading:', error.message);

    // Handle foreign key constraint errors (e.g., invalid `device_id`)
    if (error.code === '23503') {
       res.status(400).json({ error: 'Invalid device ID' });
    }

    res.status(500).json({ error: 'Error saving reading' });
  }
};
