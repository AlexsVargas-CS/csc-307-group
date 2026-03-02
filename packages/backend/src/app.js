import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import passport from './config/passport.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
