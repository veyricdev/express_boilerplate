# NestJS Modular Structure Boilerplate

A professional NestJS boilerplate with a clean modular architecture, shared entities, and separate Admin/Client controllers.

## Features
- **Clean Architecture**: Modular structure with `common`, `config`, `database`, and `modules`.
- **Authentication**: JWT-based auth with Access & Refresh tokens.
- **RBAC**: Role-Based Access Control (`admin`, `user`).
- **Shared Entities**: Users table shared between client and admin.
- **Versioning**: URI versioning enabled (default `v1`).
- **Swagger**: API documentation available at `/docs`.
- **Validation**: Global `ValidationPipe` with `class-validator`.
- **Security**: Password hashing with `bcrypt`.

## Structure
```
src/
├── common/             # Global guards, filters, interceptors
├── config/             # Environment & DB configurations
├── database/           # Shared entities & migrations
└── modules/
    ├── auth/           # Auth logic (Admin/Client separate controllers)
    ├── users/          # Users management
    └── products/       # Products management (Example module)
```

## Setup
1. Copy `.env.example` to `.env`.
2. Configure your MySQL connection.
3. Run `npm run start:dev`.

## API Documentation
Once running, visit [http://localhost:3000/docs](http://localhost:3000/docs) to see the full API specification.

## Roles
- `user`: Default role for registration.
- `admin`: Requires manual DB update or dedicated admin registration logic.
