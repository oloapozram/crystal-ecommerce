# Crystal Essence - E-Commerce Platform

Modern e-commerce platform for crystal merchandise with integrated inventory management, supplier analytics, and AI-powered content generation based on Chinese metaphysical Bazi principles.

## 🌟 Features

- **E-Commerce Storefront**: Beautiful product catalog with quality tiers (Normal/Good/High)
- **Inventory Management**: Track stock, COGS, and supplier performance
- **Supplier Comparison**: Analytics to find best value suppliers per product
- **Bazi Matching Tool**: Customers enter birth data to find crystals aligned with their Bazi chart
- **AI Content Generation**:
  - Bazi-based selling copy (RAG-powered, accuracy-verified)
  - Video edit prompts for TikTok/Instagram/Facebook
- **Media Manager**: Upload and organize product images/videos
- **Algorithmic Art**: p5.js generative backgrounds based on Five Elements

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MySQL 8.0+
- **ORM**: Prisma
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK + Anthropic Claude
- **Generative Art**: p5.js
- **Auth**: NextAuth.js

## 📁 Project Structure

```
crystal/
├── app/                    # Next.js app routes
│   ├── (public)/          # Public storefront
│   ├── admin/             # Admin dashboard
│   └── api/               # REST API endpoints
├── components/            # React components
├── lib/                   # Utilities & AI generators
│   └── bazi-knowledge/    # RAG knowledge base
├── prisma/                # Database schema
├── public/media/          # Product images/videos
├── docs/plans/            # Design documents
└── .claude/              # Superpowers configuration
```

## 🚀 Getting Started

(Implementation in progress - check `docs/plans/2025-11-26-crystal-ecommerce-design.md`)

## 📖 Documentation

- [Design Document](docs/plans/2025-11-26-crystal-ecommerce-design.md)
- [Theme Configuration](theme-config.json)
- [Project Settings](.claude/settings.json)

## 🔮 Bazi System

The platform uses authentic Chinese metaphysical Bazi (Four Pillars of Destiny) principles:

- **Five Elements**: Wood, Fire, Earth, Metal, Water
- **RAG Knowledge Base**: Prevents AI hallucinations
- **Human Verification**: All generated content reviewed before publishing
- **Educational Disclaimer**: Not a substitute for professional consultation

## 💳 Payment Methods

- Wire Transfer
- PayPal (Friends & Family)
- GCash
- Bank Transfer

_(Manual payment processing - no merchant integration)_

## 📜 License

Proprietary - All rights reserved

## 👨‍💻 Development

Built with superpowers skills for systematic development practices.
