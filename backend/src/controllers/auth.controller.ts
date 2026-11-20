import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/user.schema';
import { z } from 'zod';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      const result = await authService.register(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) 
        });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = loginSchema.parse(req.body);
      const result = await authService.login(email, senha);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      // Resposta uniforme: nunca revela se o e-mail existe ou se a senha e que estava errada.
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  }
}
