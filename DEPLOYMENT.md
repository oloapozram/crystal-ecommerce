# 🚀 Production Deployment Guide

> **Platform**: Railway
> **Last Updated**: 2025-12-14
> **Target Audience**: Beginners
> **Estimated Time**: 45 minutes
> **Cost**: ~$5-7/month

---

## ⚠️ AI Assistant Instructions

**If you're an AI (Claude/Gemini/etc.) helping with deployment:**

- ✅ This deployment is for **Railway ONLY** (decision already made)
- ✅ Database is **PostgreSQL** (not MySQL)
- ✅ All code is ready to deploy (no changes needed)
- ❌ DO NOT suggest Vercel, AWS, or other platforms
- ❌ DO NOT suggest complex DevOps setups

**See**: `docs/plans/2025-12-14-deployment-setup-guides.md` for full context

---

## 📋 What You'll Have When Done

- ✅ Live website accessible worldwide
- ✅ PostgreSQL database in the cloud
- ✅ Automatic deployments on git push
- ✅ HTTPS/SSL included
- ✅ Monitoring and logs
- ✅ ~$5-7/month cost

---

## Prerequisites

### Before You Start

- [ ] Code running locally (completed `SETUP.md`)
- [ ] GitHub account
- [ ] Credit/debit card (for Railway - free $5 credit first month)
- [ ] Code pushed to GitHub repository

### Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create GitHub repository (via github.com)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/crystal-ecommerce.git
git branch -M main
git push -u origin main
```

---

## Step 1: Create Railway Account

### Sign Up

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
   - Click "Login with GitHub"
   - Authorize Railway

### Free Credits

- ✅ You get **$5 free credit** to start
- ✅ No card required immediately
- ✅ Perfect for testing

> 💡 **Tip**: This covers your first month completely!

---

## Step 2: Deploy PostgreSQL Database

### Create Database

1. **In Railway Dashboard**:
   - Click **"+ New"**
   - Select **"Database"**
   - Choose **"PostgreSQL"**

2. **Wait for provisioning** (30 seconds)

3. **Get Connection String**:
   - Click on the PostgreSQL service
   - Go to **"Connect"** tab
   - Copy **"Postgres Connection URL"**
   - Save it - you'll need this!

**Example URL**:
```
postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:6543/railway
```

> ⚠️ **Important**: Keep this URL secret! Don't commit it to git.

---

## Step 3: Deploy Next.js Application

### Connect GitHub Repository

1. **In Railway Dashboard**:
   - Click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose **"crystal-ecommerce"** repository

2. **Configure Build**:
   - Railway auto-detects Next.js! ✅
   - No configuration needed

3. **Wait for initial deploy** (2-3 minutes)

### Check Build Logs

- Click on your service
- Go to **"Deployments"** tab
- Watch the build progress
- Look for **"Build successful"**

> 💡 **First build takes 2-3 minutes**. Subsequent builds are faster.

---

## Step 4: Configure Environment Variables

### Add Variables to Railway

1. Click on your **Next.js service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**

### Required Variables

Add each of these (click "+ New Variable" for each):

```bash
# Database Connection (from Step 2)
DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:6543/railway

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters-long
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_THIS_SECURE_PASSWORD

# Optional: AI API Keys (if you have them)
GOOGLE_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

### Important Notes

**NEXTAUTH_SECRET**: Generate a secure one:
```bash
# Run this locally to generate:
openssl rand -base64 32
```

**NEXTAUTH_URL**: Railway variable
- Use exactly: `${{RAILWAY_PUBLIC_DOMAIN}}`
- Railway auto-fills this with your domain

**ADMIN_PASSWORD**:
- Use a strong password!
- Don't use "admin123" in production

### Save and Redeploy

After adding variables:
1. Railway will **automatically redeploy**
2. Wait for new deployment (1-2 minutes)

---

## Step 5: Initialize Database

### Run Migrations

1. **In Railway Dashboard**:
   - Click on your **Next.js service**
   - Go to **"Settings"** tab
   - Scroll to **"Deploy Trigger"**

