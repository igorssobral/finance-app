# Changelog

Todas as etapas deste projeto foram construídas incrementalmente. Este
changelog resume o que cada uma entregou — para o detalhe de decisões de
arquitetura de cada etapa, veja as seções correspondentes no `README.md`.

## Etapa 10 — Testes, otimizações, documentação e deploy
- Suite de testes unitários com Vitest cobrindo validação (Zod), formatação,
  sanitização, hash de senha, resolução de período de relatório, construção de
  filtros Prisma e previsão de conclusão de metas.
- Lazy loading (`next/dynamic`, `ssr: false`) para os 6 gráficos Recharts do
  Dashboard — evita o flash de altura 0 do `ResponsiveContainer` na SSR e tira
  o bundle do Recharts do HTML inicial.
- `CONTRIBUTING.md`, `docs/schema.md` (diagrama ER em Mermaid) e este
  `CHANGELOG.md`.
- Checklist de deploy (`docs/deploy.md`).

## Etapa 9 — Funcionalidades avançadas
- IA (Anthropic API): categorização automática de despesas, OCR de
  comprovantes via visão do Claude, assistente financeiro em linguagem natural
  (arquitetura de 3 passos para nunca alucinar valores).
- Importação de extratos OFX/CSV/XLSX com preview e deduplicação.
- Simulador de investimentos (juros compostos, client-side).
- Previsão de fluxo de caixa (6 meses) no Dashboard.
- PWA básico: manifest, service worker, página offline.

## Etapa 8 — Relatórios e Calendário Financeiro
- Relatórios por mês/trimestre/semestre/ano/personalizado, com exportação em
  PDF, Excel e CSV (100% client-side).
- Calendário financeiro mensal com transações, vencimento de fatura,
  assinaturas e investimentos por dia.

## Etapa 7 — Metas, Investimentos, Orçamentos e automação
- CRUD de Metas com previsão de conclusão.
- CRUD de Investimentos com dashboard de patrimônio/rendimento/distribuição.
- CRUD de Orçamentos por categoria com alerta.
- Geração automática de parcelas (`Installment`) e assinaturas recorrentes
  (`RecurringSubscription`) via `$transaction`.

## Etapa 6 — Categorias, Contas e Cartões
- CRUD completo dos três, com seletor de cor/ícone compartilhado.
- Exclusão inteligente: Contas e Cartões com histórico são arquivados, não
  excluídos.
- Cartões: visual estilizado, fatura aberta/fechada, parcelas futuras.

## Etapa 5 — Gestão de Transações
- CRUD completo com filtros (período, categoria, conta, cartão, valor,
  recorrentes, parceladas), busca com debounce, tabela virtualizada
  (`@tanstack/react-table` + `@tanstack/react-virtual`).

## Etapa 4 — Dashboard principal
- 8 cards com comparação mês a mês e indicador de crescimento.
- 5 gráficos Recharts (Receitas x Despesas, Fluxo de Caixa, Gastos por
  Categoria, Evolução Patrimonial, Heatmap Financeiro).
- Insights automáticos por regras determinísticas.

## Etapa 3 — Layout global e sistema de design
- Sidebar colapsável, Topbar, Command Palette (`⌘K`).
- 17 primitivos shadcn/ui com tema Emerald/Blue/Zinc, dark/light mode.
- Login e registro funcionais.

## Etapa 2 — Autenticação e banco de dados
- Schema Prisma completo (15 modelos).
- Auth.js v5 com Credentials + bcrypt, sessão JWT, middleware por role.
- Rate limiting, sanitização XSS, seed com categorias padrão.

## Etapa 1 — Configuração do projeto e arquitetura
- Next.js 15 + React 19 + TypeScript + TailwindCSS + shadcn/ui.
- Estrutura de pastas Repository → Service → Action → Hook definida.
