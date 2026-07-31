# Finance App — Gerenciamento Financeiro Pessoal

## Etapa 1 — Configuração do projeto e arquitetura ✅

### Decisões de arquitetura

**1. Next.js 15 App Router + Server Components por padrão**
Toda a árvore de páginas usa Server Components como padrão, isolando `"use client"`
apenas nos componentes que precisam de estado, eventos ou hooks (formulários, gráficos
interativos, dropdowns). Isso reduz o JS enviado ao navegador e permite buscar dados
diretamente no servidor sem camadas extras de API para a maior parte dos casos.

**2. Server Actions como camada primária de mutação**
CRUDs (transações, categorias, contas, cartões, metas, investimentos) usam Server
Actions tipadas com Zod, evitando a necessidade de rotas REST redundantes. API Routes
(`src/app/api/**`) ficam reservadas para: webhooks, endpoints usados por integrações
externas (importação OFX/CSV, OCR) e o endpoint de IA em linguagem natural — casos que
precisam de streaming, upload multipart, ou serem chamados fora do Next.

**3. Camada de Services + Repository Pattern**
```
src/services/   → regras de negócio (ex: calcular fatura, calcular progresso de meta)
src/lib/repositories/ → acesso ao Prisma isolado por entidade
```
Isso mantém as Server Actions finas (validação + chamada de service) e testáveis, e
troca de fonte de dados (ex: cache, outro ORM) sem tocar na regra de negócio.

**4. TanStack Query no cliente**
Mesmo com Server Components, listas que precisam de refetch, filtros em tempo real,
paginação e infinite scroll (transações, extrato do cartão) usam TanStack Query,
alimentado por Server Actions ou route handlers. Isso dá cache, invalidação e estados
de loading/error consistentes sem reinventar isso manualmente.

**5. Design system com shadcn/ui + tokens CSS**
Paleta (Emerald/Blue/Zinc/White) definida como variáveis HSL em `globals.css`,
consumidas pelo Tailwind via `tailwind.config.ts`. Isso permite dark/light mode
trocando apenas a classe `.dark` na raiz, sem duplicar componentes.

**6. Autenticação com Auth.js (NextAuth v5) + Prisma Adapter**
Sessões JWT (stateless, melhor para middleware de proteção de rotas), com bcrypt para
senhas locais e suporte a provider OAuth opcional. Detalhes completos na Etapa 2.

**7. Validação em camadas**
Zod é a única fonte de verdade de validação: mesmo schema valida formulário
(React Hook Form) no cliente e o payload da Server Action no servidor — elimina
duplicação de regras e garante que nada passe sem validação mesmo se o cliente for
manipulado.

### Estrutura de pastas

