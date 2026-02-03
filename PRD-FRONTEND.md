# PRD - FRONTEND: CicloLeve
**Interface Mobile-First para App de Controle Hormonal Feminino**

---

## 1. VISÃO GERAL

### 1.1 Objetivo do Frontend
Criar uma interface mobile-first intuitiva, performática e acessível que permite às usuárias monitorar seu ciclo menstrual, registrar sintomas diários e receber recomendações personalizadas de saúde hormonal em tempo real.

### 1.2 Stack Recomendada
- **Framework**: React 18+ com TypeScript
- **Mobile**: React Native + Expo (iOS/Android nativo)
- **Web**: Next.js 14+ (SSR/SSG para SEO)
- **State Management**: Zustand ou Jotai (leve e simples)
- **Styling**: Tailwind CSS + shadcn/ui (componentes)
- **Forms**: React Hook Form + Zod (validação)
- **Charts**: Recharts ou Chart.js
- **PWA**: Workbox (cache offline, service workers)
- **Analytics**: PostHog ou Mixpanel

### 1.3 Princípios de Design
1. **Mobile-First**: 90% do uso será em smartphones
2. **Acessibilidade**: WCAG 2.1 AA compliant
3. **Performance**: FCP < 1.5s, LCP < 2.5s
4. **Offline-First**: Cache local + sync quando online
5. **Design Empático**: Linguagem inclusiva e não-julgadora

---

## 2. ARQUITETURA DO FRONTEND

### 2.1 Estrutura de Pastas
```
cicloleve-app/
├── app/                          # Next.js App Router (web)
│   ├── (auth)/
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── recuperar-senha/
│   ├── (dashboard)/
│   │   ├── home/
│   │   ├── historico/
│   │   ├── conteudo/
│   │   └── perfil/
│   ├── onboarding/
│   └── api/                      # Route handlers
├── components/
│   ├── ui/                       # shadcn components
│   ├── features/
│   │   ├── registro/
│   │   ├── fase-card/
│   │   ├── grafico-sintomas/
│   │   └── dica-personalizada/
│   └── layouts/
├── lib/
│   ├── api-client.ts            # Fetch wrapper
│   ├── storage.ts               # Local/session storage
│   ├── ciclo-calculator.ts      # Lógica de fases
│   └── utils.ts
├── stores/
│   ├── user-store.ts            # Estado global usuária
│   ├── ciclo-store.ts           # Estado ciclo/fase
│   └── registro-store.ts        # Cache de registros
├── hooks/
│   ├── use-fase-atual.ts
│   ├── use-registro-diario.ts
│   └── use-offline-sync.ts
├── types/
│   └── index.d.ts               # TypeScript types
└── public/
    ├── icons/
    └── illustrations/
```

---

## 3. PÁGINAS E FLUXOS

### 3.1 SPLASH SCREEN (2 segundos)
**Componente**: `app/splash/page.tsx`

**Elementos visuais**:
```tsx
export default function SplashScreen() {
  return (
    <div className="flex-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="text-center animate-fade-in">
        {/* Logo animado */}
        <div className="mb-6">
          <FemaleIcon className="w-24 h-24 text-primary animate-float" />
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          CicloLeve
        </h1>
        <p className="text-gray-600">
          Seu corpo muda, sua estratégia também.
        </p>
        
        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mt-12 mx-auto overflow-hidden">
          <div className="h-full bg-primary animate-loading" />
        </div>
        
        <p className="text-xs text-gray-400 mt-16">VERSÃO 2.1.0</p>
      </div>
    </div>
  );
}
```

**Lógica**:
- Verificar token de autenticação
- Pré-carregar dados essenciais (perfil, registros recentes)
- Redirecionar para `/home` ou `/login`

---

### 3.2 AUTENTICAÇÃO

