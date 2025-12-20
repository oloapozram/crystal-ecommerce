# 🤖 AI Assistant Prompt Guide

> **Purpose**: Copy-paste prompts to use when continuing work with AI assistants (Claude, Gemini, etc.) to prevent hallucination and ensure they follow the existing project structure.

---

## 🚀 Quick Start Prompts

### 📖 Initial Context Prompt (Use This First!)

```
I'm working on a crystal e-commerce platform that's already fully built and working.

PLEASE READ THESE FILES FIRST:
1. docs/plans/2025-12-14-deployment-setup-guides.md
2. SETUP.md (if helping with local development)
3. DEPLOYMENT.md (if helping with deployment)

CRITICAL CONSTRAINTS:
❌ All features are ALREADY IMPLEMENTED - do NOT rebuild them
❌ Database is PostgreSQL (not MySQL) - do NOT suggest changing it
❌ Deployment is Railway only - do NOT suggest other platforms
❌ Do NOT refactor existing working code
❌ Do NOT add features I didn't ask for
❌ Do NOT over-engineer solutions

✅ DO: Help me with the specific task I describe
✅ DO: Follow existing code patterns
✅ DO: Keep solutions simple and focused
✅ DO: Read the relevant documentation first

What I need help with: [YOUR SPECIFIC TASK HERE]
```

---

## 📋 Task-Specific Prompts

### 1. Local Development Setup

```
Help me set up this project locally by following SETUP.md exactly.

DO:
- Follow each step in SETUP.md in order
- Help me troubleshoot if I get stuck
- Verify each step completed successfully

DO NOT:
- Suggest alternative setup methods
- Skip steps or take shortcuts
- Change the technology stack

Current status: [WHERE YOU ARE IN SETUP.MD]
Issue (if any): [DESCRIBE YOUR PROBLEM]
```

### 2. Railway Deployment

```
Help me deploy this project to Railway by following DEPLOYMENT.md exactly.

DO:
- Walk me through each step in DEPLOYMENT.md
- Help configure environment variables correctly
- Verify the deployment is working

DO NOT:
- Suggest other hosting platforms
- Change the database provider
- Skip the migration steps

Current step: [STEP NUMBER FROM DEPLOYMENT.MD]
Error message (if any): [PASTE ERROR HERE]
```

### 3. Bug Fixing

```
There's a bug in the [FEATURE NAME] feature. This feature is already implemented and working - I just need the bug fixed.

DO:
- Debug the specific issue
- Fix it with minimal code changes
- Test the fix works
- Keep the existing code structure

DO NOT:
- Rebuild the feature from scratch
- Refactor surrounding code
- Add new features while fixing
- Change the architecture

Bug description: [DESCRIBE THE BUG]
Steps to reproduce: [HOW TO TRIGGER THE BUG]
Expected behavior: [WHAT SHOULD HAPPEN]
Actual behavior: [WHAT ACTUALLY HAPPENS]
```

### 4. Adding a Small Feature

```
I want to add [SPECIFIC FEATURE] to the existing platform.

Context:
- All core features (products, cart, checkout, orders, admin, Bazi calculator) are complete
- Follow existing code patterns and architecture
- Keep it simple - no over-engineering
- Use the same tech stack (Next.js 15, Prisma, PostgreSQL)

DO:
- Read relevant existing code first
- Match the existing code style
- Add minimal necessary code
- Test it works

DO NOT:
- Refactor existing features
- Change the project structure
- Add dependencies unless absolutely necessary
- Over-engineer the solution

Feature request: [DESCRIBE WHAT YOU WANT]
Why I need it: [EXPLAIN THE USE CASE]
```

### 5. Understanding the Codebase

```
Help me understand how [SPECIFIC FEATURE/COMPONENT] works in this codebase.

DO:
- Read the relevant code files
- Explain the existing implementation
- Show me where key logic lives
- Help me understand the data flow

DO NOT:
- Suggest rewriting it
- Propose architectural changes
- Add features while explaining
- Change working code

What I want to understand: [BE SPECIFIC]
Why I'm asking: [YOUR GOAL]
```

### 6. Database Migrations

```
I need to make database changes: [DESCRIBE CHANGES]

Context:
- Database is PostgreSQL (via Prisma)
- Schema is in prisma/schema.prisma
- Follow Prisma best practices

DO:
- Update the Prisma schema
- Generate the migration
- Review the SQL before applying
- Test the migration locally first

DO NOT:
- Change the database provider
- Remove existing tables/columns without asking
- Skip migration generation
- Apply migrations without testing

Changes needed: [DESCRIBE SCHEMA CHANGES]
```

