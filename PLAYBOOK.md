# PLAYBOOK — PawReach
> Email Marketing CRM para o sector pet
> Última actualização: 2026-04-04

---

## 1. VISÃO GERAL

| Campo | Detalhe |
|-------|---------|
| **Produto** | Plataforma de email marketing B2B para pet shops, grooming, clínicas vet, hotéis de pets |
| **Fase** | MVP — pronto para lançar em beta fechado |
| **Modelo** | SaaS por subscrição (FREE / SOLO / GROWTH) |
| **Diferencial** | Geração de templates de email com IA (Anthropic) + CRM de contactos pet-specific |

---

## 2. STACK TÉCNICA

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 | 4.x |
| ORM | Prisma | 7.6.0 |
| Base de dados | PostgreSQL (Neon) | — |
| Autenticação | NextAuth v5 beta | 5.0.0-beta.30 |
| Email | Resend | 6.10.0 |
| Pagamentos | Stripe | 22.0.0 |
| IA | Anthropic SDK | 0.82.0 |
| Gráficos | Recharts | 3.8.1 |
| Parsing CSV | PapaParse | 5.5.3 |
| Fontes | Inter + Syne (Google Fonts) | — |

---

## 3. ARQUITECTURA DE BASE DE DADOS

### Modelos principais
```
User → Subscription (1:1)
User → Contact[] (1:N)
User → Segment[] (1:N)
User → Campaign[] (1:N)
User → Automation[] (1:N)
User → AiTemplate[] (1:N)
User → AuditLog[] (1:N)
Contact → SegmentContact[] (N:M via Segment)
Contact → EmailLog[] (1:N)
Contact → AutomationEnrollment[] (1:N)
```

### Enums
- `UserRole`: ADMIN, EDITOR, VIEWER, USER
- `Plan`: FREE, SOLO, GROWTH
- `SubscriptionStatus`: FREE, ACTIVE, CANCELED, PAST_DUE, TRIALING
- `TipoNegocio`: PET_SHOP, GROOMING, CLINICA_VET, HOTEL_PETS, (outros)
- `EstadoLead`: FRIO, MORNO, QUENTE, CLIENTE

### Padrões aplicados
- ✅ `deletedAt DateTime?` em User e Contact (soft deletes)
- ✅ Índices compostos em Contact (userId+tipoNegocio, userId+estadoLead, userId+deletedAt)
- ✅ Unique constraint em Contact(userId, email)
- ✅ AllowedEmail whitelist implementada
- ✅ AuditLog para acções críticas

---

## 4. AUTENTICAÇÃO & SEGURANÇA

### Fluxo
- NextAuth v5 com Prisma Adapter
- Providers: Google OAuth + Resend (magic link)
- Scope Google: restrito (openid, email, profile)
- Middleware protege todas as rotas excepto: `/login`, `/api/auth`, `/api/webhooks`
- Redirect `/` → `/dashboard` para utilizadores autenticados

### Controlo de acesso
- `AllowedEmail` whitelist — necessário adicionar email antes de fazer login
- Roles: ADMIN > EDITOR > VIEWER > USER
- Sem RBAC granular por feature ainda (a implementar)

### Segurança — Estado
- ✅ Whitelist de emails
- ✅ Middleware de auth global
- ✅ AuditLog
- ⚠️ Sem security headers (CSP, X-Frame-Options) — a adicionar em `next.config`
- ⚠️ Sem rate limiting na API de IA

---

## 5. DESIGN SYSTEM

### Tokens CSS (globals.css)
```css
--app-bg: #0F172A          /* dark navy */
--app-surface: #1E293B
--app-surface-2: #334155
--app-border: #334155
--app-text: #F8FAFC
--app-text-muted: #94A3B8
--app-orange: #F97316      /* brand primary */
--app-emerald: #10B981     /* sucesso */
--app-amber: #F59E0B       /* aviso */
--app-blue: #3B82F6        /* info */
--app-red: #EF4444         /* erro */
```

### Fontes
- **Display/Headings:** Syne (400–800)
- **Body:** Inter (300–700)
- Carregadas via Google Fonts (CDN externo — pode adicionar latência)

### Modo
- Dark mode apenas (fixo, sem toggle)
- Sem suporte a `prefers-color-scheme: light`

---

## 6. AUDITORIA SAAS — SCORE: 7.5/10

### 🔴 CRÍTICOS

