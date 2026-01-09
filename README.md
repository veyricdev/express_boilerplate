# Express V5 TypeScript Boilerplate

A modern, production-ready boilerplate for building RESTful APIs with [Express.js V5](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).

## 🚀 Features

- **Latest Tech Stack**: Built with Express V5 and TypeScript.
- **Database ORM**: [Prisma](https://www.prisma.io/) with PostgreSQL support.
- **Caching**: Redis integration using `ioredis`.
- **Validation**: Strict environment and request validation using [Zod](https://zod.dev/).
- **API Documentation**: Automatic API documentation generated with [Scalar](https://scalar.com/).
- **Logging**: High-performance logging with [Pino](https://github.com/pinojs/pino).
- **Security**:
  - `helmet` for HTTP header security.
  - `cors` for Cross-Origin Resource Sharing.
  - `express-rate-limit` for rate limiting.
- **Authentication**:
  - JWT (JSON Web Tokens) strategies.
  - OAuth2 integration via Passport (Google, Facebook, GitHub).
- **Monitoring**: Telegram bot integration for error reporting (`telegraf`).
- **Scheduled Jobs**: `node-cron` for running background tasks (e.g., database cleanup).
- **Tooling**:
  - [Biome](https://biomejs.dev/) for fast linting and formatting.
  - [SWC](https://swc.rs/) for super-fast builds.
  - Path aliases (`~/*` mapping to `src/*`).
- **Deployment**: Ready for Vercel deployment with included configuration.

## 🛠️ Prerequisites

- **Node.js**: >= 22.21.1
- **Package Manager**: pnpm (recommended)

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd express_boilerplate
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
# or
bun install
```

### 3. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your database credentials, Redis URL, and API keys.

### 4. Database Setup

Ensure you have a PostgreSQL database running, then apply migrations:

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

### 5. Run the Application

**Development Mode:**

```bash
pnpm dev
# Runs with --watch using tsx
```

**Production Build:**

```bash
pnpm build
pnpm start
```

## 📜 Available Scripts

| Script                | Description                                  |
| :-------------------- | :------------------------------------------- |
| `pnpm dev`            | Start the development server with hot reload |
| `pnpm build`          | Build the project for production using SWC   |
| `pnpm start`          | Run the built production server              |
| `pnpm clean`          | Remove the `dist` directory                  |
| `pnpm format`         | Format code using Biome                      |
| `pnpm lint`           | Lint code using Biome                        |
| `pnpm check`          | Check code for formatting and linting errors |
| `pnpm prisma:migrate` | Run Prisma migrations                        |
| `pnpm prisma:studio`  | Open Prisma Studio to view database          |

## 📂 Project Structure

```
├── .github/          # GitHub Actions workflows
├── src/
│   ├── configs/      # Configuration files (DB, Env, Logger, etc.)
│   ├── constants/    # Global constants
│   ├── core/         # Core application logic
│   ├── docs/         # API documentation setups
│   ├── middlewares/  # Express middlewares
│   ├── modules/      # Feature modules (Controllers, Services, Routes, Interfaces)
│   ├── prisma/       # Prisma schema and migrations
│   ├── utils/        # Utility helpers
│   ├── server.ts     # Express app setup and middleware configuration
│   └── index.ts      # Application entry point and server startup
├── types/            # Global type definitions
├── dist/             # Compiled output (ignored)
├── .env              # Environment variables
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies and scripts
```

## 🔒 Environment Variables

Key variables to configure in `.env`:

- `PORT`: Server port (default: 6606)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `TELE_BOT_TOKEN`: Telegram Bot Token for alerts
- `TELE_CHAT_ID`: Telegram Chat ID for alerts
- `DEBUG_CONSOLE`: Enable console logging (default: true)
- `DEBUG_FILE`: Enable file logging (default: false)
- `GOOGLE_CLIENT_ID`: Google Client ID for OAuth2
- `GOOGLE_CLIENT_SECRET`: Google Client Secret for OAuth2
- `FACEBOOK_APP_ID`: Facebook App ID for OAuth2
- `FACEBOOK_APP_SECRET`: Facebook App Secret for OAuth2
- `GITHUB_CLIENT_ID`: GitHub Client ID for OAuth2
- `GITHUB_CLIENT_SECRET`: GitHub Client Secret for OAuth2

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
