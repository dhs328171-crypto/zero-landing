#!/bin/bash
cd /home/z/my-project/zero-landing-v4/server
export DATABASE_URL="file:/home/z/my-project/zero-landing-v4/server/dev.db"
export PORT=3001
exec npx tsx src/index.ts
