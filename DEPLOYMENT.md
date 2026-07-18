# GitHub and Vercel Deployment

This Next.js 15 portfolio is prepared for Vercel with Neon PostgreSQL for persistent data and Vercel Blob for uploaded media.

Use Node.js 20 or 22. The project excludes Node.js 23+ so local verification matches Vercel's supported LTS runtime.

## Production Services

Connect these in Vercel before production use:

1. Neon PostgreSQL through the Vercel Neon integration.
2. Vercel Blob for admin-uploaded images, documents, icons, PDFs, and supported media.
3. EmailJS environment variables for the contact form.
4. Optional hosted chatbot API for retraining and remote AI responses.

The app automatically creates PostgreSQL-compatible `site_content` and `app_data` tables with `CREATE TABLE IF NOT EXISTS`. Data is stored as `JSONB` with parameterized queries and `INSERT ... ON CONFLICT ... DO UPDATE`.

Vercel production must have `DATABASE_URL` for admin writes and application persistence. Local JSON fallback is only for local development when `DATABASE_URL` is absent.

## Required Vercel Environment Variables

Configure these for Production and Preview in Vercel Project Settings:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-strong-admin-password
AUTH_SECRET=your-random-secret-with-at-least-32-characters
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=generated-by-vercel
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

Optional chatbot variables:

```env
CHATBOT_API_URL=https://your-chatbot-api.example.com
CHATBOT_ADMIN_KEY=your-chatbot-admin-secret
```

Never commit `.env.local`. It is already ignored by Git.

## Vercel Neon Setup

1. Open the Vercel project.
2. Go to Storage or Integrations and connect Neon.
3. Let Vercel add `DATABASE_URL` to the project environment variables.
4. Redeploy the project.
5. Visit `/admin1122`, log in, save a small content change, and confirm it persists after refresh.

## Vercel Blob Setup

1. Open the same Vercel project.
2. Create and connect a Blob store.
3. Confirm `BLOB_READ_WRITE_TOKEN` exists in Production and Preview environment variables.
4. Redeploy.
5. Upload a small image from the admin Media Manager and confirm the media item appears in the admin panel.

Vercel server uploads are intentionally limited to 4 MB. Larger videos should be hosted externally and added by URL.

## Local Verification

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Vercel CLI Alternative

```bash
npm install -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
vercel env add AUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add NEXT_PUBLIC_EMAILJS_SERVICE_ID production
vercel env add NEXT_PUBLIC_EMAILJS_TEMPLATE_ID production
vercel env add NEXT_PUBLIC_EMAILJS_PUBLIC_KEY production
vercel --prod
```

## GitHub Push

Replace the repository URL before running:

```bash
git init
git add .
git commit -m "Migrate storage to Neon PostgreSQL"
git branch -M main
git remote add origin https://github.com/usmaniqbal-dev/YOUR_REPOSITORY.git
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/usmaniqbal-dev/YOUR_REPOSITORY.git
git push -u origin main
```