```
finance-app/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/              # login, registro — layout sem sidebar
│   │   ├── (dashboard)/         # área autenticada — layout com sidebar/topbar
│   │   │   ├── dashboard/
│   │   │   ├── transacoes/
│   │   │   ├── categorias/
│   │   │   ├── contas/
│   │   │   ├── cartoes/
│   │   │   ├── metas/
│   │   │   ├── investimentos/
│   │   │   ├── orcamentos/
│   │   │   ├── relatorios/
│   │   │   ├── calendario/
│   │   │   └── configuracoes/
│   │   ├── api/                 # webhooks, importação, OCR, IA, auth
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # primitivos shadcn (button, card, dialog...)
│   │   ├── dashboard/           # cards, gráficos, widgets
│   │   ├── transactions/
│   │   ├── shared/               # empty-state, skeleton, confirm-dialog...
│   │   └── layout/               # sidebar, topbar, command palette
│   ├── hooks/                    # useTransactions, useAccounts, useDebounce...
│   ├── services/                 # regras de negócio
│   ├── lib/
│   │   ├── repositories/         # acesso a dados via Prisma
│   │   ├── validations/          # schemas Zod compartilhados
│   │   ├── auth.ts               # config do Auth.js
│   │   ├── prisma.ts             # singleton do PrismaClient
│   │   └── utils.ts
│   └── types/
├── .env.example
├── components.json                # config shadcn/ui
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### Stack confirmada
Next.js 15 · React 19 · TypeScript 5.7 · TailwindCSS 3.4 · shadcn/ui · React Hook Form
· Zod · TanStack Query/Table/Virtual · Recharts · Framer Motion · Lucide · Prisma 6 ·
PostgreSQL · Auth.js v5 · bcrypt · @dnd-kit (widgets rearrastáveis).

### Como rodar (no seu ambiente local, fora deste sandbox)
```bash
npm install
cp .env.example .env        # preencha DATABASE_URL e AUTH_SECRET
npm run prisma:migrate      # após a Etapa 2, quando o schema existir
npm run dev
```

---

## Etapa 2 — Autenticação e banco de dados ✅

### Decisões de arquitetura

**1. Schema Prisma completo (`prisma/schema.prisma`)**
Todos os modelos do domínio: `User`, `Household` (conta compartilhada da família),
`Account`, `Card`, `Category`, `Transaction`, `Attachment` (comprovantes + texto OCR),
`Installment`, `RecurringSubscription`, `Goal`, `Budget`, `Investment`, `ImportBatch`
(importação OFX/CSV/XLSX), `Notification` e `AuditLog`. Decisões importantes:
- `Decimal(14,2)` para todo valor monetário — nunca `Float`, para evitar erro de
  arredondamento em somas financeiras.
- `onDelete: Cascade` em relações "pertence a" (ex: transação → usuário); `SetNull`
  em relações opcionais (ex: transação → categoria), para que apagar uma categoria
  não apague o histórico de transações.
- Índices em toda coluna usada em filtro/busca (`userId, date`, `userId, type`,
  `categoryId`, etc.) — essenciais para os filtros e relatórios da Etapa 5+.
- Enums para todos os campos de domínio fechado (`AccountType`, `CardBrand`,
  `InvestmentType`, `Role` etc.), evitando strings soltas.
- `Role` (`ADMIN` | `USER` | `GUEST`) já modelado para o sistema de permissões.

**2. Auth.js v5 (`src/lib/auth.ts`)**
Credentials provider com bcrypt (`src/lib/password.ts`, 12 salt rounds) + Prisma
Adapter. Sessão em JWT (não em banco) para permitir validação no middleware (Edge
Runtime não tem acesso direto ao Prisma). `role` é propagado do banco para o token e
depois para a sessão nos callbacks `jwt`/`session`.

**3. Middleware de proteção de rotas (`src/middleware.ts`)**
Três camadas de controle: (a) redireciona não autenticado para `/login` preservando
`callbackUrl`; (b) bloqueia rotas administrativas para quem não é `ADMIN`; (c) bloqueia
rotas de escrita (`/novo`, `/editar`) para `GUEST`, que tem acesso somente leitura.

**4. Segurança nas Server Actions**
- **Rate limit** (`src/lib/rate-limit.ts`): Upstash Redis em produção, memória em dev,
  aplicado em registro/login para mitigar brute-force.
- **Sanitização XSS** (`src/lib/sanitize.ts`): `DOMPurify` remove qualquer HTML de
  campos de texto livre antes de persistir (título, descrição, observações).
- **CSRF**: Server Actions do Next.js já validam automaticamente o header `Origin`
  contra o host da aplicação — não é necessário token CSRF manual, mas isso só
  funciona se `NEXTAUTH_URL`/domínio estiverem corretos em produção.
- **Zod em toda entrada**: `registerSchema`/`loginSchema` (`src/lib/validations/auth.ts`)
  validam no cliente (React Hook Form, Etapa 3) e são revalidados na Server Action.
- **Auditoria desde o início**: toda criação de usuário já grava um `AuditLog`.

**5. Seed (`prisma/seed.ts`)**
Cria usuário demo (`demo@financeapp.com` / `Demo@12345`), as 14 categorias padrão
(com cor e ícone Lucide definidos) e uma conta corrente inicial.

### Arquivos criados nesta etapa
```
prisma/schema.prisma
prisma/seed.ts
src/lib/prisma.ts
src/lib/auth.ts
src/lib/password.ts
src/lib/rate-limit.ts
src/lib/sanitize.ts
src/lib/validations/auth.ts
src/types/next-auth.d.ts
src/middleware.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/(auth)/actions.ts
```

### Rodando esta etapa localmente
```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, DIRECT_URL e gere AUTH_SECRET
npm run prisma:migrate -- --name init
npm run prisma:seed
```

---

## Etapa 3 — Layout global e sistema de design ✅

### Decisões de arquitetura

**1. Providers centralizados (`src/components/providers/providers.tsx`)**
Um único componente client (`Providers`) agrega `ThemeProvider` (next-themes,
`attribute="class"`, tema `system` por padrão), `QueryProvider` (TanStack Query com
`QueryClient` criado por sessão via `useState` — evita cache vazando entre usuários em
SSR) e `TooltipProvider`. Isso mantém o `RootLayout` como Server Component, só a árvore
de providers é client.

**2. Primitivos shadcn/ui (`src/components/ui/*`)**
Button, Card, Input, Label, Dialog, DropdownMenu, Tabs, Tooltip, Select, Avatar,
Switch, Separator, ScrollArea, Popover, Checkbox, Progress, Skeleton e o wrapper do
Sonner (toast) — todos usando os tokens de cor definidos na Etapa 1 (nunca cor
hardcoded), com animações via `tailwindcss-animate`.

**3. Layout autenticado (`(dashboard)/layout.tsx`)**
Server Component que valida a sessão (`redirect` para `/login` se não autenticado) e
já busca a contagem de notificações não lidas via Prisma antes de renderizar —
evitando um segundo round-trip client-side só para o sininho da Topbar.
- **Sidebar** (`components/layout/sidebar.tsx`): colapsável, com tooltip nos ícones
  quando recolhida, navegação vinda de `src/lib/nav-config.ts` (fonte única de verdade
  também usada pela Command Palette).
- **Topbar** (`components/layout/topbar.tsx`): toggle de tema, notificações e menu do
  usuário (perfil, configurações, sair via `signOut`).
- **Command Palette** (`components/layout/command-palette.tsx`): atalho `⌘K`/`Ctrl+K`,
  construída com `cmdk`; hoje navega entre páginas e ações rápidas — na Etapa 4/5 passa
  a consultar transações/categorias/contas/cartões reais via TanStack Query com debounce.

**4. Autenticação client-side**
`LoginForm` e `RegisterForm` usam React Hook Form + `zodResolver` com os mesmos schemas
Zod da Etapa 2. O registro chama a Server Action `registerUser` e, em caso de sucesso,
loga automaticamente via `signIn("credentials")` do `next-auth/react` — sem pedir a
senha duas vezes.

**5. Componentes compartilhados (`src/components/shared/*`)**
`EmptyState`, `ConfirmDialog` (usado antes de qualquer exclusão em todo o sistema) e
`PageHeader` — para não recriar esses padrões em cada página das próximas etapas.

### Arquivos criados nesta etapa
```
src/components/ui/ (button, card, input, label, dialog, dropdown-menu, tabs,
  tooltip, select, avatar, switch, separator, scroll-area, popover, checkbox,
  progress, skeleton, sonner)
src/components/providers/ (theme-provider, query-provider, providers)
src/components/layout/ (sidebar, topbar, command-palette)
src/components/shared/ (empty-state, confirm-dialog, page-header)
src/components/auth/ (login-form, register-form)
src/lib/nav-config.ts
src/app/layout.tsx
src/app/page.tsx
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/registro/page.tsx
src/app/(auth)/esqueci-senha/page.tsx (stub)
src/app/(dashboard)/layout.tsx
src/app/(dashboard)/dashboard/page.tsx (placeholder)
```

---

## Etapa 4 — Dashboard principal ✅

### Decisões de arquitetura

**1. Repository Pattern para agregações (`src/lib/repositories/`)**
`transaction-repository.ts` e `account-repository.ts` isolam toda consulta Prisma
usada no dashboard: totais por período, comparativo mês atual vs. anterior, últimos
12 meses, breakdown por categoria, evolução patrimonial acumulada, heatmap diário de
gastos, fatura aberta por cartão (calculada a partir do dia de fechamento), progresso
de metas. Cada função aceita `userId` e datas — nada de lógica de negócio aqui, só
acesso a dado.

**2. Service compõe os repositories (`src/services/dashboard-service.ts`)**
`getDashboardSummary(userId)` chama todos os repositories em paralelo (`Promise.all`)
e monta um único objeto `DashboardSummary` já com a variação percentual mês a mês
calculada (`percentChange`, protegida contra divisão por zero). A página não sabe
nada sobre Prisma — só consome o shape pronto.

**3. Insights automáticos por regras (`src/services/insights-service.ts`)**
Compara categorias do mês atual com o mês anterior para achar a maior alta percentual,
identifica o maior gasto do mês e reage à variação de economia — gerando as mensagens
do "Dashboard Inteligente" (ex.: *"Você gastou X% mais com Alimentação"*). Isso é
regra determinística; a versão com IA generativa (linguagem natural livre) fica para
a Etapa 9, reaproveitando os mesmos dados.

**4. Server Component + Suspense + Skeleton**
`DashboardContent` é um Server Component `async` que busca os dados diretamente
(sem API Route intermediária) e é envolvido em `<Suspense>` na página, com
`DashboardSkeleton` como fallback — a Sidebar/Topbar aparecem instantaneamente
enquanto só a área de dados aguarda o streaming do RSC.

**5. Componentes de card (`src/components/dashboard/`)**
- `StatCard`: genérico, usado nos 5 cards "simples" (saldo, receitas, despesas,
  economia, investido) — anima entrada com Framer Motion, mostra tooltip opcional,
  e o indicador de crescimento fica verde/vermelho conforme `isPositiveGood` (uma
  despesa subindo é vermelho; uma receita subindo é verde).
- `special-cards.tsx`: os 3 cards com formato próprio — Contas a vencer, Fatura do
  cartão, Meta mensal (com `Progress`).
- `insights-card.tsx`: renderiza a lista de insights com ícone e cor por `tone`.

**6. Gráficos com Recharts (`src/components/dashboard/charts/`)**
Todos client components dentro de `ResponsiveContainer`, usando as variáveis de cor
`--chart-1..5` definidas na Etapa 1 (nunca hex fixo), com tooltip estilizado e
formatação de moeda via `formatCurrency`:
- `IncomeExpenseChart` — barras, Receitas x Despesas dos últimos 12 meses (cobre
  também o "comparativo dos últimos 12 meses" pedido no briefing).
- `CashFlowChart` — área com gradiente, fluxo de caixa líquido mês a mês.
- `CategoryPieChart` — pizza de gastos por categoria do mês, com cor de cada
  categoria vinda do banco.
- `NetWorthChart` — linha, evolução patrimonial acumulada.
- `FinancialHeatmap` — grade estilo GitHub com intensidade de gasto por dia do mês
  atual, tooltip por dia.

### Arquivos criados nesta etapa
```
src/lib/repositories/transaction-repository.ts
src/lib/repositories/account-repository.ts
src/services/dashboard-service.ts
src/services/insights-service.ts
src/components/dashboard/stat-card.tsx
src/components/dashboard/special-cards.tsx
src/components/dashboard/insights-card.tsx
src/components/dashboard/dashboard-content.tsx
src/components/dashboard/dashboard-skeleton.tsx
src/components/dashboard/charts/chart-card.tsx
src/components/dashboard/charts/income-expense-chart.tsx
src/components/dashboard/charts/cash-flow-chart.tsx
src/components/dashboard/charts/category-pie-chart.tsx
src/components/dashboard/charts/net-worth-chart.tsx
src/components/dashboard/charts/financial-heatmap.tsx
src/app/(dashboard)/dashboard/page.tsx (substituído pelo dashboard real)
```

### Nota importante
Com o banco vazio (antes do primeiro uso real), os cards mostram zero e os gráficos
mostram os estados vazios — isso é esperado. Rode `npm run prisma:seed` e cadastre
algumas transações (Etapa 5) para ver os dados reais.

---

## Etapa 5 — Gestão de Transações ✅

### Decisões de arquitetura

**1. Repository de CRUD separado do repository de agregação**
`transaction-crud-repository.ts` (list/find/create/update/delete + opções de
formulário) fica separado de `transaction-repository.ts` (agregações do dashboard) —
respeita responsabilidade única mesmo operando na mesma tabela. `buildWhere()`
centraliza a montagem do filtro Prisma (busca full-text case-insensitive em
título/descrição/observações, período, categoria, conta, cartão, tipo, faixa de
valor, recorrentes, parceladas).

**2. Service com regra de parcelamento (`transaction-service.ts`)**
Ao marcar "compra parcelada", o valor informado é tratado como o valor de CADA
parcela (ex.: Notebook 12x R$450 → `amount = 450`). O service cria, numa única
`$transaction` do Prisma: o registro `Installment` (valor total, quantidade,
primeira data) e N transações (`EXPENSE`) mensais vinculadas a ele via
`installmentId`, cada uma já numerada no título ("Notebook (1/12)"). Toda
criação/edição/exclusão grava `AuditLog` com snapshot antes/depois.

**3. Server Actions como ponte para o TanStack Query**
`src/app/(dashboard)/transacoes/actions.ts` expõe `fetchTransactions`,
`fetchTransactionFormOptions`, `createTransaction`, `updateTransaction`,
`deleteTransaction` — todas validam a sessão (`requireUserId`, que já bloqueia
`GUEST` de escrever) e o payload com Zod antes de tocar no service. Os hooks em
`src/hooks/use-transactions.ts` chamam essas Server Actions diretamente como
`queryFn`/`mutationFn` do TanStack Query — sem precisar de API Route/fetch manual.

**4. Busca em tempo real com debounce**
`useDebounce` (300–350ms) evita disparar uma query a cada tecla digitada; o filtro
de busca já entra na `queryKey` do TanStack Query, então resultados diferentes têm
cache próprio (voltar um filtro já usado não recarrega).

**5. Tabela com virtualização (`transactions-table.tsx`)**
Construída com `@tanstack/react-table` (definição de colunas, sem gerenciamento de
estado de dados) + `@tanstack/react-virtual` (renderiza só as linhas visíveis).
Optei por **grid CSS compartilhado** entre cabeçalho e corpo (em vez de `<table>`
nativo) porque virtualização com `position: absolute` por linha quebra o layout de
tabela HTML — o mesmo `gridTemplateColumns` nos dois blocos garante alinhamento
perfeito das colunas mesmo rolando milhares de linhas.
Paginação server-side (`page`/`pageSize`) complementa a virtualização — cada página
já vem enxuta do banco, e dentro da página a lista ainda é virtualizada.

**6. Formulário único para criar e editar (`transaction-form-dialog.tsx`)**
React Hook Form + o mesmo `transactionSchema` da Server Action. Campo de data usa
`Controller` (não `register`) para converter corretamente `Date ⇄ "yyyy-MM-dd"` ao
abrir para edição. Ao marcar "compra parcelada", exibe o campo de nº de parcelas e
exige cartão; a opção de parcelar some ao editar (parcelas já existem como
transações individuais — editar uma parcela edita só aquela ocorrência).

**7. Anexos de comprovante — adiado**
O formulário já reserva o espaço visual para anexar comprovante, mas o upload real
(Vercel Blob) e a extração via OCR ficam para a Etapa 9, junto das demais
funcionalidades avançadas — evita implementar upload de arquivo duas vezes.

### Arquivos criados nesta etapa
```
src/lib/validations/transaction.ts
src/lib/repositories/transaction-crud-repository.ts
src/services/transaction-service.ts
src/app/(dashboard)/transacoes/actions.ts
src/app/(dashboard)/transacoes/page.tsx
src/hooks/use-debounce.ts
src/hooks/use-transactions.ts
src/components/transactions/transaction-filters.tsx
src/components/transactions/transaction-form.tsx
src/components/transactions/transaction-form-dialog.tsx
src/components/transactions/transactions-table.tsx
```

### Nota
Parcelamentos e assinaturas recorrentes hoje são apenas *flags* (`isInstallment`,
`isRecurring`) na transação. A geração automática de N parcelas futuras a partir de
uma compra parcelada (modelo `Installment`) e de cobranças recorrentes (modelo
`RecurringSubscription`) será construída na Etapa 7, quando os cartões (Etapa 6) já
existirem na UI para o usuário escolher.

---

## Etapa 6 — Categorias, Contas e Cartões ✅

### Decisões de arquitetura

**1. Mesmo padrão Repository → Service → Action das etapas anteriores**
Cada entidade segue a estrutura já validada em Transações:
`lib/repositories/*-repository.ts` (só Prisma) → `services/*-service.ts` (sanitização
+ `AuditLog`) → `app/(dashboard)/<rota>/actions.ts` (Zod + `requireWriteAccess()`
bloqueando `GUEST`) → `hooks/use-*.ts` (TanStack Query). Isso significa que qualquer
desenvolvedor que já entendeu o módulo de Transações reconhece imediatamente onde
mexer em Categorias, Contas ou Cartões.

**2. Seletor de cor + ícone compartilhado (`ColorIconPicker`)**
Categorias, Contas e Cartões usam a mesma paleta curada de 12 cores
(`COLOR_PALETTE`) e o mesmo mapa de ícones Lucide (`ICON_MAP`, em
`src/lib/icon-map.ts`) — um único componente (`components/shared/color-icon-picker.tsx`)
é reaproveitado nos três formulários, evitando três implementações divergentes de
"escolha uma cor".

**3. Exclusão inteligente (arquivar em vez de excluir)**
Categorias podem ser excluídas livremente (a relação com `Transaction` é
`SetNull` — o histórico não quebra). Já Contas e Cartões, se tiverem qualquer
transação (ou parcelamento, no caso do cartão) vinculada, são **arquivados** em vez
de excluídos (`deleteOrArchiveAccount` / `deleteOrArchiveCard`) — preserva os
relatórios e o saldo histórico corretos, e o usuário recebe um toast explicando o
que aconteceu.

**4. Contas: saldo atual calculado, não armazenado**
`getAccountBalance` soma `initialBalance` + receitas − despesas daquela conta
especificamente — o mesmo princípio já usado no card "Saldo atual" do dashboard,
agora por conta individual.

**5. Cartões: visual estilizado + fatura/parcelas/histórico**
- `CreditCardVisual`: cartão com gradiente na cor escolhida, bandeira, limite
  disponível e barra de uso — clicável para abrir o detalhe.
- `getCardDetail` (repository): calcula o período da fatura aberta a partir do dia
  de fechamento, lista as transações dessa fatura, os parcelamentos em aberto
  (parcelas pagas/restantes) e agrega os últimos 6 meses de transações fechadas em
  um histórico mensal.
- `CardDetailDialog`: três abas (Fatura, Parcelas, Histórico) consumindo esse
  detalhe via `useCardDetailQuery`.

**6. Os selects do formulário de transações passam a ter dados reais**
Como `getTransactionFormOptionsAction` (Etapa 5) já buscava categorias/contas/
cartões do usuário, criar/editar/excluir aqui atualiza automaticamente o que
aparece no formulário de transações — via invalidação cruzada de cache
(`queryClient.invalidateQueries(["transaction-form-options"])` em toda mutação).

### Arquivos criados nesta etapa
```
src/lib/icon-map.ts
src/components/shared/color-icon-picker.tsx

src/lib/validations/category.ts
src/lib/repositories/category-repository.ts
src/services/category-service.ts
src/app/(dashboard)/categorias/actions.ts
src/app/(dashboard)/categorias/page.tsx
src/hooks/use-categories.ts
src/components/categories/category-form.tsx
src/components/categories/category-form-dialog.tsx

src/lib/validations/account.ts
src/lib/repositories/account-crud-repository.ts
src/services/account-service.ts
src/app/(dashboard)/contas/actions.ts
src/app/(dashboard)/contas/page.tsx
src/hooks/use-accounts.ts
src/components/accounts/account-form.tsx
src/components/accounts/account-form-dialog.tsx

src/lib/validations/card.ts
src/lib/repositories/card-repository.ts
src/services/card-service.ts
src/app/(dashboard)/cartoes/actions.ts
src/app/(dashboard)/cartoes/page.tsx
src/hooks/use-cards.ts
src/components/cards/card-form.tsx
src/components/cards/card-form-dialog.tsx
src/components/cards/credit-card-visual.tsx
src/components/cards/card-detail-dialog.tsx
```

---

## Etapa 7 — Metas, Investimentos, Orçamentos e Automação de Parcelas/Assinaturas ✅

### Decisões de arquitetura

**1. Mesmo padrão das etapas anteriores, sem exceções**
Metas, Investimentos e Orçamentos seguem exatamente a estrutura Repository →
Service → Action → Hook já validada em Transações/Categorias/Contas/Cartões.
Isso mantém o projeto previsível: qualquer novo módulo se encaixa no mesmo
esqueleto.

**2. Metas: previsão calculada, não armazenada**
Como o schema não guarda histórico de aportes (só o valor atual), a previsão de
conclusão (`estimateCompletion` em `goal-repository.ts`) é uma aproximação:
ritmo médio = valor atual ÷ meses desde a criação da meta, projetado para o
valor que falta. É uma heurística simples e deixo isso documentado no código —
uma versão futura poderia registrar aportes individuais para uma previsão mais
precisa.

**3. Investimentos: patrimônio e distribuição calculados em memória**
`getInvestmentDashboard` soma `investedAmount`/`currentAmount` de todos os
investimentos do usuário e agrupa por tipo para o gráfico de pizza — sem
necessidade de tabelas agregadas, já que o volume de investimentos por usuário
é tipicamente pequeno (dezenas, não milhares).

**4. Orçamentos: gasto recalculado a cada leitura**
`findBudgets` calcula o período (mensal/trimestral/anual) e soma as despesas da
categoria nesse período a cada chamada — sempre reflete a realidade, sem risco
de um contador ficar dessincronizado. A constraint única
`[userId, categoryId, period]` do schema previne orçamentos duplicados; a
violação é convertida em mensagem amigável no service.

**5. Parcelamentos e assinaturas: geração atômica via `$transaction`**
- `createInstallmentPurchase`: cria o `Installment` e as N transações mensais
  (uma por parcela, já linkadas via `installmentId`) dentro de uma única
  transação de banco — ou tudo é criado, ou nada é.
- `createRecurringSubscription`: cria a `RecurringSubscription` e já lança a
  primeira cobrança como `Transaction` (`isRecurring: true`). Cobranças
  seguintes (2ª em diante) exigiriam um job agendado lendo `nextChargeDate` —
  fora do escopo desta etapa, que cobre a modelagem e o primeiro lançamento.
- Ambos ficam acessíveis por um menu unificado em "Nova transação" na página de
  Transações (Transação simples / Compra parcelada / Assinatura recorrente),
  em vez de sobrecarregar o formulário único com campos condicionais.

### Arquivos criados nesta etapa
```
src/lib/validations/goal.ts
src/lib/repositories/goal-repository.ts
src/services/goal-service.ts
src/app/(dashboard)/metas/actions.ts
src/app/(dashboard)/metas/page.tsx
src/hooks/use-goals.ts
src/components/goals/goal-form.tsx
src/components/goals/goal-form-dialog.tsx
src/components/goals/goal-card.tsx

src/lib/validations/investment.ts
src/lib/repositories/investment-repository.ts
src/services/investment-service.ts
src/app/(dashboard)/investimentos/actions.ts
src/app/(dashboard)/investimentos/page.tsx
src/hooks/use-investments.ts
src/components/investments/investment-form.tsx
src/components/investments/investment-form-dialog.tsx
src/components/investments/investment-distribution-chart.tsx

src/lib/validations/budget.ts
src/lib/repositories/budget-repository.ts
src/services/budget-service.ts
src/app/(dashboard)/orcamentos/actions.ts
src/app/(dashboard)/orcamentos/page.tsx
src/hooks/use-budgets.ts
src/components/budgets/budget-form.tsx
src/components/budgets/budget-form-dialog.tsx
src/components/budgets/budget-progress-card.tsx

src/lib/validations/installment-purchase.ts
src/lib/validations/recurring-subscription.ts
src/lib/repositories/installment-purchase-repository.ts
src/lib/repositories/recurring-repository.ts
src/services/recurrence-service.ts
src/components/transactions/installment-purchase-dialog.tsx
src/components/transactions/recurring-subscription-dialog.tsx
(+ novas actions/hooks anexados aos arquivos de transações já existentes)
```

---

## Etapa 8 — Relatórios e Calendário Financeiro ✅

### Decisões de arquitetura

**1. Relatórios: período resolvido no servidor, exportação no navegador**
`report-service.ts` resolve o período (mês/trimestre/semestre/ano/personalizado)
em um intervalo `[start, end]` concreto — semestre é calculado manualmente já
que `date-fns` não tem um helper nativo para isso — e agrega totais, breakdown
por categoria e a lista de transações, sempre comparando com o período anterior
de mesma duração (`percentChange` reaproveitado do padrão da Etapa 4).
A exportação (`src/lib/export/report-export.ts`) roda inteiramente no
navegador a partir dos dados já carregados — `papaparse` para CSV, `xlsx`
(SheetJS) para Excel com duas planilhas (Transações + Resumo), e `jspdf` +
`jspdf-autotable` para PDF. Nenhuma chamada de rede extra é feita ao exportar.

**2. Calendário: um único service agrega 4 fontes diferentes por dia**
`calendar-service.ts` monta um array com todos os dias do mês e distribui, dia
a dia: transações (receita/despesa), vencimento de fatura de cada cartão
(reaproveitando `getOpenCardInvoiceTotal` da Etapa 4), próximas cobranças de
assinaturas recorrentes e datas de compra de investimentos. A grade
(`CalendarGrid`) mostra só indicadores visuais (pontinhos coloridos + saldo do
dia); o detalhe completo aparece ao clicar no dia (`CalendarDayDialog`).

**3. Sem novos modelos de dados**
Diferente das etapas anteriores, esta não precisou de nenhuma tabela nova —
Relatórios e Calendário são 100% camadas de leitura/agregação sobre os dados já
modelados desde a Etapa 2.

### Arquivos criados nesta etapa
```
src/lib/validations/report.ts
src/services/report-service.ts
src/lib/export/report-export.ts
src/app/(dashboard)/relatorios/actions.ts
src/app/(dashboard)/relatorios/page.tsx
src/hooks/use-reports.ts
src/components/reports/report-period-selector.tsx
src/components/reports/report-summary.tsx
src/components/reports/report-category-table.tsx
src/components/reports/report-export-menu.tsx

src/services/calendar-service.ts
src/app/(dashboard)/calendario/actions.ts
src/app/(dashboard)/calendario/page.tsx
src/hooks/use-calendar.ts
src/components/calendar/calendar-grid.tsx
src/components/calendar/calendar-day-dialog.tsx
```

---

## Etapa 9 — Funcionalidades Avançadas ✅

### Decisões de arquitetura

**1. IA com Anthropic API — três recursos, mesmo princípio de segurança**
`src/lib/ai/anthropic-client.ts` centraliza o client (falha com erro claro se
`ANTHROPIC_API_KEY` não estiver configurada; modelo configurável via
`ANTHROPIC_MODEL` porque nomes de modelo mudam com o tempo). Os três recursos
de IA seguem a mesma regra: **o modelo nunca inventa números financeiros**.
- **Categorização automática** (`ai-categorization-service.ts`): recebe título
  + descrição, escolhe apenas entre as categorias que o próprio usuário já
  cadastrou (nunca cria uma nova) e retorna `confidence`. Acessível pelo botão
  "Sugerir" no formulário de transação.
- **OCR de comprovantes** (`ocr-service.ts`): usa a visão do Claude para
  extrair estabelecimento/valor/data de uma foto de recibo. Não persiste a
  imagem — isso é responsabilidade do upload de anexos (Vercel Blob), que seria
  o próximo passo natural sobre o modelo `Attachment` já existente no schema.
- **Assistente em linguagem natural** (`assistant-service.ts`): arquitetura em
  3 passos — (1) o Claude extrai a intenção da pergunta em JSON estrito
  (categoria, período, tipo de métrica); (2) rodamos a consulta real no
  Prisma, reaproveitando os repositories já existentes; (3) o Claude só
  formula a frase final da resposta, recebendo o número exato já calculado e
  instruído a nunca alterá-lo. Widget no Dashboard com sugestões de pergunta.

**2. Importação de extratos: parsing no navegador, escrita no servidor**
`src/lib/import/statement-parsers.ts` faz todo o parsing client-side — CSV
(`papaparse`), XLSX (`xlsx`/SheetJS) e um parser OFX simplificado via regex
nos blocos `<STMTTRN>` (cobre o formato SGML/OFX 1.x mais comum em bancos
brasileiros). O usuário vê a pré-visualização antes de confirmar. Só então o
`importStatementAction` grava no banco, criando um `ImportBatch` e usando uma
regra simples de conciliação: **mesma conta + mesma data + mesmo valor +
mesmo tipo já existente = duplicata, pula**. Suficiente para evitar reimportar
o mesmo extrato duas vezes sem a complexidade de um matching fuzzy.

**3. Simulador de investimentos: 100% client-side**
Sem chamada ao servidor — a projeção de juros compostos roda inteiramente no
navegador (`useMemo`), recalculando a cada mudança nos inputs.

**4. Previsão de fluxo de caixa: linha de base + compromissos conhecidos**
`forecast-service.ts` projeta os próximos 6 meses somando a média de
receita/despesa dos últimos 3 meses com o total de assinaturas recorrentes
ativas (valor certo, não estimado) — deixando explícito no código que parcelas
já lançadas como transações futuras (Etapa 7) não entram de novo na previsão,
pois já aparecem como dado real.

**5. PWA: offline básico, não app nativo completo**
`public/manifest.json` + `public/sw.js` (network-first para navegação,
cache-first para assets estáticos) + página `/offline` + registro do service
worker só em produção (`ServiceWorkerRegistration`, client component silencioso
se falhar). Cobre leitura offline do que já foi visitado; sincronização de
mutações feitas offline exigiria Background Sync API e uma fila de retry —
documentado como próximo passo, não implementado.

### O que ficou documentado como próximo passo (não implementado nesta etapa)
- **Múltiplas moedas com conversão automática**: o campo `currency` já existe
  em `User`, mas não há tabela de câmbio nem conversão nos totais.
- **Controle familiar compartilhado**: o modelo `Household` existe no schema
  desde a Etapa 2, mas o fluxo de convite/aceite e as permissões por membro
  (Administrador/Usuário/Convidado já existem como `Role`, mas não há UI de
  gestão de membros da família) não foram construídos.
- **Conciliação bancária avançada**: hoje é só deduplicação exata; um matching
  fuzzy (tolerância de ±1 dia, título parecido) ficaria para uma iteração
  futura.
- **Upload real de comprovantes**: o botão de OCR processa a imagem em memória
  e descarta; persistir o arquivo em `Attachment` requer configurar
  `BLOB_READ_WRITE_TOKEN` (Vercel Blob) e não foi conectado.
- **Ícones do PWA**: `public/manifest.json` referencia `icon-192.png` e
  `icon-512.png` que precisam ser adicionados manualmente (ver
  `public/icons/README.txt`).

### Arquivos criados nesta etapa
```
src/lib/ai/anthropic-client.ts
src/services/ai-categorization-service.ts
src/services/ocr-service.ts
src/services/assistant-service.ts
src/services/forecast-service.ts
src/app/(dashboard)/transacoes/ai-actions.ts
src/app/(dashboard)/transacoes/import-actions.ts
src/app/(dashboard)/assistente/actions.ts
src/components/transactions/receipt-scan-button.tsx
src/components/ai/assistant-widget.tsx
src/components/investments/investment-simulator.tsx
src/components/dashboard/charts/cash-flow-forecast-chart.tsx

src/lib/import/statement-parsers.ts
src/lib/repositories/import-repository.ts
src/components/import/import-statement-dialog.tsx

public/manifest.json
public/sw.js
public/icons/README.txt
src/app/offline/page.tsx
src/components/providers/service-worker-registration.tsx

(+ transaction-form.tsx e transaction-form-dialog.tsx atualizados com os
atalhos de IA; dashboard-content.tsx e investimentos/page.tsx atualizados
com o widget do assistente, a previsão de fluxo de caixa e o simulador;
transacoes/page.tsx atualizado com o item "Importar extrato")
```

---

## Etapa 10 — Testes, Otimizações, Documentação e Deploy ✅

### Decisões de arquitetura

**1. Testes: foco em lógica pura, não em mockar o Prisma inteiro**
`vitest.config.ts` usa `vite-tsconfig-paths` (resolve os aliases `@/*` sem
configuração manual de alias) e injeta um `DATABASE_URL` fake nas variáveis de
ambiente do teste — só para permitir importar módulos que instanciam o
`PrismaClient` no top-level, sem executar nenhuma query de verdade. A suite
cobre:
- `lib/utils.test.ts` — `formatCurrency`, `formatPercent`, `cn`
- `lib/password.test.ts` — hash/verificação com salt aleatório
- `lib/sanitize.test.ts` — remoção de XSS (`sanitizeText`)
- `lib/validations/transaction.test.ts` — regras do schema Zod (valores
  inválidos, coerção, defaults)
- `services/report-service.test.ts` — `resolveReportRange` para os 5 períodos
  (mês/trimestre/semestre/ano/personalizado), incluindo o cálculo manual de
  semestre
- `lib/repositories/transaction-crud-repository.test.ts` — `buildWhere`
  (exportada especificamente para teste), garantindo que o `userId` está
  sempre presente no filtro e que os filtros combinam corretamente
- `lib/repositories/goal-repository.test.ts` — `estimateCompletion`, a
  heurística de previsão de conclusão de metas

Repositories em geral (que fazem queries reais) ficam fora da cobertura de
unit tests por design (`vitest.config.ts` exclui `src/lib/repositories/**` do
relatório de cobertura) — testá-los de verdade exigiria um banco de teste
real, documentado como próximo passo.

**2. Otimização: lazy loading dos gráficos do Dashboard**
`components/dashboard/dynamic-charts.tsx` envolve os 6 gráficos Recharts do
Dashboard com `next/dynamic({ ssr: false })`. Motivo prático: o
`ResponsiveContainer` do Recharts precisa medir o DOM, então renderizá-lo no
servidor sempre produz um flash de altura 0 antes da hidratação no cliente —
desativar SSR para esses componentes específicos remove esse flash e tira o
peso do Recharts do HTML inicial. Como `dashboard-content.tsx` é um Server
Component, o `dynamic(..., { ssr: false })` precisou morar num arquivo
`"use client"` separado (restrição do Next.js: essa opção só é permitida
dentro da árvore de Client Components).

**3. Documentação nova**
- `CONTRIBUTING.md` — como rodar localmente, rodar os testes, e as convenções
  de arquitetura (a cadeia Repository → Service → Action → Hook) que todo novo
  módulo deve seguir.
- `docs/schema.md` — diagrama entidade-relacionamento em Mermaid de todo o
  schema, mais as decisões de modelagem (Cascade vs. SetNull, Decimal vs.
  Float, enums).
- `CHANGELOG.md` — resumo do que cada uma das 10 etapas entregou.
- `docs/deploy.md` — checklist de deploy (variáveis de ambiente, migrations,
  HTTPS obrigatório para o service worker, segurança, observabilidade).

### Arquivos criados nesta etapa
```
vitest.config.ts
src/lib/utils.test.ts
src/lib/password.test.ts
src/lib/sanitize.test.ts
src/lib/validations/transaction.test.ts
src/services/report-service.test.ts
src/lib/repositories/transaction-crud-repository.test.ts
src/lib/repositories/goal-repository.test.ts
src/components/dashboard/dynamic-charts.tsx
CONTRIBUTING.md
CHANGELOG.md
docs/schema.md
docs/deploy.md
```

---

## Projeto concluído — visão geral

As 10 etapas planejadas foram todas construídas incrementalmente, cada uma
sobre a anterior, sem retrabalho de arquitetura no meio do caminho:

1. **Configuração e arquitetura** — Next.js 15, TypeScript, TailwindCSS,
   shadcn/ui, estrutura de pastas.
2. **Autenticação e banco** — schema Prisma completo, Auth.js v5, middleware,
   segurança.
3. **Layout e design system** — Sidebar, Topbar, Command Palette, dark/light.
4. **Dashboard** — 8 cards, 5 gráficos, insights automáticos.
5. **Transações** — CRUD completo, filtros, tabela virtualizada.
6. **Categorias, Contas e Cartões** — CRUD dos três, visual de cartão, faturas.
7. **Metas, Investimentos, Orçamentos** — CRUD dos três + parcelamento e
   assinaturas recorrentes automatizados.
8. **Relatórios e Calendário** — exportação PDF/Excel/CSV, calendário mensal.
9. **Funcionalidades avançadas** — IA (categorização, OCR, assistente),
   importação de extratos, simulador, previsão de fluxo de caixa, PWA.
10. **Testes, otimizações, documentação e deploy** — esta etapa.

### O que rodar para ver tudo funcionando
```bash
npm install
cp .env.example .env        # preencha DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
npm run test                # roda a suite de testes
```

### Limitações conhecidas (documentadas ao longo do projeto, não escondidas)
- Sem upload real de anexos (Vercel Blob não conectado).
- Sem múltiplas moedas de verdade (só o campo existe).
- Sem convite/permissões de família (`Household` existe, fluxo não construído).
- Sem geração automática de cobranças recorrentes após a primeira (exigiria um
  job agendado).
- Ícones do PWA são placeholders — precisam ser substituídos por arquivos reais.
- Testes de repository (integração com banco real) não foram escritos.

Este projeto não foi executado neste ambiente (sandbox sem acesso à internet,
sem PostgreSQL rodando) — todo o código é entregue pronto para `npm install` e
`npm run dev` no ambiente do usuário.
