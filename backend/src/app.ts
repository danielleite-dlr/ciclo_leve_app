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

// A API roda atras de um proxy (nginx/Caddy). Sem isso o Express enxerga o IP do
// proxy em vez do IP real do cliente, e o rate limiting trataria todo mundo como 1 IP.
app.set('trust proxy', 1);

// Origens permitidas no CORS. Defina CORS_ORIGIN no .env com a(s) origem(ns) do site/app
// (varias separadas por virgula). Sem a variavel, mantem '*' para nao quebrar nada.
const corsOrigin = process.env.CORS_ORIGIN?.trim();
const corsOptions =
  corsOrigin && corsOrigin !== '*'
    ? { origin: corsOrigin.split(',').map((o) => o.trim()) }
    : {};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());

// Docs (Swagger): expostas apenas fora de producao para nao entregar o mapa da API.
if (process.env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Também expõe Swagger em /api/v1/docs para quem acessa via base /api/v1
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

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
