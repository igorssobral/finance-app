# Contribuindo com o Finance App

Obrigado por considerar contribuir! Este guia cobre o básico para rodar o
projeto localmente e as convenções usadas no código.

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (local ou um serviço como Neon/Supabase)
- npm

## Configurando o ambiente

```bash
git clone <repo>
cd finance-app
npm install
cp .env.example .env      # preencha DATABASE_URL, DIRECT_URL e AUTH_SECRET
npm run prisma:migrate -- --name init
npm run prisma:seed        # cria o usuário demo + categorias padrão
npm run dev
```

Login de demonstração após o seed: `demo@financeapp.com` / `Demo@12345`.

## Rodando os testes

```bash
npm run test          # roda uma vez
npm run test:watch    # modo watch
```

Os testes cobrem principalmente `src/lib/**` e `src/services/**` — lógica
pura (validação, formatação, cálculo de período, sanitização) que não
depende de uma conexão real com o banco. Repositories (`src/lib/repositories/**`)
não têm testes unitários porque dependem do Prisma; a cobertura deles viria de
testes de integração contra um banco de teste real (ver "Próximos passos" no
README).

## Convenções de código

O projeto segue a arquitetura em camadas usada em todos os módulos (veja o
`README.md` para o detalhamento completo):

```
Repository (Prisma puro)
  → Service (sanitização + regra de negócio + AuditLog)
    → Server Action (Zod + auth + permissão)
      → Hook TanStack Query (cliente)
```

Ao adicionar um novo módulo (uma nova entidade CRUD), siga essa mesma
estrutura e reaproveite os componentes compartilhados já existentes:
`PageHeader`, `EmptyState`, `ConfirmDialog`, `ColorIconPicker`, os primitivos
em `src/components/ui/`.

- **Validação**: sempre um schema Zod em `src/lib/validations/`, usado tanto no
  `react-hook-form` (client) quanto na Server Action (server) — nunca duplicar
  regras.
- **Dinheiro**: sempre `Decimal` no Prisma, convertido para `number` só na
  borda de saída do repository (nunca `Float`).
- **Auditoria**: toda mutação (criar/editar/excluir) grava um `AuditLog`.
- **Permissões**: mutações chamam `requireWriteAccess()` (bloqueia `GUEST`);
  leituras chamam `requireUserId()`.
- **Commits**: mensagens curtas e no imperativo (`Adiciona filtro de período`,
  não `Adicionado filtro de período`).

## Estrutura de pastas

Veja a seção "Estrutura de pastas" no `README.md` — ela documenta o propósito
de cada diretório em `src/`.

## Dúvidas

Abra uma issue descrevendo o problema ou a proposta antes de abrir um PR
grande — isso evita retrabalho em mudanças de arquitetura.
