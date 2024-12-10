import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes';
import io from './socketHandler';
const cors = require("cors");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen();

io.attach(server);
