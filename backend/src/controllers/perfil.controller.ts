import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CicloService } from '../services/ciclo.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { recommendationService, Sintomas } from '../services/recommendation.service';
import { comparePassword, hashPassword } from '../utils/bcrypt';

const cicloService = new CicloService();

export class PerfilController {
  async getPerfil(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      
      const userId = req.user.id;

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Get cycle profile
      const perfilCiclo = await cicloService.getPerfil(userId);

      // Calculate current phase
      const faseAtual = cicloService.calcularFaseAtual(perfilCiclo);

      // Buscar último registro diário para alimentar sintomasHoje
      // So vale o registro de HOJE (o app manda ?hoje=AAAA-MM-DD no fuso da usuaria);
      // um registro antigo nao deve gerar dicas para o dia atual.
      const hojeStr =
        typeof req.query.hoje === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.hoje)
          ? req.query.hoje
          : new Date().toISOString().slice(0, 10);
      const ultimoRegistroQualquer = await prisma.registroDiario.findFirst({
        where: { userId },
        orderBy: { dataRegistro: 'desc' },
      });
      const ultimoRegistro =
        ultimoRegistroQualquer && ultimoRegistroQualquer.dataRegistro.toISOString().slice(0, 10) === hojeStr
          ? ultimoRegistroQualquer
          : null;

      const sintomasHoje: Sintomas = {
        inchaco: ultimoRegistro?.inchaco ?? 0,
        fomeCompulsao: ultimoRegistro?.fomeCompulsao ?? 0,
        humorIrritacao: ultimoRegistro?.humorIrritacao ?? 0,
        qualidadeSono: ultimoRegistro?.qualidadeSono ?? 0,
      };

      // Gera recomendações consolidadas (ainda não expostas no payload na etapa 3.1)
      const recomendacoes = recommendationService.gerarRecomendacoes({
        fase: faseAtual?.fase ?? null,
        diaCiclo: faseAtual?.diaCiclo ?? null,
        sintomasHoje,
        sintomasOntem: undefined,
      });

      // Parse JSON fields if necessary (Prisma handles JSON, but sometimes it needs manual check)
      if (perfilCiclo && perfilCiclo.objetivos && typeof perfilCiclo.objetivos === 'string') {
        perfilCiclo.objetivos = JSON.parse(perfilCiclo.objetivos);
      }

      const { passwordHash, ...userClean } = user;

      // Monta insight consolidado a partir das recomendações
      const mensagemFase = recomendacoes.mensagemFase;
      const insight = mensagemFase
        ? {
            titulo: mensagemFase.titulo,
            emoji: mensagemFase.emoji,
            descricao: mensagemFase.tendeDia,
            facaHoje: mensagemFase.faca,
            eviteHoje: mensagemFase.evite,
            notaEspecialista: recomendacoes.notaEspecialista,
            dicasExtras: recomendacoes.dicasExtras,
          }
        : {
            titulo: 'Energia em Alta',
            emoji: '✨',
            descricao: 'Siga seu ritmo.',
            facaHoje: [],
            eviteHoje: [],
            notaEspecialista: recomendacoes.notaEspecialista,
            dicasExtras: recomendacoes.dicasExtras,
          };