2. **Add Deploy Command** (if not already set):
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Run Migrations Manually** (one-time):

   **Option A: Via Railway CLI**
   ```bash
   # Install Railway CLI locally
   npm install -g @railway/cli

   # Login
   railway login

   # Link to your project
   railway link

   # Run migration
   railway run npx prisma migrate deploy
   ```

   **Option B: Via GitHub Action** (add to your repo)
   Create `.github/workflows/railway-migrate.yml`:
   ```yaml
   name: Railway Migration
   on:
     workflow_dispatch:

   jobs:
     migrate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm install
         - run: npx prisma migrate deploy
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

   **Option C: Temporary Connection** (easiest)
   ```bash
   # Temporarily use Railway database locally
   DATABASE_URL="your-railway-postgres-url" npx prisma migrate deploy
   ```

### Seed Database

```bash
# Same as migration, choose your option:
railway run npx prisma db seed

# OR locally with Railway database:
DATABASE_URL="your-railway-postgres-url" npx prisma db seed
```

**Expected output**:
```
Seeded 43 crystal materials
Done!
```

---

## Step 6: Verify Deployment

### Test Your Site

1. **Get Your URL**:
   - In Railway, click your Next.js service
   - Copy the **URL** (something like: `your-app.up.railway.app`)

2. **Visit Homepage**:
   - Go to: `https://your-app.up.railway.app`
   - You should see the Crystal Essence homepage

3. **Test Admin Login**:
   - Go to: `https://your-app.up.railway.app/auth/signin`
   - Login with your ADMIN credentials
   - Should reach admin dashboard

### Checklist

- [ ] Homepage loads correctly
- [ ] Shop page shows products
- [ ] Can add items to cart
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Can view orders
- [ ] Images load (if uploaded)

---

## Step 7: Configure Custom Domain (Optional)

### Add Your Domain

1. **Buy a domain** (if you don't have one):
   - Namecheap, GoDaddy, Google Domains, etc.
   - Cost: ~$10-15/year

2. **In Railway**:
   - Click your Next.js service
   - Go to **"Settings"**
   - Scroll to **"Domains"**
   - Click **"+ Custom Domain"**
   - Enter your domain: `crystalessence.com`

3. **Configure DNS** (at your domain registrar):
   - Add a **CNAME record**:
     - Name: `www` (or `@` for root domain)
     - Value: Your Railway URL
   - Add an **A record** (for root domain):
     - Railway provides the IP

4. **Wait for DNS propagation** (5 minutes to 24 hours)

5. **Update NEXTAUTH_URL**:
   - In Railway variables, change:
   - From: `${{RAILWAY_PUBLIC_DOMAIN}}`
   - To: `https://your-domain.com`

### SSL Certificate

- ✅ Railway provides free SSL automatically
- ✅ Your site will have HTTPS
- ✅ Certificate auto-renews

---

## 🔄 Deploying Updates

### Automatic Deployments

**Every time you push to GitHub, Railway auto-deploys!**

```bash
# Make changes locally
git add .
git commit -m "Update product descriptions"
git push

# Railway automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Runs tests
# 4. Deploys new version
# 5. Zero downtime!
```

### Monitor Deployments

1. Go to Railway Dashboard
2. Click your Next.js service
3. Go to **"Deployments"** tab
4. See build progress in real-time

### Rollback if Needed

1. In **"Deployments"** tab
2. Find the working version
3. Click **"..."** menu
4. Select **"Redeploy"**

---

## 📊 Monitoring & Logs

### View Application Logs

1. Click your Next.js service
2. Click **"Logs"** tab
3. See real-time logs

**Useful for**:
- Debugging errors
- Seeing user activity
- Monitoring performance

### Database Logs

1. Click your PostgreSQL service
2. Click **"Logs"** tab
3. See database queries and connections

### Metrics

1. Go to **"Metrics"** tab
2. See:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## 💰 Cost Monitoring

### Check Usage

1. Go to **"Usage"** in Railway dashboard
2. See current month's costs
3. Projected monthly cost

### Set Budget Alerts

1. Go to **"Settings"** → **"Usage Alerts"**
2. Set monthly limit: `$15`
3. Get email when approaching limit

### Current Costs

**Expected monthly bill**:
- PostgreSQL: ~$1-2/month
- Next.js App: ~$1-2/month
- Bandwidth: ~$0.50/month
- **Total: ~$5-7/month**

> 💡 See `COST_BREAKDOWN.md` for detailed pricing

---

## 🐛 Troubleshooting

### Build Fails

**Check**:
1. Does it build locally? (`npm run build`)
2. Are all dependencies in `package.json`?
3. Check build logs for errors

**Common fixes**:
```bash
# Ensure production dependencies are correct
npm install

# Test build locally
npm run build
npm start
```

### Database Connection Errors

**Check**:
1. Is DATABASE_URL set correctly?
2. Did you run migrations?
3. Is PostgreSQL service running in Railway?

**Solution**:
```bash
# Verify connection string format
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Test connection locally
DATABASE_URL="your-railway-url" npx prisma db pull
```

### Environment Variables Not Working

**Check**:
1. Did you click "Save" after adding variables?
2. Did you redeploy after adding variables?
3. Are variable names spelled correctly?

**Solution**:
- Edit variables
- Click **"Redeploy"** button

### Site Loads But Features Broken

**Check admin login**:
- Are ADMIN_USERNAME and ADMIN_PASSWORD set?
- Try signing in

**Check database**:
```bash
# Connect to Railway DB and check data
railway run npx prisma studio
```

### "Application Error" Page

**This means**:
- App crashed during startup
- Check logs immediately

**Solution**:
1. Go to "Logs" tab
2. Look for error messages
3. Fix the error
4. Push to GitHub (auto-redeploys)

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed ADMIN_PASSWORD from default
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] DATABASE_URL not committed to git
- [ ] Environment variables marked as secret
- [ ] HTTPS enabled (Railway does this automatically)
- [ ] Regular backups enabled (see below)

