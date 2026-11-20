import jwt from 'jsonwebtoken';

// Em producao, sem segredo definido a API nao sobe (um segredo padrao deixaria qualquer um gerar login).
function segredo(nome: string, padraoDev: string) {
  const valor = process.env[nome];
  if (valor) return valor;
  if (process.env.NODE_ENV === 'production') throw new Error(`${nome} nao definido`);
  return padraoDev;
}

const SECRET = segredo('JWT_SECRET', 'default_secret');
const REFRESH_SECRET = segredo('JWT_REFRESH_SECRET', 'default_refresh_secret');

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
};