### 7. Testing & Debugging

```
Help me test/debug [SPECIFIC FUNCTIONALITY].

DO:
- Test the specific feature
- Identify the root cause
- Suggest focused fixes
- Verify the fix works

DO NOT:
- Rebuild the feature
- Add extensive test frameworks (unless requested)
- Refactor working code
- Change the architecture

What to test: [DESCRIBE FEATURE]
Problem I'm seeing: [DESCRIBE ISSUE]
```

### 8. Cost Optimization

```
Help me optimize costs for my Railway deployment.

Context:
- Read COST_BREAKDOWN.md first
- Current monthly cost: [YOUR CURRENT COST]
- Target cost: [YOUR TARGET COST]

DO:
- Review current usage in Railway dashboard
- Suggest specific optimizations from COST_BREAKDOWN.md
- Help implement the optimizations
- Monitor the impact

DO NOT:
- Suggest changing platforms
- Recommend complex DevOps setups
- Break existing functionality
- Over-optimize prematurely

Current usage: [DESCRIBE YOUR TRAFFIC/USAGE]
```

---

## 🎯 Examples of Good vs Bad Prompts

### ❌ BAD Prompts (Will Cause Hallucination)

```
"continue development"
```
**Why bad**: Too vague, AI might rebuild everything

```
"what features should we add?"
```
**Why bad**: Will get unnecessary feature suggestions

```
"help me build an e-commerce site"
```
**Why bad**: AI doesn't know one is already built

```
"improve this code"
```
**Why bad**: Will get refactoring you don't need

### ✅ GOOD Prompts (Clear and Focused)

```
"Follow SETUP.md to help me install PostgreSQL via Docker. I'm stuck at step 3."
```
**Why good**: Specific task, references documentation, states exact location

```
"There's a bug in the checkout form - the email validation isn't working. Help me debug it."
```
**Why good**: Specific bug, existing feature, clear request

```
"Add a simple email notification when orders are placed. Keep it minimal and use existing patterns."
```
**Why good**: Specific feature, clear constraints, respects existing code

```
"Explain how the Bazi calculator works in src/app/bazi/page.tsx"
```
**Why good**: Specific file, clear goal, not asking for changes

---

## 📁 File References for AI Assistants

When prompting AI assistants, reference these files for context:

### Must-Read Files
- `docs/plans/2025-12-14-deployment-setup-guides.md` - Overall project status and AI context
- `SETUP.md` - Local development setup
- `DEPLOYMENT.md` - Production deployment guide
- `COST_BREAKDOWN.md` - Cost analysis and optimization

### Key Code Files
- `prisma/schema.prisma` - Database schema (PostgreSQL)
- `src/app/layout.tsx` - Root layout and providers
- `src/app/admin/*` - Admin panel pages
- `src/app/api/orders/*` - Order API routes
- `src/components/*` - Reusable UI components
- `.env.example` - Environment variables template

### How to Reference Files

**In Cursor/Windsurf:**
```
@SETUP.md @prisma/schema.prisma Help me understand the database structure
```

**In ChatGPT/Claude:**
```
Read the file SETUP.md from my project, then help me with step 5
```

**In Gemini:**
```
I'll share the contents of SETUP.md. After reading it, help me with [task]
[paste file contents]
```

---

## 🔄 Session Continuation Prompt

**When resuming work in a new session:**

```
I'm continuing work on my crystal e-commerce platform.

Last session summary: [BRIEF SUMMARY OF WHAT YOU DID]

Current task: [WHAT YOU WANT TO WORK ON NOW]

Before proceeding:
1. Read docs/plans/2025-12-14-deployment-setup-guides.md for context
2. Review [RELEVANT FILE] for current implementation
3. Follow existing patterns and architecture

DO NOT:
- Suggest rebuilding completed features
- Propose architectural changes
- Add features I didn't request
- Change the tech stack (Next.js 15, PostgreSQL, Railway)

Let's work on: [SPECIFIC TASK]
```

---

## 💡 Pro Tips

### 1. Be Specific
✅ "Fix the email validation in the checkout form"
❌ "Fix the checkout"

### 2. Reference Docs
✅ "Follow step 7 in DEPLOYMENT.md"
❌ "Help me deploy"

