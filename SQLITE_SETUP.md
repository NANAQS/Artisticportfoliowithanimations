# Configuração SQLite para Vercel

## ⚠️ Importante: Limitações do SQLite na Vercel

SQLite é um banco de dados baseado em arquivo, e a Vercel usa serverless functions que são **stateless** (sem armazenamento persistente). Isso significa:

1. **Dados serão perdidos** entre deployments
2. **Não é recomendado para produção** na Vercel
3. **Cada função serverless tem seu próprio sistema de arquivos temporário**

## ✅ Solução Recomendada: Turso (SQLite Distribuído)

Para usar SQLite em produção na Vercel, recomendo usar **Turso** (https://turso.tech), que oferece SQLite distribuído e funciona perfeitamente com Vercel.

### Configuração com Turso:

1. Crie uma conta no Turso: https://turso.tech
2. Crie um banco de dados
3. Obtenha a URL de conexão (formato: `libsql://...`)
4. Configure na Vercel:
   - Variável: `DATABASE_URL`
   - Valor: `libsql://seu-banco.turso.io?authToken=seu-token`

## Configuração Local (Desenvolvimento)

Para desenvolvimento local, use:

```env
DATABASE_URL="file:./dev.db"
```

Isso criará um arquivo `dev.db` na raiz do projeto.

## Migrações

Execute as migrações:

```bash
# Criar nova migração
npx prisma migrate dev --name init

# Aplicar migrações em produção
npx prisma migrate deploy
```

## Seed do Banco

```bash
npx prisma db seed
```

## Alternativa: Continuar com PostgreSQL

Se preferir manter PostgreSQL (recomendado para produção), você pode:
- Usar Prisma Accelerate (já configurado anteriormente)
- Usar um banco PostgreSQL gerenciado (Supabase, Neon, etc.)

