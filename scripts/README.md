# Portfolio Chatbot Setup

This folder contains the local training pipeline and FastAPI server for the portfolio chatbot. The chatbot answers from the website knowledge base only and does not need an OpenAI or external AI API key.

## Setup

1. Open a terminal in the project root.
2. Install Python dependencies:

```bash
cd scripts
pip install -r requirements.txt
```

3. Train the chatbot knowledge base and embeddings:

```bash
python train_chatbot.py
```

4. Start the Python chatbot server:

```bash
python chatbot_server.py
```

5. In another terminal, start the Next.js portfolio:

```bash
npm run dev
```

6. Open the chatbot admin page:

```text
http://localhost:3000/admin/chatbot
```

## Required Environment Variables

Set these in `.env.local` from the project root:

```env
CHATBOT_API_URL=http://localhost:8000
CHATBOT_ADMIN_KEY=your_secret_admin_key

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=usman_portfolio
```

MySQL variables are optional for local testing, but required if you want the chatbot to train from database content.

## Retraining

Retrain whenever portfolio content, FAQs, or custom Q&A changes:

```bash
cd scripts
python train_chatbot.py
```

You can also use the **Retrain AI** button from `/admin/chatbot` while the Python server is running.
