import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { User } from '@prisma/client';
import { avisarAtividade, avisarCadastro } from './alerta.service';

export class AuthService {
  async register(data: any) {
    const { nome, email, senha, dataNascimento, consentimentoLgpd } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const passwordHash = await hashPassword(senha);

    const user = await prisma.user.create({
      data: {
        nomeCompleto: nome,
        email,
        passwordHash,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        // Aceite dos Termos e da Politica de Privacidade na criacao da conta
        consentimentoLgpd: !!consentimentoLgpd,
        consentimentoData: consentimentoLgpd ? new Date() : null,
      },
    });

    avisarCadastro(user).catch(() => {});

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: this.sanitizeUser(user), token, refreshToken };
  }

  async login(email: string, senha: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await comparePassword(senha, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() }
    });
    avisarAtividade('login', user.id, user).catch(() => {});

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: this.sanitizeUser(user), token, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