#### **3.2.1 Login** (`app/(auth)/login/page.tsx`)
```tsx
export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await api.post('/auth/login', data);
      localStorage.setItem('token', user.token);
      router.push('/home');
    } catch (error) {
      toast.error('Email ou senha inválidos');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
      <AppIcon />
      
      <h1 className="text-3xl font-bold">Entrar</h1>
      <p className="text-gray-600">Acesse sua conta</p>

      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        {...register('email', { required: 'Email obrigatório' })}
        error={errors.email?.message}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        {...register('senha', { required: 'Senha obrigatória' })}
        error={errors.senha?.message}
      />

      <Link href="/recuperar-senha" className="text-sm text-primary">
        Esqueci minha senha
      </Link>

      <Button type="submit" className="w-full">Entrar</Button>

      <p className="text-center text-sm">
        Não tem conta? <Link href="/cadastro" className="text-primary font-semibold">Cadastre-se</Link>
      </p>
    </form>
  );
}
```

**Validações client-side**:
- Email: formato válido + lowercase
- Senha: mínimo 8 caracteres
- Rate limiting visual (após 3 tentativas falhas)

#### **3.2.2 Cadastro** (`app/(auth)/cadastro/page.tsx`)
```tsx
const schema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmarSenha: z.string()
}).refine(data => data.senha === data.confirmarSenha, {
  message: 'Senhas não conferem',
  path: ['confirmarSenha']
});

export default function CadastroPage() {
  const form = useForm<CadastroForm>({ resolver: zodResolver(schema) });
  
  return (
    <form className="space-y-4 p-6">
      <Input label="Nome completo" {...form.register('nome')} />
      <Input label="E-mail" type="email" {...form.register('email')} />
      <Input label="Senha" type="password" {...form.register('senha')} />
      <Input label="Confirmar senha" type="password" {...form.register('confirmarSenha')} />
      
      <Checkbox {...form.register('aceitaTermos')}>
        Aceito os <Link href="/termos">Termos de Uso</Link> e <Link href="/privacidade">Política de Privacidade</Link>
      </Checkbox>
      
      <Button type="submit" disabled={!form.watch('aceitaTermos')}>
        Criar conta
      </Button>
    </form>
  );
}
```

---

### 3.3 ONBOARDING (4 etapas)

#### **Etapa 1: Personalização Básica**
```tsx
export default function OnboardingStep1() {
  return (
    <div className="space-y-6 p-6">
      <ProgressDots current={1} total={4} />
      
      <h1 className="text-2xl font-bold">Vamos personalizar sua experiência</h1>
      <p className="text-gray-600">Esses dados nos ajudam a prever seus sintomas.</p>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Altura *" type="number" suffix="cm" placeholder="165" />
        <Input label="Peso (opcional)" type="number" suffix="kg" placeholder="60" />
      </div>

      <Input label="Idade *" type="number" suffix="anos" placeholder="28" />

      <Toggle label="Seu ciclo é regular?" description="Você menstrua todo mês?" />

      <Input label="Data da última menstruação *" type="date" />

      <Slider
        label="Duração do ciclo"
        min={21}
        max={45}
        defaultValue={28}
        marks={['21 dias', '45 dias']}
      />

      <Slider
        label="Duração do sangramento"
        min={1}
        max={10}
        defaultValue={5}
        marks={['1 dia', '10 dias']}
      />

      <Button onClick={nextStep}>Salvar Perfil →</Button>
    </div>
  );
}
```

#### **Etapa 2: Momento Atual**
```tsx
const opcoes = [
  { id: 'CICLO_REGULAR', icon: '💧', titulo: 'Ciclo regular', desc: 'Variação menor que 7 dias' },
  { id: 'CICLO_IRREGULAR', icon: '〰️', titulo: 'Ciclo irregular', desc: 'Variação imprevisível' },
  { id: 'MENOPAUSA', icon: '🌿', titulo: 'Menopausa', desc: 'Ou perimenopausa' },
  { id: 'ANTICONCEPCIONAL', icon: '💊', titulo: 'Anticoncepcional', desc: 'Uso contínuo' }
];

export default function OnboardingStep2() {
  const [selecionado, setSelecionado] = useState<string>();

  return (
    <div className="space-y-6 p-6">
      <ProgressDots current={2} total={4} />
      
      <h1 className="text-2xl font-bold">Qual o seu momento atual?</h1>
      
      <div className="space-y-3">
        {opcoes.map(op => (
          <OptionCard
            key={op.id}
            selected={selecionado === op.id}
            onClick={() => setSelecionado(op.id)}
            icon={op.icon}
            title={op.titulo}
            description={op.desc}
          />
        ))}
      </div>

      <Button onClick={nextStep} disabled={!selecionado}>Continuar</Button>
    </div>
  );
}
```

