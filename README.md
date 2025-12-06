# Artistic Portfolio with Animations

This is a code bundle for Artistic Portfolio with Animations. The original project is available at https://www.figma.com/design/adhPjT3oj1cZ8kyXmlExcV/Artistic-Portfolio-with-Animations.

## 🚀 Quick Start

### Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed the database
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Production / Deploy

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions to Vercel.

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations (development)
- `npm run db:migrate:deploy` - Run migrations (production)
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## 🔧 Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

See `.env.example` for reference.

## 📚 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - UI components

## 🗄️ Database

This project uses PostgreSQL with Prisma ORM. Make sure you have:

1. A PostgreSQL database running
2. The `DATABASE_URL` environment variable set
3. Run migrations or push schema: `npm run db:push`

## 📖 Documentation

- [Deployment Guide](./DEPLOY.md) - How to deploy to Vercel
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🔐 Default Credentials

After seeding the database, you can login with:
- Email: `admin@portfolio.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password after first login in production!