      res.json({
        user: userClean,
        ciclo: perfilCiclo,
        faseAtual: faseAtual ? { ...faseAtual, insight } : null,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async atualizarCiclo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      
      const userId = req.user.id;
      const dados = req.body;

      // Basic validation of required fields
      if (!dados.modoCiclo || !dados.dataUltimaMenstruacao) {
        return res.status(400).json({ error: 'Campos obrigatórios: modoCiclo, dataUltimaMenstruacao' });
      }

      const perfil = await cicloService.atualizarPerfil(userId, dados);

      // Dados do corpo (opcionais) enviados pelo onboarding junto com o ciclo.
      await this.atualizarDadosCorpo(userId, dados);

      // Recalculate phase with new data
      const faseAtual = cicloService.calcularFaseAtual(perfil);

      res.json({
        message: 'Perfil de ciclo atualizado com sucesso',
        ciclo: perfil,
        faseAtual
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /perfil { nomeCompleto?, dataNascimento? (AAAA-MM-DD), alturaCm?, pesoKg? }
  async atualizarDados(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      const b = req.body ?? {};
      const data: { nomeCompleto?: string; dataNascimento?: Date | null; alturaCm?: number | null; pesoKg?: number | null } = {};

      if (b.nomeCompleto !== undefined) {
        const nome = String(b.nomeCompleto).trim();
        if (nome.length < 2) return res.status(400).json({ error: 'Nome deve ter no mínimo 2 caracteres' });
        data.nomeCompleto = nome;
      }
      if (b.dataNascimento !== undefined) {
        if (b.dataNascimento === null || b.dataNascimento === '') data.dataNascimento = null;
        else {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.dataNascimento))) return res.status(400).json({ error: 'Data de nascimento inválida' });
          const d = new Date(`${b.dataNascimento}T00:00:00.000Z`);
          const idade = calcularIdade(d, new Date());
          if (Number.isNaN(d.getTime()) || idade < 10 || idade > 80) return res.status(400).json({ error: 'Data de nascimento inválida' });
          data.dataNascimento = d;
        }
      }
      if (b.alturaCm !== undefined) {
        if (b.alturaCm === null || b.alturaCm === '') data.alturaCm = null;
        else {
          const a = Number(String(b.alturaCm).replace(',', '.'));
          if (!Number.isFinite(a) || a < 100 || a > 250) return res.status(400).json({ error: 'Altura deve estar entre 100 e 250 cm' });
          data.alturaCm = Math.round(a);
        }
      }
      if (b.pesoKg !== undefined) {
        if (b.pesoKg === null || b.pesoKg === '') data.pesoKg = null;
        else {
          const p = Number(String(b.pesoKg).replace(',', '.'));
          if (!Number.isFinite(p) || p < 20 || p > 300) return res.status(400).json({ error: 'Peso deve estar entre 20 e 300 kg' });
          data.pesoKg = Math.round(p * 100) / 100;
        }
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: { nomeCompleto: true, dataNascimento: true, alturaCm: true, pesoKg: true },
      });
      res.json({ user });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  // PUT /perfil/senha { senhaAtual, novaSenha }
  async alterarSenha(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      const { senhaAtual, novaSenha } = req.body ?? {};
      if (typeof senhaAtual !== 'string' || typeof novaSenha !== 'string') {
        return res.status(400).json({ error: 'Informe a senha atual e a nova senha' });
      }
      if (novaSenha.length < 6) return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });

      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true } });
      if (!user || !(await comparePassword(senhaAtual, user.passwordHash))) {
        return res.status(403).json({ error: 'Senha atual incorreta' });
      }
      await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await hashPassword(novaSenha) } });
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  // DELETE /perfil { senha } - exclusao definitiva da conta e de todos os dados (LGPD; exigencia da Apple).
  // As tabelas do usuario apagam em cascata; eventos de analytics ficam anonimos (user_id = null).
  async excluirConta(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      const senha = req.body?.senha;
      if (typeof senha !== 'string' || !senha) return res.status(400).json({ error: 'Informe sua senha para confirmar' });

      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true } });
      if (!user) return res.status(404).json({ error: 'Conta não encontrada' });
      if (!(await comparePassword(senha, user.passwordHash))) {
        return res.status(403).json({ error: 'Senha incorreta' });
      }

      await prisma.user.delete({ where: { id: req.user.id } });
      res.json({ message: 'Conta excluída com sucesso' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  // alturaCm, pesoKg e idade sao opcionais; valores fora da faixa sao ignorados.
  private async atualizarDadosCorpo(userId: string, dados: any) {
    const num = (v: any) => (v === null || v === undefined || v === '' ? undefined : Number(v));
    const altura = num(dados.alturaCm);
    const peso = num(dados.pesoKg);
    const idade = num(dados.idade);

    const data: { alturaCm?: number; pesoKg?: number; dataNascimento?: Date } = {};
    if (altura !== undefined && Number.isFinite(altura) && altura >= 100 && altura <= 250) data.alturaCm = Math.round(altura);
    if (peso !== undefined && Number.isFinite(peso) && peso >= 20 && peso <= 300) data.pesoKg = Math.round(peso * 100) / 100;

    if (idade !== undefined && Number.isInteger(idade) && idade >= 10 && idade <= 80) {
      // O app pede so a idade. Mantem a data de nascimento se ela ja bate com a idade;
      // senao grava uma data aproximada (hoje menos N anos).
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { dataNascimento: true } });
      const hoje = new Date();
      const idadeAtual = user?.dataNascimento ? calcularIdade(user.dataNascimento, hoje) : null;
      if (idadeAtual !== idade) {
        data.dataNascimento = new Date(Date.UTC(hoje.getUTCFullYear() - idade, hoje.getUTCMonth(), hoje.getUTCDate()));
      }
    }

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: userId }, data });
    }
  }
}

function calcularIdade(nascimento: Date, hoje: Date): number {
  let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const m = hoje.getUTCMonth() - nascimento.getUTCMonth();
  if (m < 0 || (m === 0 && hoje.getUTCDate() < nascimento.getUTCDate())) idade--;
  return idade;
}