#### **Etapa 3: Objetivos**
```tsx
const objetivos = [
  { id: 'EMAGRECER', icon: '⚖️', titulo: 'Emagrecer' },
  { id: 'REDUZIR_INCHACO', icon: '💧', titulo: 'Reduzir inchaço' },
  { id: 'CONTROLAR_FOME', icon: '🍴', titulo: 'Controlar fome/compulsão' },
  { id: 'MELHORAR_HUMOR', icon: '😊', titulo: 'Melhorar humor/TPM' },
  { id: 'DORMIR_MELHOR', icon: '🌙', titulo: 'Dormir melhor' }
];

export default function OnboardingStep3() {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 p-6">
      <ProgressDots current={3} total={4} />
      
      <h1 className="text-2xl font-bold">Quais são seus principais objetivos?</h1>
      <p className="text-gray-600">Selecione todos que se aplicam</p>
      
      <div className="space-y-3">
        {objetivos.map(obj => (
          <CheckboxCard
            key={obj.id}
            checked={selecionados.includes(obj.id)}
            onChange={() => toggle(obj.id)}
            icon={obj.icon}
            title={obj.titulo}
          />
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">Você poderá alterar depois</p>

      <Button onClick={nextStep}>Continuar →</Button>
    </div>
  );
}
```

#### **Etapa 4: Conclusão**
```tsx
export default function OnboardingStep4() {
  const router = useRouter();

  useEffect(() => {
    // Salvar dados no backend
    async function salvarPerfil() {
      await api.post('/perfil', onboardingData);
      setTimeout(() => router.push('/home'), 2000);
    }
    salvarPerfil();
  }, []);

  return (
    <div className="flex-center min-h-screen p-6 text-center">
      <div className="space-y-6">
        <div className="text-6xl animate-bounce">✨</div>
        <h1 className="text-3xl font-bold">Tudo pronto!</h1>
        <p className="text-gray-600">
          Seu perfil está configurado. Agora você receberá dicas personalizadas todo dia.
        </p>
        <Spinner />
      </div>
    </div>
  );
}
```

---

### 3.4 HOME (Dashboard Principal)

```tsx
export default function HomePage() {
  const { user } = useUserStore();
  const { faseAtual, diaCiclo, mensagens } = useFaseAtual();
  const registroHoje = useRegistroDiario();

  const saudacao = useMemo(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} fallback={user.nome[0]} />
          <div>
            <p className="text-sm text-gray-600">{saudacao}, {user.nome}</p>
            <p className="font-semibold">{faseAtual.nome} • DIA {diaCiclo}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <BellIcon />
        </Button>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Fase Card */}
        <FaseCard fase={faseAtual} />

        {/* Faça Hoje */}
        <section>
          <SectionHeader icon={<CheckIcon />} title="Faça hoje" />
          {mensagens.faca.map((dica, i) => (
            <TipCard key={i} {...dica} />
          ))}
        </section>

        {/* Evite Hoje */}
        <section>
          <SectionHeader icon={<XIcon />} title="Evite hoje" />
          {mensagens.evite.map((dica, i) => (
            <TipCard key={i} {...dica} variant="avoid" />
          ))}
        </section>

        {/* Nota da Especialista (condicional) */}
        {registroHoje.sintomasCriticos.length > 0 && (
          <NotaEspecialista sintomas={registroHoje.sintomasCriticos} />
        )}

        {/* CTA */}
        <Button className="w-full" size="lg" onClick={() => router.push('/registro')}>
          Registrar meu dia
        </Button>
      </main>

      {/* Floating Action Button */}
      <FAB icon={<PlusIcon />} onClick={() => router.push('/registro')} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
```

