# Usman Iqbal Portfolio

Modern Next.js 15 portfolio website for Usman Iqbal / NURAXTECH. It includes a protected admin panel, editable website content, Vercel Blob media uploads, Neon PostgreSQL persistence, and a floating chatbot powered from the website data.

Admin credentials are configured through `.env.local` for development and Vercel Environment Variables for production. Never commit real credentials.

For full production setup and GitHub/Vercel commands, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Local Development

```bash
npm install
npm run dev
```

Website:

```text
http://localhost:3000
```

Admin panel:

```text
http://localhost:3000/admin1122
```

## Environment Variables

Create `.env.local` in the project root or copy `.env.example`.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_USERNAME=adminusman
ADMIN_PASSWORD=replace-with-a-strong-password
AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters

DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_replace_me

CHATBOT_API_URL=http://localhost:8000
CHATBOT_ADMIN_KEY=replace-with-a-secret-chatbot-admin-key
```

Important:

- `DATABASE_URL` should come from the Vercel Neon integration in production.
- `BLOB_READ_WRITE_TOKEN` should come from the connected Vercel Blob store.
- `ADMIN_PASSWORD` should be strong and at least 8 characters.
- `AUTH_SECRET` should be random and at least 32 characters.
- Local development can use `.data` and `data/*.json` only when `DATABASE_URL` is absent.
- Vercel production does not use local JSON files as persistent storage.

## Storage

The app automatically creates these Neon PostgreSQL tables when `DATABASE_URL` is configured:

```sql
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_data (
  data_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Persistent admin and application data is stored in Neon PostgreSQL, including website content, builder settings, pages, themes, templates, publish/version history, media metadata and Blob URLs, chatbot settings, chatbot analytics, and contact submissions.

Admin-uploaded images, documents, icons, PDFs, and supported media files are stored in Vercel Blob. The generated Blob URL and metadata are saved in Neon PostgreSQL.

## Chatbot Setup

The chatbot answers from portfolio content and does not require an OpenAI API key.

```bash
cd scripts
pip install -r requirements.txt
python train_chatbot.py
python chatbot_server.py
```

Then run the portfolio in another terminal:

```bash
npm run dev
```

The local trainer reads Neon PostgreSQL when `DATABASE_URL` is available; otherwise it reads local development JSON files.

## Verification

```bash
npm run typecheck
npm run build
```

Use Node.js 20 or 22 for production parity with Vercel.
