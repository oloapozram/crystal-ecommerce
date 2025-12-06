---
description: How to run the Crystal Essence e-commerce project
---

# Running the Crystal Essence Project

This workflow guides you through setting up and running the Crystal Essence e-commerce platform.

## Prerequisites

Before starting, ensure you have:
- Node.js v18 or higher installed
- MySQL 8.0+ running (via XAMPP or standalone)
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file to create your local configuration:

```bash
copy .env.example .env
```

Then edit the `.env` file and configure the following:

- **DATABASE_URL**: Update if your MySQL credentials differ from `root:@localhost:3306`
- **NEXTAUTH_SECRET**: Generate a secure random string (use `openssl rand -base64 32` or any random string generator)
- **NEXTAUTH_URL**: Keep as `http://localhost:3000` for local development
- **AI API Keys**: Add at least ONE of the following:
  - **GOOGLE_AI_API_KEY** (Recommended - free tier, no credit card): Get from https://ai.google.dev/
  - **OPENAI_API_KEY** (Good free tier): Get from https://platform.openai.com/
  - **ANTHROPIC_API_KEY** (Optional, requires credit card): Get from https://console.anthropic.com/

### 3. Start MySQL Server

Ensure MySQL is running:
- If using XAMPP: Open XAMPP Control Panel and start the MySQL service
- If using standalone MySQL: Ensure the service is running

### 4. Initialize Database

Generate Prisma client and create database tables:

```bash
npx prisma generate
```

```bash
npx prisma db push
```

### 5. (Optional) Seed Database

If you want sample data for testing:

```bash
npx prisma db seed
```

### 6. Start Development Server

// turbo
Run the Next.js development server:

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## Available Commands

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build production bundle
- **`npm start`** - Run production server
- **`npm run lint`** - Run ESLint code linting
- **`npm test`** - Run Vitest test suite

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running in XAMPP
- Check that the database `crystal_ecommerce` exists
- Verify credentials in `.env` match your MySQL setup

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Missing Dependencies
If you encounter module errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
If Prisma schema changes aren't reflected:
```bash
npx prisma generate
npx prisma db push
```

## Project Structure

- **`/app`** - Next.js App Router pages and API routes
  - **`/(public)`** - Public-facing storefront
  - **`/admin`** - Admin dashboard
  - **`/api`** - REST API endpoints
- **`/components`** - Reusable React components
- **`/lib`** - Utilities, AI generators, and Bazi knowledge base
- **`/prisma`** - Database schema and migrations
- **`/public/media`** - Product images and videos

## Next Steps

After the server is running:
1. Visit http://localhost:3000 to see the storefront
2. Visit http://localhost:3000/admin to access the admin dashboard
3. Visit http://localhost:3000/auth/signin to sign in (if authentication is set up)

Enjoy building with Crystal Essence! 🔮✨