**Componente: FaseCard**
```tsx
function FaseCard({ fase }: { fase: Fase }) {
  const cores = {
    MENSTRUAL: 'from-red-50 to-pink-50',
    FOLICULAR: 'from-purple-50 to-violet-50',
    OVULATORIA: 'from-cyan-50 to-teal-50',
    LUTEA: 'from-pink-50 to-rose-50'
  };

  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${cores[fase.id]}`}>
      <div className="inline-block px-3 py-1 rounded-full bg-white/50 text-xs font-semibold mb-3">
        {fase.nome}
      </div>
      <h2 className="text-2xl font-bold mb-2">{fase.titulo}</h2>
      <p className="text-gray-700">{fase.descricao}</p>
    </div>
  );
}
```

---

### 3.5 REGISTRO DIÁRIO

```tsx
export default function RegistroDiarioPage() {
  const [registro, setRegistro] = useState<RegistroDiario>({
    inchaco: 0,
    fome: 0,
    humor: 0,
    sono: 0,
    peso: null
  });

  const sintomas = [
    { key: 'inchaco', icon: '💧', nome: 'Inchaço', labels: ['Sem inchaço', 'Leve', 'Moderado', 'Intenso'] },
    { key: 'fome', icon: '🍴', nome: 'Fome / Compulsão', labels: ['Sem fome', 'Leve', 'Moderado', 'Intenso'] },
    { key: 'humor', icon: '😊', nome: 'Humor / Irritação', labels: ['Ótimo', 'Leve', 'Moderado', 'Irritada'] },
    { key: 'sono', icon: '🌙', nome: 'Sono', labels: ['Ótimo', 'Bom', 'Regular', 'Péssimo'] }
  ];

  const salvar = async () => {
    await api.post('/registros', { ...registro, data: new Date() });
    toast.success('Registro salvo!');
    router.push('/home');
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      <Button variant="ghost" onClick={() => router.back()}>
        ← Voltar
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">Registro Diário</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Como você está se sentindo?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Avalie seus sintomas de 0 (ótimo) a 3 (péssimo)
        </p>

        {sintomas.map(s => (
          <div key={s.key} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{s.icon}</span>
              <h3 className="font-semibold flex-1">{s.nome}</h3>
              <span className="text-sm font-semibold text-primary">
                {registro[s.key]} - {s.labels[registro[s.key]]}
              </span>
            </div>

            <Slider
              min={0}
              max={3}
              step={1}
              value={registro[s.key]}
              onChange={val => setRegistro({ ...registro, [s.key]: val })}
              className="mb-2"
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
          </div>
        ))}

        <div className="mb-8">
          <label className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚖️</span>
            <span className="font-semibold">Peso do dia <span className="text-gray-500 font-normal">(Opcional)</span></span>
          </label>
          <Input
            type="number"
            step="0.1"
            placeholder="00.0"
            suffix="kg"
            value={registro.peso || ''}
            onChange={e => setRegistro({ ...registro, peso: parseFloat(e.target.value) })}
          />
        </div>

        <Button className="w-full" size="lg" onClick={salvar}>
          ✓ Salvar Registro
        </Button>
      </div>
    </div>
  );
}
```

---

### 3.6 HISTÓRICO / GRÁFICOS

```tsx
export default function HistoricoPage() {
  const [visualizacao, setVisualizacao] = useState<'grafico' | 'lista'>('grafico');
  const [filtro, setFiltro] = useState<'Tudo' | 'Menstruação' | 'Humor' | 'Físico'>('Tudo');
  const { registros, intensidadeMedia } = useHistorico();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Meu Histórico</h1>
        <Button variant="ghost" size="icon"><SettingsIcon /></Button>
      </header>

      <main className="p-6 space-y-6">
        {/* Toggle visualização */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <Button
            variant={visualizacao === 'grafico' ? 'default' : 'ghost'}
            onClick={() => setVisualizacao('grafico')}
            className="flex-1"
          >
            📊 Gráfico
          </Button>
          <Button
            variant={visualizacao === 'lista' ? 'default' : 'ghost'}
            onClick={() => setVisualizacao('lista')}
            className="flex-1"
          >
            📋 Lista
          </Button>
        </div>

        {visualizacao === 'grafico' && (
          <>
            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto">
              {['Tudo', 'Menstruação', 'Humor', 'Físico'].map(f => (
                <Button
                  key={f}
                  variant={filtro === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltro(f as any)}
                >
                  {f}
                </Button>
              ))}
            </div>

            {/* Card de intensidade */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500">INTENSIDADE</h3>
                <Button variant="ghost" size="icon"><MoreHorizontalIcon /></Button>
              </div>
              
              <h2 className="text-4xl font-bold mb-1">{intensidadeMedia}</h2>
              <p className="text-sm text-primary font-semibold mb-6">Últimos 7 dias</p>

              {/* Gráfico */}
              <GraficoIntensidade dados={registros.slice(0, 7)} />
            </div>
          </>
        )}

        {/* Lista de registros */}
        <div>
          <h3 className="text-lg font-bold mb-4">Registros Recentes</h3>
          {registros.map(reg => (
            <RegistroItem key={reg.id} registro={reg} />
          ))}
        </div>

        <Button variant="outline" className="w-full">
          Assinar Premium →
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
```

**Componente: GraficoIntensidade**
```tsx
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';

function GraficoIntensidade({ dados }: { dados: Registro[] }) {
  const chartData = dados.map((r, i) => ({
    dia: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'][i],
    intensidade: (r.inchaco + r.fome + r.humor) / 3
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <XAxis dataKey="dia" stroke="#999" fontSize={12} />
        <Line 
          type="monotone" 
          dataKey="intensidade" 
          stroke="#00ff66" 
          strokeWidth={3}
          dot={{ fill: '#00ff66', r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 3.7 CONTEÚDO EDUCACIONAL

```tsx
export default function ConteudoPage() {
  const [filtro, setFiltro] = useState('Todos');
  const { conteudos, destaqueHoje } = useConteudo();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Conteúdo Educacional</h1>
        <Button variant="ghost" size="icon"><FilterIcon /></Button>
      </header>

      <main className="space-y-6">
        {/* Filtros horizontais */}
        <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
          {['Todos', 'TPM', 'Menopausa', 'Ciclo'].map(f => (
            <Button
              key={f}
              variant={filtro === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltro(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Destaque de Hoje */}
        <section className="px-6">
          <h2 className="text-lg font-bold mb-4">Destaque de Hoje</h2>
          <ConteudoCardDestaque conteudo={destaqueHoje} />
        </section>

        {/* Biblioteca */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Biblioteca de Dicas</h2>
            <Button variant="ghost" size="sm">Ver tudo</Button>
          </div>

          {conteudos.map(c => (
            <ConteudoCardLista key={c.id} conteudo={c} />
          ))}
        </section>

        {/* CTA Premium */}
        <div className="mx-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Desbloqueie todo o conhecimento</h3>
          <p className="text-sm text-gray-600 mb-4">Acesse centenas de artigos especializados.</p>
          <Button>Assinar</Button>
        </div>

        {/* Conteúdo bloqueado (visual) */}
        <div className="px-6 relative">
          <div className="blur-sm opacity-50 pointer-events-none">
            {[1, 2].map(i => <ConteudoCardLista key={i} conteudo={{}} />)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="secondary">🔒 Desbloquear</Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
```

---

### 3.8 PERFIL

```tsx
export default function PerfilPage() {
  const { user, logout } = useUserStore();
  const { perfil } = usePerfil();

  return (
    <div className="min-h-screen pb-20">
      <header className="p-6 text-center">
        <Avatar src={user.avatar} size="xl" className="mx-auto mb-4" />
        <Button variant="ghost" size="icon" className="absolute top-6 right-6">
          <EditIcon />
        </Button>
        <h1 className="text-2xl font-bold">{user.nome}</h1>
        <p className="text-sm text-gray-500">Membro desde {new Date(user.createdAt).getFullYear()}</p>
      </header>

      <main className="px-6 space-y-6">
        {/* Meus Dados */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3">MEUS DADOS</h3>
          
          <MenuItem
            icon="🎯"
            title="Editar Objetivos"
            subtitle="TPM, Menopausa, Bem-estar"
            onClick={() => router.push('/perfil/objetivos')}
          />

          <MenuItem
            icon="📅"
            title="Dados do Ciclo"
            subtitle={`Duração: ${perfil.duracaoCiclo} dias`}
            onClick={() => router.push('/perfil/ciclo')}
          />
        </section>

        {/* Preferências */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3">PREFERÊNCIAS</h3>
          
          <MenuItem
            icon="🕐"
            title="Lembrete Diário"
            subtitle="09:00"
          />

          <MenuItem
            icon="🔔"
            title="Notificações Push"
            trailing={<Switch checked={true} />}
          />
        </section>

        {/* Premium */}
        <div className="bg-gradient-to-r from-primary/10 to-teal-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Gerenciar Assinatura</h3>
            <p className="text-sm text-gray-600">Plano Premium Ativo</p>
          </div>
          <Button variant="ghost" size="icon"><EditIcon /></Button>
        </div>

        {/* Outros */}
        <section>
          <MenuItem
            icon="📄"
            title="Termos e Política"
            onClick={() => router.push('/termos')}
          />

          <MenuItem
            icon="🚪"
            title="Sair da conta"
            onClick={logout}
          />

          <button className="w-full py-3 text-red-500 font-semibold">
            Excluir minha conta
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
```

---

## 4. COMPONENTES REUTILIZÁVEIS

### 4.1 Sistema de Design (Tailwind + shadcn/ui)

**tailwind.config.ts**
```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#00ff66',
        secondary: '#00d9d9',
        danger: '#ff4757',
        warning: '#ffa502'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif']
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'loading': 'loading 2s ease-in-out infinite'
      }
    }
  }
};
```

### 4.2 Componentes Core

**Button.tsx**
```tsx
export function Button({ children, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-primary text-black hover:bg-green-500',
    outline: 'border-2 border-gray-300 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'rounded-xl font-semibold transition-all active:scale-95',
        variants[variant],
        sizes[size]
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Slider.tsx**
```tsx
export function Slider({ min, max, value, onChange, ...props }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="slider w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00ff66 0%, #00ff66 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`
        }}
        {...props}
      />
    </div>
  );
}
```

---

## 5. ESTADO GLOBAL (Zustand)

```tsx
// stores/user-store.ts
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    set({ user: res.user, token: res.token });
    localStorage.setItem('token', res.token);
  },
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
    router.push('/login');
  },
  
  updateProfile: (updates) => {
    set(state => ({ user: { ...state.user, ...updates } }));
  }
}));

// stores/ciclo-store.ts
export const useCicloStore = create<CicloStore>((set) => ({
  perfil: null,
  faseAtual: null,
  diaCiclo: 1,
  
  calcularFase: () => {
    const { dataUltimaMenstruacao, duracaoCiclo } = get().perfil;
    const dias = calcularDiferenca(dataUltimaMenstruacao, new Date());
    const diaCiclo = (dias % duracaoCiclo) + 1;
    const fase = identificarFase(diaCiclo);
    set({ diaCiclo, faseAtual: fase });
  },
  
  atualizarPerfil: (perfil) => {
    set({ perfil });
    get().calcularFase();
  }
}));
```

---

## 6. OFFLINE-FIRST & PWA

### 6.1 Service Worker (Workbox)
```js
// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Cache de assets estáticos
precacheAndRoute(self.__WB_MANIFEST);

// API: Network first, fallback to cache
registerRoute(
  /\/api\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }) // 5 min
    ]
  })
);

