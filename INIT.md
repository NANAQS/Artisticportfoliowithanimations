# Inicialização do Banco de Dados em Produção

Este projeto está configurado para popular automaticamente o banco de dados com dados padrão quando for para produção.

## Métodos de Inicialização

### 1. Automático via Vercel (Recomendado)

O Vercel executará automaticamente as migrações durante o build:
```bash
prisma migrate deploy
```

Após o deploy, você pode inicializar os dados de duas formas:

#### Opção A: Via API Endpoint

Faça uma requisição POST para `/api/init` com a chave secreta:

```bash
curl -X POST https://seu-dominio.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "sua-chave-secreta"}'
```

**Importante**: Configure a variável de ambiente `INIT_SECRET` na Vercel com uma chave segura.

#### Opção B: Via Script Local

Execute o script de inicialização:
```bash
npm run db:init
```

### 2. Manual via Prisma Studio

1. Acesse o Prisma Studio:
```bash
npm run db:studio
```

2. Adicione os dados manualmente através da interface.

### 3. Via Seed Direto

Execute o seed diretamente:
```bash
npm run db:seed
```

## Dados Padrão Criados

O seed cria automaticamente:

- **Usuário Admin**:
  - Email: `admin@portfolio.com`
  - Senha: `admin123`
  - Role: `admin`

- **15 Gallery Artworks** (obras de arte para a galeria)
- **5 Carousel Artworks** (obras para o carrossel)
- **3 Scroll Content** (conteúdo de scroll)
- **3 Testimonials** (depoimentos)
- **9 Skills** (habilidades)

## Comportamento em Produção

- O seed **NÃO** limpa dados existentes em produção
- Os dados são criados apenas se não existirem (idempotente)
- Para forçar reset, defina `RESET_DB=true` como variável de ambiente

## Verificar Status

Para verificar se o banco foi inicializado:

```bash
curl https://seu-dominio.vercel.app/api/init
```

Retorna o status e contagem de registros em cada tabela.

## Variáveis de Ambiente Necessárias

Certifique-se de ter configurado na Vercel:

- `DATABASE_URL` ou `PRISMA_DATABASE_URL` - URL do banco de dados
- `INIT_SECRET` (opcional) - Chave secreta para proteger o endpoint `/api/init`

## Segurança

⚠️ **IMPORTANTE**: 
- O endpoint `/api/init` deve ser protegido com uma chave secreta
- Configure `INIT_SECRET` na Vercel com uma chave forte
- Após a inicialização, considere desabilitar ou proteger ainda mais este endpoint

