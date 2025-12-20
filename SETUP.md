# 🚀 Local Development Setup

> **Last Updated**: 2025-12-14
> **Target Audience**: Beginners
> **Estimated Time**: 30 minutes
> **Prerequisites**: None (we'll install everything)

---

## ⚠️ AI Assistant Instructions

**If you're an AI (Claude/Gemini/etc.) helping with this project:**

- ✅ This is the COMPLETE and CURRENT setup guide
- ✅ All features are ALREADY IMPLEMENTED (don't suggest rebuilding)
- ✅ User wants to RUN the existing code, not build new features
- ❌ DO NOT suggest alternative tech stacks
- ❌ DO NOT propose architectural changes

**See**: `docs/plans/2025-12-14-deployment-setup-guides.md` for full context

---

## 📋 What You'll Have When Done

- ✅ Crystal E-Commerce platform running locally
- ✅ PostgreSQL database with sample data
- ✅ Admin panel access
- ✅ Order management system
- ✅ Shopping cart & checkout
- ✅ Media upload capabilities

---

## Step 1: Prerequisites

### Check What You Have

Open your terminal and run these commands:

```bash
# Check Node.js (need 18 or higher)
node --version

# Check Git
git --version
```

### If You Need To Install

#### Node.js
- **Windows/Mac**: Download from [nodejs.org](https://nodejs.org/) (LTS version)
- **Mac (with Homebrew)**: `brew install node`
- **Linux (Ubuntu)**: `sudo apt install nodejs npm`

#### Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **Mac (with Homebrew)**: `brew install git`
- **Linux (Ubuntu)**: `sudo apt install git`

#### PostgreSQL

**Option A: Docker (Recommended for beginners)**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- We'll run PostgreSQL in a container (no system installation needed)

**Option B: Local PostgreSQL**
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac (with Homebrew)**: `brew install postgresql@15`
- **Linux (Ubuntu)**: `sudo apt install postgresql postgresql-contrib`

> 💡 **Recommendation**: Use Docker if you're not familiar with PostgreSQL

---

## Step 2: Get the Code

### Clone the Repository

```bash
# Navigate to where you want the project
cd ~/projects  # or wherever you keep code

# Clone the repository
git clone https://github.com/oloapozram/crystal-ecommerce.git

# Enter the project directory
cd crystal-ecommerce
```

### Install Dependencies

```bash
# This installs everything the project needs
npm install
```

**Expected output**: You'll see a progress bar and "added XXX packages"

⏱️ **This takes 2-5 minutes** depending on your internet speed

---

## Step 3: Setup PostgreSQL Database

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name crystal-postgres \
  -e POSTGRES_USER=crystal \
  -e POSTGRES_PASSWORD=crystal123 \
  -e POSTGRES_DB=crystal_ecommerce \
  -p 5432:5432 \
  -d postgres:15

# Check it's running
docker ps
```

**Expected output**: You should see `crystal-postgres` in the list

### Option B: Using Local PostgreSQL

```bash
# Start PostgreSQL service (varies by OS)

# Mac (Homebrew):
brew services start postgresql@15

# Linux (Ubuntu):
sudo systemctl start postgresql

# Windows: PostgreSQL should auto-start after installation
```

Then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres  # Windows
psql postgres     # Mac/Linux

# In the PostgreSQL prompt:
CREATE DATABASE crystal_ecommerce;
CREATE USER crystal WITH PASSWORD 'crystal123';
GRANT ALL PRIVILEGES ON DATABASE crystal_ecommerce TO crystal;
\q  # Exit
```

---

## Step 4: Configure Environment Variables

### Create Your .env File

```bash
# Copy the example file
cp .env.example .env
```

### Edit .env File

Open `.env` in your code editor and set these values:

```bash
# Database Connection
# If using Docker (from Option A above):
DATABASE_URL="postgresql://crystal:crystal123@localhost:5432/crystal_ecommerce"

# If using local PostgreSQL, same URL works!

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials (you choose these)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"  # CHANGE THIS!

# Optional: AI API Keys (leave blank for now if you don't have them)
GOOGLE_API_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
```

> 💡 **Tip**: The AI API keys are optional. The platform works without them.

---

## Step 5: Initialize the Database

### Generate Prisma Client

```bash
npx prisma generate
```

**What this does**: Creates TypeScript types for your database

### Run Database Migrations

```bash
npx prisma migrate dev
```

**What this does**: Creates all the database tables

**Expected output**:
```
✔ Name of migration: init
```

### Seed Sample Data

```bash
npx prisma db seed
```

**What this does**: Adds 43 crystal types and sample products

**Expected output**:
```
Seeded 43 crystal materials
Done!
```

---

## Step 6: Start the Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### Open Your Browser

Visit: **http://localhost:3000**

You should see the Crystal Essence homepage! 🎉

---

## Step 7: Access the Admin Panel

### Login

1. Go to: **http://localhost:3000/auth/signin**
2. Enter credentials from your `.env` file:
   - Username: `admin`
   - Password: `admin123` (or what you set)

### Explore Admin Features

- **Products**: http://localhost:3000/admin/products
- **Orders**: http://localhost:3000/admin/orders
- **Add Media**: Select a product → Upload images or add social links

---

## 🧪 Test That Everything Works

### Checklist

- [ ] Homepage loads
- [ ] Shop page shows products
- [ ] Can add items to cart
- [ ] Cart badge shows item count
- [ ] Can view cart page
- [ ] Can access checkout form
- [ ] Can sign in to admin
- [ ] Admin dashboard loads
- [ ] Can view orders list

### Test the Crystal Matcher

1. Go to: http://localhost:3000/find-your-crystal
2. Enter any birth data
3. Submit the form
4. You should see crystal recommendations

> ⚠️ **Note**: AI explanations require API keys. Without them, you'll see basic matches without detailed explanations.

---

## 🐛 Troubleshooting

### "Port 3000 is already in use"

**Solution**: Either close the other app or use a different port:

```bash
npm run dev -- -p 3001
```

Then visit: http://localhost:3001

### "Database connection failed"

**Solution**: Check your PostgreSQL is running:

```bash
# For Docker:
docker ps  # Should show crystal-postgres

# If not running:
docker start crystal-postgres

# For local PostgreSQL:
# Mac:
brew services list

# Linux:
sudo systemctl status postgresql
```

### "prisma command not found"

**Solution**: Install Prisma globally or use npx:

```bash
npx prisma --version
```

### "npm install fails"

**Solution**: Clear cache and retry:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Database won't seed

**Solution**: Reset the database:

```bash
npx prisma migrate reset
```

This will delete all data and start fresh.

---

## 💡 Development Tips

### Useful Commands

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Check for TypeScript errors
npm run lint

# Build for production (test)
npm run build

# Reset database (careful - deletes data!)
npx prisma migrate reset

# View database in GUI
npx prisma studio
```

### Prisma Studio

To view your database in a nice GUI:

```bash
npx prisma studio
```

Opens at: http://localhost:5555

### Database Migrations

If you modify `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name descriptive_name

# Example:
npx prisma migrate dev --name add_user_preferences
```

---

## 📁 Project Structure

```
crystal-ecommerce/
├── app/                          # Next.js routes
│   ├── (public)/                # Public storefront pages
│   ├── (admin)/                 # Admin panel pages
│   ├── api/                     # API endpoints
│   └── auth/                    # Authentication pages
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── admin/                   # Admin-specific components
│   ├── cart/                    # Shopping cart components
│   └── navigation/              # Header/footer
├── lib/                         # Utilities & helpers
│   ├── bazi/                    # Bazi calculator logic
│   ├── cart/                    # Cart context & logic
│   └── validation/              # Zod schemas
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed data script
│   └── migrations/             # Migration history
├── public/                      # Static assets
│   └── uploads/                # Uploaded product images
├── docs/                        # Documentation
│   └── plans/                  # Design documents
└── .env                        # Environment variables (create this)
```

---

## 🎯 What's Next?

### Option 1: Explore Locally
- Add products in admin panel
- Create test orders
- Upload product images
- Test the Bazi matcher

### Option 2: Deploy to Production
- See: **DEPLOYMENT.md** for Railway setup
- See: **COST_BREAKDOWN.md** for pricing info

### Option 3: Customize
- Update branding/colors
- Add more crystal types
- Customize email templates
- Add payment integration

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project-Specific Docs
- Design documents: `docs/plans/`
- Development status: `DEVELOPMENT_STATUS.md`
- API reference: (TODO - create if needed)

### Need Help?
- Check `docs/plans/2025-12-14-deployment-setup-guides.md` for AI assistant context
- Review existing GitHub issues
- Check the troubleshooting section above

---

## ✅ Setup Complete!

You now have a fully functional e-commerce platform running locally.

**What you can do**:
- ✅ Browse products
- ✅ Add to cart & checkout
- ✅ Manage orders via admin
- ✅ Upload media
- ✅ Find crystals by Bazi
- ✅ View analytics

**Ready for deployment?** → See `DEPLOYMENT.md`

**Questions about costs?** → See `COST_BREAKDOWN.md`
