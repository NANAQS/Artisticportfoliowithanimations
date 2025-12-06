# Guia de Deploy na Vercel

Este guia explica como fazer o deploy deste projeto na Vercel.

## Pré-requisitos

1. Conta na Vercel ([vercel.com](https://vercel.com))
2. Banco de dados PostgreSQL (recomendado: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) ou [Neon](https://neon.tech))
3. Git configurado

## Passo a Passo

### 1. Preparar o Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)
1. No dashboard da Vercel, vá em **Storage**
2. Crie um novo banco **Postgres**
3. Copie a string de conexão (`DATABASE_URL`)

#### Opção B: Neon ou outro provedor
1. Crie um banco PostgreSQL no seu provedor
2. Copie a string de conexão

### 2. Executar Migrações do Prisma

Antes do deploy, você precisa executar as migrações no banco de dados:

```bash
# Instalar dependências
npm install

# Gerar o cliente Prisma
npx prisma generate

# Executar migrações (se houver)
npx prisma migrate deploy

# Ou fazer push do schema (desenvolvimento)
npx prisma db push
```

### 3. Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

#### Se estiver usando Prisma Accelerate (Recomendado):
```
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
POSTGRES_URL=postgres://user:password@host:5432/database?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=seu_api_key
JWT_SECRET=sua-chave-secreta-super-forte-aqui
NODE_ENV=production
```

#### Se estiver usando conexão direta:
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=sua-chave-secreta-super-forte-aqui
NODE_ENV=production
```

**Importante:**
- Use uma string aleatória forte para `JWT_SECRET` (pode usar: `openssl rand -base64 32`)
- Se usar Prisma Accelerate, configure as três variáveis: `DATABASE_URL`, `POSTGRES_URL` e `PRISMA_DATABASE_URL`
- O Prisma Accelerate melhora a performance e reduz conexões ao banco

### 4. Fazer Deploy

#### Opção A: Via CLI da Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

#### Opção B: Via GitHub/GitLab
1. Faça push do código para um repositório Git
2. No dashboard da Vercel, clique em **Add New Project**
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Clique em **Deploy**

### 5. Pós-Deploy

Após o deploy, você precisa:

1. **Executar as migrações** (se ainda não executou):
   ```bash
   npx prisma migrate deploy
   ```

2. **Popular o banco com dados iniciais** (opcional):
   ```bash
   npm run db:seed
   ```

3. **Criar o usuário admin**:
   - Acesse `/dashboard/login`
   - Use as credenciais padrão (se o seed foi executado):
     - Email: `admin@portfolio.com`
     - Senha: `admin123`
   - **IMPORTANTE:** Altere a senha após o primeiro login!

## Configurações Importantes

### Build Command
A Vercel já está configurada para executar `prisma generate && next build` automaticamente.

### Região
O projeto está configurado para usar a região `iad1` (US East). Você pode alterar no `vercel.json` se necessário.

### Prisma
O projeto usa Prisma com PostgreSQL. Certifique-se de que:
- O `DATABASE_URL` está correto
- As migrações foram executadas
- O Prisma Client foi gerado (`prisma generate`)

## Troubleshooting

### Erro: "PrismaClient needs to be constructed"
- Certifique-se de que `DATABASE_URL` está configurada
- Execute `npx prisma generate` antes do build

### Erro: "Table does not exist"
- Execute as migrações: `npx prisma migrate deploy`
- Ou faça push do schema: `npx prisma db push`

### Erro de autenticação
- Verifique se `JWT_SECRET` está configurada
- Certifique-se de usar uma chave forte em produção

### Build falha
- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Node.js version está compatível (recomendado: 18.x ou 20.x)

## Variáveis de Ambiente Necessárias

| Variável | Descrição | Obrigatória | Quando usar |
|----------|-----------|-------------|-------------|
| `DATABASE_URL` | String de conexão do PostgreSQL | Sim | Sempre |
| `POSTGRES_URL` | String de conexão do PostgreSQL (alternativa) | Não | Com Prisma Accelerate |
| `PRISMA_DATABASE_URL` | URL do Prisma Accelerate | Não | Com Prisma Accelerate |
| `JWT_SECRET` | Chave secreta para JWT | Sim | Sempre |
| `NODE_ENV` | Ambiente (production/development) | Não | Recomendado |

### Prisma Accelerate

O projeto suporta Prisma Accelerate para melhor performance. Quando configurado:
- Use `PRISMA_DATABASE_URL` com o formato `prisma+postgres://...`
- O código detecta automaticamente e usa o Accelerate
- Melhora a latência e reduz conexões ao banco

## Suporte

Para mais informações, consulte:
- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do Next.js](https://nextjs.org/docs)

