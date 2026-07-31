# Checklist de Deploy

## 1. Banco de dados
- [ ] Provisionar PostgreSQL de produção (Neon, Supabase, RDS, etc.)
- [ ] Definir `DATABASE_URL` (via pooler, ex: PgBouncer/Prisma Accelerate) e
      `DIRECT_URL` (conexão direta, usada só pelas migrations)
- [ ] Rodar `npx prisma migrate deploy` (não `migrate dev`) no pipeline de
      deploy — `migrate dev` não deve rodar em produção
- [ ] Rodar o seed **apenas** em um ambiente novo/demo, nunca sobrescrevendo
      dados reais (`npm run prisma:seed` é idempotente para categorias padrão,
      mas cria um usuário demo — remova essa chamada do pipeline de produção)

## 2. Variáveis de ambiente (ver `.env.example`)
- [ ] `AUTH_SECRET` — gerar um valor novo e único para produção
      (`openssl rand -base64 32`), nunca reaproveitar o de desenvolvimento
- [ ] `NEXTAUTH_URL` — domínio real de produção (https://...)
- [ ] `JWT_SECRET` — se usado por alguma rota de API customizada
- [ ] `ANTHROPIC_API_KEY` — necessária para os 3 recursos de IA (categorização,
      OCR, assistente); sem ela, esses recursos falham com erro claro em vez
      de quebrar o app inteiro
- [ ] `BLOB_READ_WRITE_TOKEN` — necessária apenas se o upload real de anexos
      for conectado (hoje o OCR processa a imagem em memória e descarta)
- [ ] `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — recomendado em
      produção para o rate limiting funcionar de forma distribuída (o fallback
      em memória não funciona com múltiplas instâncias/regiões)

## 3. Build e runtime
- [ ] `npm run build` local para pegar erros de tipo antes do deploy
- [ ] Node.js 20+ no ambiente de produção (`engines` no `package.json`)
- [ ] Confirmar que `next.config.mjs` headers de segurança (X-Frame-Options
      etc.) estão ativos

## 4. HTTPS e domínio
- [ ] HTTPS obrigatório — necessário para o service worker (PWA) funcionar; a
      maioria dos navegadores não registra service workers em `http://`
      (exceto `localhost`)
- [ ] Ícones do PWA (`public/icons/icon-192.png`, `icon-512.png`) substituindo
      o placeholder em `public/icons/README.txt`

## 5. Segurança
- [ ] Revisar CORS/CSRF: Server Actions do Next já validam `Origin`
      automaticamente, mas confirme que `NEXTAUTH_URL` bate com o domínio real
- [ ] Rotacionar `AUTH_SECRET` e `ANTHROPIC_API_KEY` periodicamente
- [ ] Confirmar que `.env` nunca foi commitado (está no `.gitignore` padrão do
      Next.js)

## 6. Observabilidade (não implementado — próximo passo)
- [ ] Logging estruturado de erros (ex: Sentry) — hoje os erros de Server
      Action só aparecem no console do servidor
- [ ] Métricas de uso da API da Anthropic (custo por chamada de IA)

## 7. Pós-deploy
- [ ] Testar o fluxo completo: registro → login → criar transação → dashboard
      atualiza → exportar relatório → logout
- [ ] Testar em modo PWA (instalar o app) e verificar a página `/offline`
      desconectando a rede
