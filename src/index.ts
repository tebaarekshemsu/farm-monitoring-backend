import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from '../routes/apiRoutes';
import io from './socketHandler';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

const server = app.listen();

io.attach(server);
