import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ciclo Leve API',
      version: '1.0.0',
      description: `
# 🌸 Guia do Desenvolvedor - Ciclo Leve

Bem-vindo à documentação oficial da API. Aqui você encontra tudo para integrar com nosso backend.

## 🔐 Autenticação e Segurança
Esta API utiliza **JWT (JSON Web Tokens)** para segurança.
1. Crie uma conta em \`POST /auth/register\`.
2. Faça login em \`POST /auth/login\` para receber seu \`accessToken\`.
3. Em todas as requisições protegidas (cadeado fechado 🔒), envie o cabeçalho:
   \`\`\`http
   Authorization: Bearer <seu_token_aqui>
   \`\`\`

## 📦 Padrões de Resposta
Todas as respostas seguem o padrão JSON.

### Sucesso (200/201)
Retorna o objeto solicitado ou uma mensagem de confirmação.
\`\`\`json
{
  "data": { ... }
}
\`\`\`

### Erro (4xx/5xx)
Sempre retorna um objeto com a chave \`error\` explicando o motivo.
\`\`\`json
{
  "error": "Descrição detalhada do problema para exibição no front."
}
\`\`\`

## 📅 Formatos
- **Datas:** ISO 8601 UTC (ex: \`2026-02-11T14:30:00.000Z\`).
- **Moeda:** Não aplicável (Free).
- **Idioma:** Português (pt-BR).

## 🔄 Lógica do Ciclo Menstrual
O app calcula a fase atual automaticamente baseado na DUM (Data da Última Menstruação) e na duração configurada.

### Intervalos de Fase (base 28 dias)
| Dia | Fase | Nome Amigável | Descrição Biológica |
|---|---|---|---|
| **1-5** | \`MENSTRUAL\` | Menstruação | Descamação do endométrio. Energia baixa. |
| **6-12** | \`FOLICULAR\` | Fase Folicular | Aumento de estrogênio. Energia e disposição aumentam. |
| **13-16** | \`OVULATORIA\` | Fase Ovulatória | Pico de fertilidade. Máxima libido e sociabilidade. |
| **17-28** | \`LUTEA\` | Fase Lútea | Aumento de progesterona. TPM, inchaço e introspecção. |

### 💡 Insights Diários (Daily Insight)
O endpoint \`GET /perfil\` retorna um objeto \`insight\` com base na fase atual:

- **MENSTRUAL** (🔋): "Recarregue as energias. Seu corpo está pedindo descanso..."
- **FOLICULAR** (⚡): "Energia em Alta. Seus níveis de estrogênio estão subindo..."
- **OVULATORIA** (✨): "Auge da Confiança. Sua comunicação e magnetismo estão no máximo..."
- **LUTEA** (🌙): "Hora de Desacelerar. A progesterona sobe, trazendo calma ou TPM..."

## 🚀 Fluxo Principal
1. **Onboarding:** Use \`PUT /perfil/ciclo\` para definir a DUM.
2. **Home:** Chame \`GET /perfil\` para receber o cálculo automático da fase e o "Daily Insight".
      `,
      contact: {
        name: 'Time de Desenvolvimento',
        email: 'dev@cicloleve.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Servidor Principal (v1)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nomeCompleto: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SPECIALIST'] },
          },
        },
        Recomendacoes: {
          type: 'object',
          properties: {
            mensagemFase: {
              type: 'object',
              description: 'Bloco com título, emoji, descrição e faça/evite hoje',
            },
            notaEspecialista: {
              type: 'string',
              description: 'Mensagem curta da especialista para o dia atual',
            },
            dicasExtras: {
              type: 'array',
              description: 'Dicas adicionais disparadas por sintomas intensos (ex: inchaço, fome, sono)',
              items: { type: 'string' },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
