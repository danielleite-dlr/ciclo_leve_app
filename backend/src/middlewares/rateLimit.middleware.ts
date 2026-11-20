import rateLimit from 'express-rate-limit';

// Rate limiting para rotas sensiveis de autenticacao.
// Protege contra forca-bruta de senha e abuso do cadastro.
// Atras de proxy (nginx/Caddy) o Express precisa de 'trust proxy' para ler o IP real.

const mensagem = { error: 'Muitas tentativas. Tente novamente em alguns minutos.' };

// Login: janela de 15 min, no maximo 10 tentativas por IP.
// Conta apenas as que falham (skipSuccessfulRequests) para nao punir quem acerta.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensagem,
});

// Cadastro: janela de 1 hora, no maximo 5 contas por IP.
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensagem,
});