---

## 💾 Backup Strategy

### Database Backups

**Option 1: Railway Backups** (Recommended)
1. Click PostgreSQL service
2. Go to **"Backups"** tab
3. Enable **"Automatic Backups"**
4. Choose frequency: Daily

**Option 2: Manual Export**
```bash
# Export database
railway run pg_dump $DATABASE_URL > backup.sql

# Restore if needed
railway run psql $DATABASE_URL < backup.sql
```

### Code Backups

- ✅ Already backed up on GitHub
- ✅ Every commit is a backup
- ✅ Can restore any previous version

---

## 📈 Scaling & Performance

### When to Scale Up

Your current plan handles:
- ✅ Up to 1,000 visitors/month
- ✅ Hundreds of orders
- ✅ Thousands of product views

**Scale up when**:
- Site feels slow
- Usage alerts trigger
- > 1,000 visitors/month

### How to Scale

1. **Upgrade Database**:
   - Click PostgreSQL service
   - Go to **"Settings"**
   - Upgrade to larger plan

2. **Upgrade App Resources**:
   - Usually not needed for small scale
   - Railway auto-scales within your plan

---

## ✅ Deployment Complete!

Your e-commerce platform is now live! 🎉

### What You Can Do Now

- ✅ Share your URL with customers
- ✅ Add products via admin panel
- ✅ Process real orders
- ✅ Upload product images
- ✅ Monitor traffic and sales

### Next Steps

1. **Marketing**:
   - Share on social media
   - SEO optimization
   - Google Analytics

2. **Maintenance**:
   - Monitor logs weekly
   - Backup database monthly
   - Update dependencies quarterly

3. **Enhancements**:
   - Add payment processing
   - Email notifications
   - Customer accounts
   - Analytics dashboard

---

## 📚 Additional Resources

### Railway Docs
- [Railway Documentation](https://docs.railway.app/)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://docs.railway.app/develop/variables)

### Need Help?
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project docs: `docs/plans/`
- Cost questions: `COST_BREAKDOWN.md`

---

## 🎯 Quick Reference

### Important URLs

```
Production Site:    https://your-app.up.railway.app
Admin Login:        https://your-app.up.railway.app/auth/signin
Railway Dashboard:  https://railway.app/dashboard
GitHub Repo:        https://github.com/YOUR_USERNAME/crystal-ecommerce
```

### Common Commands

```bash
# Deploy updates
git push

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy

# Access database
railway run npx prisma studio

# Check status
railway status
```

---

**🎊 Congratulations! Your store is live!**