**C1 — Sem security headers** — ✅ Resolvido (2026-04-04): `next.config.ts` com CSP, X-Frame-Options, X-Content-Type-Options, Google Fonts no `style-src`/`font-src`

**C2 — Rate limiting na API de IA** — ⚠️ Pendente: quando a rota `/api/ia` for criada, verificar `aiGenerationsUsed` antes de chamar a SDK Anthropic

**C3 — Scripts em falta** — ✅ Resolvido (2026-04-04): `db:push`, `db:studio`, `db:seed`, `prisma generate` no build

### 🟡 IMPORTANTES (próximo sprint)

**I1 — Google Fonts via CDN externo**
- Impacto: Latência extra + GDPR (dados enviados para Google sem consent)
- Solução: Usar `next/font/google` para self-hosting automático

**I2 — Fontes carregadas via `@import` no CSS (bloqueante)**
- Impacto: Layout shift, flash of unstyled text
- Solução: Migrar para `next/font` no layout.tsx

**I3 — Sidebar / navegação — estrutura desconhecida**
- Impacto: Se não houver active state claro, utilizador perde-se
- Solução: Verificar e garantir active state com `usePathname()`

**I4 — Sem `prefers-reduced-motion`**
- Impacto: Acessibilidade para utilizadores com sensibilidade a movimento
- Solução: Adicionar `@media (prefers-reduced-motion: reduce)` em animações

**I5 — Sem empty states nas listagens**
- Impacto: Utilizador novo vê ecrã vazio sem saber o que fazer
- Solução: Implementar empty states com ícone + título + CTA em cada listagem

### 🟢 MELHORIAS (versão premium)

**M1 — Animated counters em KPIs**
- Solução: countUp animation na entrada do dashboard

**M2 — Command palette (⌘K)**
- Solução: Navegação rápida por contactos, campanhas, templates

**M3 — Side panel para detalhe de contacto**
- Solução: Substituir modal por side panel (padrão Attio/ElevenLabs)

**M4 — Bulk actions em tabela de contactos**
- Solução: Selecção múltipla + barra de acções em massa (mover para segmento, exportar, eliminar)

---

## 7. O QUE ESTÁ BEM

- ✅ Design system dark consistente e profissional (Syne+Inter é excelente)
- ✅ Tokens CSS bem definidos (não hardcoded)
- ✅ Schema de BD sólido com soft deletes, índices e AuditLog
- ✅ Integração AI para geração de templates — diferenciador claro
- ✅ Lead scoring (FRIO→CLIENTE) nativamente no schema
- ✅ RGPD básico: campo `consentimento` e `unsubscribed` no Contact

---

## 8. DECISÕES DE ARQUITECTURA

| Decisão | Motivo |
|---------|--------|
| Dark mode fixo | Produto posicionado como tool profissional/power user |
| Syne para display | Diferenciação visual clara vs concorrentes genéricos |
| Multi-tier IA limits | Controlo de custos Anthropic API por plano |
| AllowedEmail whitelist | Beta fechado — controlo de quem acede |
| User-centric (sem org) | MVP simples; multi-org pode ser fase 2 |

---

## 9. AMBIENTE

```bash
# Setup
npm install
cp .env.example .env.local  # (criar se não existir)

# Variáveis necessárias
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_RESEND_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_FROM_EMAIL=

# Dev
npm run dev
npx prisma studio
```

---

## 10. ROADMAP SUGERIDO

### Fase 1 — Beta fechado (agora)
- [ ] Security headers em next.config.ts
- [ ] Rate limiting na rota /api/ia
- [ ] Adicionar db:push ao package.json
- [ ] Migrar fontes para next/font
- [ ] Empty states em todas as listagens

### Fase 2 — Lançamento público
- [ ] Onboarding wizard (whitelist pública + setup guiado)
- [ ] Command palette ⌘K
- [ ] Bulk actions em contactos
- [ ] Relatórios de campanha com gráficos Recharts
- [ ] Side panel de detalhe de contacto

### Fase 3 — Crescimento
- [ ] Multi-workspace (organização com membros)
- [ ] Automações visuais (drag-and-drop workflow builder)
- [ ] Integrações (Zapier, webhook outbound)
- [ ] White-label para agências pet

---

## 11. ERROS RESOLVIDOS / HISTÓRICO

| Data | Problema | Solução |
|------|---------|---------|
| — | — | — |

*(actualizar após cada sessão de trabalho)*
