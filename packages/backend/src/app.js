import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

import { registerUser, loginUser } from "./auth.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Authentication
app.post("/signup", registerUser);
app.post("/login", loginUser);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
