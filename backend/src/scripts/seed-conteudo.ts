// Carrega os artigos de src/constants/artigos.ts no banco. Atualiza pelo slug.
// Uso (no container): npx ts-node --transpile-only src/scripts/seed-conteudo.ts
import { prisma } from '../config/database';
import { ARTIGOS } from '../constants/artigos';

async function main() {
  for (const a of ARTIGOS) {
    const dados = {
      categoria: a.categoria,
      tipo: 'ARTIGO',
      titulo: a.titulo,
      descricao: a.descricao,
      conteudoMarkdown: a.texto,
      tempoLeituraMin: a.tempoLeituraMin,
      fasesAplicaveis: a.fases,
      premiumOnly: a.premium,
      tags: a.tags,
      autor: 'Equipe CicloLeve',
      publicado: true,
      deletedAt: null,
    };
    await prisma.conteudoEducacional.upsert({
      where: { slug: a.slug },
      update: dados,
      create: { slug: a.slug, ...dados },
    });
    console.log(`ok  ${a.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
