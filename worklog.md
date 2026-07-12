---
Task ID: 1
Agent: Main Agent
Task: Set up, fix, and verify the ZERO Landing project (full-stack Vite+React+Express+Prisma)

Work Log:
- Extracted zero-landing-source-final.zip to /home/z/my-project/zero-landing
- Installed frontend dependencies (npm install) — 224 packages
- Installed server dependencies (cd server && npm install) — 176 packages
- Generated Prisma client (npx prisma generate)
- Pushed database schema (npx prisma db push) — SQLite
- Seeded database with admin user, 4 demo users, 7 projects, 6 blog posts, 5 testimonials, 6 FAQ items, 6 services, 4 link masks
- Fixed start-dev.sh: replaced hardcoded absolute paths with dynamic SCRIPT_DIR resolution
- Fixed server/.env: changed DATABASE_URL from absolute path to relative (file:./dev.db)
- Cleaned up .gitignore: removed redundant prisma/dev.db entries
- Verified frontend build: vite build → success (4.35s, all chunks generated)
- Verified server type check: tsc --noEmit → success (no errors)
- Verified API endpoints: health, stats, services, blog, login — all working
- Verified Vite proxy to API — working

Stage Summary:
- Project is fully functional: frontend builds cleanly, server compiles without errors
- Database is set up and seeded with realistic data
- All API endpoints return correct data
- Login/authentication works (admin + demo users)
- Fixed path issues in start-dev.sh and .env for portability
- Project is ready for GitHub push (user will give the go-ahead)