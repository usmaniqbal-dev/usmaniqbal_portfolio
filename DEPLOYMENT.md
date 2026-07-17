# GitHub and Vercel Deployment

This portfolio is configured for zero-config Next.js deployment on Vercel.

Use Node.js 20 or 22. The project intentionally excludes Node.js 23+ because the current Next.js 15 toolchain is verified against the Vercel-supported LTS line.

## Production services

Before the production deployment, connect:

1. A managed MySQL database for persistent admin, builder, chatbot settings, and version history.
2. A public Vercel Blob store for admin media uploads.
3. EmailJS environment variables for the contact form.
4. Optionally, a separately hosted chatbot API for AI responses and retraining.

The app automatically creates the `site_content` and `app_data` MySQL tables. The database user must have permission to create tables on the first request.

## Required Vercel environment variables

Configure these for Production and Preview in Vercel Project Settings:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-strong-admin-password
AUTH_SECRET=your-random-secret-with-at-least-32-characters
DATABASE_URL=mysql://user:password@host:3306/database?ssl-mode=REQUIRED
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

Connecting a Vercel Blob store automatically supplies:

```env
BLOB_READ_WRITE_TOKEN=generated-by-vercel
```

Optional chatbot variables:

```env
CHATBOT_API_URL=https://your-chatbot-api.example.com
CHATBOT_ADMIN_KEY=your-chatbot-admin-secret
```

Never commit `.env.local`. It is already ignored by Git.

## Vercel dashboard deployment

1. Push the repository to GitHub.
2. In Vercel, select **Add New > Project** and import the GitHub repository.
3. Keep the detected framework as **Next.js** and the build command as `npm run build`.
4. Add the environment variables above.
5. Under **Storage**, create and connect a public Blob store.
6. Deploy, then visit `/admin1122` and verify login, publishing, and a small media upload.

Vercel server uploads are intentionally limited to 4 MB. Larger videos should be uploaded directly to an external media service and added by URL.

## Local verification

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

## GitHub push

Replace the repository URL before running:

```bash
git init
git add .
git commit -m "Prepare portfolio for production deployment"
git branch -M main
git remote add origin https://github.com/usmaniqbal-dev/YOUR_REPOSITORY.git
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/usmaniqbal-dev/YOUR_REPOSITORY.git
git push -u origin main
```

## Vercel CLI alternative

```bash
npm install -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
vercel env add AUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_EMAILJS_SERVICE_ID production
vercel env add NEXT_PUBLIC_EMAILJS_TEMPLATE_ID production
vercel env add NEXT_PUBLIC_EMAILJS_PUBLIC_KEY production
vercel --prod
```
https://github.com/usmaniqbal-dev