### 3. State Constraints
✅ "Keep using PostgreSQL, don't suggest other databases"
❌ "What database should I use?"

### 4. One Task at a Time
✅ "Help me set up PostgreSQL locally"
❌ "Help me set up everything"

### 5. Provide Context
✅ "The Bazi calculator is in src/app/bazi/page.tsx. I want to add a print button."
❌ "Add a print button"

### 6. Use the AI Warnings
✅ Reference the "⚠️ AI Assistant Instructions" sections in the docs
❌ Ignore the warnings and let AI suggest rewrites

---

## 🚫 Red Flags (Stop the AI if you see these)

If the AI suggests any of these, **stop and redirect**:

❌ "Let's rebuild the [feature] from scratch"
❌ "I recommend switching from Railway to [other platform]"
❌ "We should use MySQL instead of PostgreSQL"
❌ "Let's refactor the entire codebase"
❌ "I'll create a new architecture"
❌ "Let's add a complex CI/CD pipeline"
❌ "We need to set up Docker/Kubernetes"
❌ "I'll add TypeScript strict mode and fix all errors"

**Instead, say:**
```
Stop. I don't want to change the architecture. Please help me with my specific task: [restate your task]
```

---

## 📞 Getting Unstuck

If the AI keeps suggesting unwanted changes:

```
STOP. Let me be more clear:

1. This project is COMPLETE and WORKING
2. I do NOT want architectural changes
3. I do NOT want to rebuild features
4. I do NOT want to change tech stack

I ONLY want: [be very specific about your one task]

Read the "AI Assistant Context" section in docs/plans/2025-12-14-deployment-setup-guides.md first.

Now, help me with JUST this specific task: [restate it clearly]
```

---

## ✅ Checklist Before Asking AI

Before you prompt an AI assistant, verify:

- [ ] I know exactly what I want (one specific task)
- [ ] I've read the relevant documentation (SETUP.md, DEPLOYMENT.md, etc.)
- [ ] I can point the AI to specific files/sections
- [ ] I've included constraints (what NOT to do)
- [ ] I've specified that features are already complete
- [ ] My prompt is specific, not vague

---

## 🎯 Template Prompt (Fill in the blanks)

```
I'm working on a crystal e-commerce platform that's already fully built.

CONTEXT:
- All features are complete (see docs/plans/2025-12-14-deployment-setup-guides.md)
- Tech stack: Next.js 15, PostgreSQL, Prisma, Railway
- Database: PostgreSQL (do NOT suggest MySQL)
- Deployment: Railway (do NOT suggest other platforms)

WHAT I NEED:
[YOUR SPECIFIC TASK - BE DETAILED]

RELEVANT FILES:
[LIST 1-3 FILES THE AI SHOULD READ]

CONSTRAINTS:
- Do NOT rebuild existing features
- Do NOT refactor working code
- Do NOT add features I didn't ask for
- Do NOT suggest architectural changes
- Follow existing code patterns
- Keep it simple

CURRENT STATUS:
[WHERE YOU ARE NOW]

ISSUE (if any):
[DESCRIBE YOUR PROBLEM]

Help me with ONLY this specific task. Don't suggest additional improvements.
```

---

## 🌟 Success Stories (Examples that Work Well)

### Example 1: Bug Fix
```
The order confirmation email isn't sending.

CONTEXT: Email logic is in src/app/api/orders/route.ts
ISSUE: createOrder function completes but email doesn't send
EXPECTED: Email should send after order is created

Help me debug why the email isn't sending. Do NOT rebuild the order system.
```

### Example 2: Feature Addition
```
Add a "Duplicate Product" button in the admin panel product list.

CONTEXT: Admin products are in src/app/admin/products/page.tsx
PATTERN: Copy the "Delete" button style and placement
BEHAVIOR: When clicked, create a copy of the product with "(Copy)" in the name

Keep it simple - just duplicate the product record. Do NOT refactor the admin panel.
```

### Example 3: Deployment Help
```
Following DEPLOYMENT.md step 8 (database migration on Railway).

Running: railway run npx prisma migrate deploy
Error: "No migration files found"

Help me troubleshoot this specific error. Do NOT suggest changing deployment platforms.
```

---

**Remember**: The key to good AI assistance is being specific, providing context, and stating clear constraints. When in doubt, reference the documentation files and be explicit about what NOT to do!
