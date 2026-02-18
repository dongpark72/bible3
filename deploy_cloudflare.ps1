$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "Executing D1 Schema..."
npx wrangler d1 execute bible-db --file=workers/schema.sql --remote -y
Write-Host "Deploying to Cloudflare..."
npx wrangler deploy --yes