// Imagens: Cache first
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100 })
    ]
  })
);

// Conteúdo: Stale while revalidate
registerRoute(
  /\/conteudo\/.*/,
  new StaleWhileRevalidate({
    cacheName: 'conteudo-cache'
  })
);
```

### 6.2 Sync de Dados Offline
```tsx
// hooks/use-offline-sync.ts
export function useOfflineSync() {
  const syncPendentes = useLocalStorage<Registro[]>('pendentes', []);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline && syncPendentes.length > 0) {
      sincronizar();
    }
  }, [isOnline]);

  const sincronizar = async () => {
    for (const registro of syncPendentes) {
      try {
        await api.post('/registros', registro);
        setSyncPendentes(prev => prev.filter(r => r.id !== registro.id));
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
      }
    }
  };

  const salvarOffline = (registro: Registro) => {
    setSyncPendentes(prev => [...prev, registro]);
    toast.info('Salvo localmente. Sincronizará quando online.');
  };

  return { salvarOffline, pendentes: syncPendentes.length };
}
```

---

## 7. PERFORMANCE

### 7.1 Code Splitting (Next.js)
```tsx
// Lazy load de componentes pesados
const GraficoAvancado = dynamic(() => import('@/components/GraficoAvancado'), {
  loading: () => <Skeleton />,
  ssr: false
});

