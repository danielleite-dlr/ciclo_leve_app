import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Routes
import { routes } from './routes';

export const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Também expõe Swagger em /api/v1/docs para quem acessa via base /api/v1
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API Ciclo Leve' });
});

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