const EditorRico = dynamic(() => import('@/components/EditorRico'), {
  ssr: false
});
```

### 7.2 Otimização de Imagens
```tsx
import Image from 'next/image';

<Image
  src="/ilustracao.png"
  alt="Fase do ciclo"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### 7.3 Virtualization (Lista longa)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function ListaRegistros({ registros }: { registros: Registro[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: registros.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.index} style={{ height: `${virtualRow.size}px` }}>
            <RegistroItem registro={registros[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. TESTES

### 8.1 Unit Tests (Vitest)
```tsx
// __tests__/ciclo-calculator.test.ts
describe('calcularDiaCiclo', () => {
  it('deve calcular corretamente o dia do ciclo', () => {
    const hoje = new Date('2025-01-21');
    const ultimaMenst = new Date('2025-01-01');
    const resultado = calcularDiaCiclo(ultimaMenst, hoje, 28);
    expect(resultado).toBe(21);
  });

  it('deve identificar fase lútea corretamente', () => {
    const fase = identificarFase(21);
    expect(fase).toBe('LUTEA');
  });
});
```

### 8.2 Integration Tests (Playwright)
```tsx
// e2e/registro-diario.spec.ts
test('usuária consegue criar registro diário', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'teste@exemplo.com');
  await page.fill('[name="senha"]', 'senha123');
  await page.click('button[type="submit"]');

  await page.waitForURL('/home');
  await page.click('text=Registrar meu dia');

  await page.click('[data-sintoma="inchaco"] [data-value="2"]');
  await page.click('[data-sintoma="humor"] [data-value="1"]');
  await page.click('button:has-text("Salvar Registro")');

  await expect(page.locator('text=Registro salvo')).toBeVisible();
});
```

---

## 9. ANALYTICS & MONITORAMENTO

```tsx
// lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture(event, properties);
    }
  },

  page: (name: string) => {
    posthog.capture('$pageview', { page: name });
  },

  identify: (userId: string, traits: Record<string, any>) => {
    posthog.identify(userId, traits);
  }
};

// Uso nos componentes
useEffect(() => {
  analytics.page('Home');
}, []);

const handleRegistro = () => {
  analytics.track('registro_criado', {
    fase: faseAtual,
    sintomas_criticos: registro.filter(s => s.nivel === 3).length
  });
};
```

---

## 10. ACESSIBILIDADE

### 10.1 ARIA Labels
```tsx
<button aria-label="Registrar sintomas do dia" onClick={openRegistro}>
  <PlusIcon aria-hidden="true" />
</button>

<Slider
  aria-label="Intensidade do inchaço"
  aria-valuemin={0}
  aria-valuemax={3}
  aria-valuenow={registro.inchaco}
  aria-valuetext={labels[registro.inchaco]}
/>
```

### 10.2 Keyboard Navigation
```tsx
// Atalhos de teclado
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      router.push('/registro');
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 11. CHECKLIST DE ENTREGA

**Infraestrutura:**
- [ ] Next.js 14+ configurado com App Router
- [ ] Tailwind CSS + shadcn/ui instalados
- [ ] Zustand para estado global
- [ ] React Hook Form + Zod
- [ ] PWA com service workers
- [ ] Sentry para error tracking

**Páginas:**
- [ ] Splash screen animada
- [ ] Login/Cadastro com validação
- [ ] Onboarding (4 etapas)
- [ ] Home com fase atual
- [ ] Registro diário com sliders
- [ ] Histórico com gráficos
- [ ] Conteúdo educacional
- [ ] Perfil com configurações

**Performance:**
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s, LCP < 2.5s
- [ ] Code splitting implementado
- [ ] Imagens otimizadas
- [ ] Offline-first funcionando

**Testes:**
- [ ] Unit tests (cobertura > 70%)
- [ ] E2E tests (fluxos críticos)
- [ ] Testes de acessibilidade

**Deploy:**
- [ ] Vercel configurado
- [ ] Variáveis de ambiente
- [ ] Analytics ativo
- [ ] Domínio customizado

**Pronto para desenvolvimento! 🚀**
