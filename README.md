# Usman Iqbal Portfolio

Admin credentials are configured through `.env.local` for development and Vercel Environment Variables for production. Never commit real credentials.

Modern portfolio website for Usman Iqbal / NURAXTECH. It includes an admin panel, editable website content, MySQL support, and a floating chatbot that answers from the website data only.

For production setup, GitHub CI, Vercel Blob, and deployment commands, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 1. Project Run Karna

```bash
npm install
npm run dev
```

Website open karein:

```text
http://localhost:3000
```

Admin panel:

```text
http://localhost:3000/admin1122
```

## 2. Environment File Banana

Project root mein `.env.local` file banayein ya `.env.example` copy karein.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_USERNAME=adminusman
ADMIN_PASSWORD=replace-with-a-strong-password
AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=usman_portfolio

CHATBOT_API_URL=http://localhost:8000
CHATBOT_ADMIN_KEY=replace-with-a-secret-chatbot-admin-key
```

Important:

- `ADMIN_PASSWORD` kam az kam 8 characters ka hona chahiye.
- `AUTH_SECRET` kam az kam 32 characters ka strong random text hona chahiye.
- Chatbot ke liye kisi OpenAI ya external AI API key ki zaroorat nahi hai.

## 3. MySQL Database Connect Karna

### Step 1: MySQL install/start karein

Apne system mein MySQL Server start hona chahiye. Local development ke liye default host usually `localhost` aur port `3306` hota hai.

### Step 2: Database aur tables create karein

Project root se ye command run karein:

```bash
mysql -u root -p < scripts/schema.sql
```

Password poocha jaye to apna MySQL root password enter karein. Agar root password blank hai to sirf Enter press karein.

### Step 3: `.env.local` mein MySQL details match karein

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=usman_portfolio
```

### Step 4: Website restart karein

`.env.local` change karne ke baad development server restart karein:

```bash
npm run dev
```

Jab `MYSQL_HOST`, `MYSQL_USER`, aur `MYSQL_DATABASE` set honge to website editable content MySQL mein save karegi. Agar MySQL config missing ho to website local `.data/site-content.json` fallback use karegi.

## 4. Chatbot Setup

Chatbot website ke apne content, admin content, `.data` JSON files, aur MySQL data se train hota hai. Ismein external AI API key use nahi hoti.

### Step 1: Python dependencies install karein

```bash
cd scripts
pip install -r requirements.txt
```

### Step 2: Chatbot train karein

```bash
python train_chatbot.py
```

Ye command `data/knowledge-base.json` aur `data/embeddings.pkl` generate karegi.

### Step 3: Chatbot server start karein

```bash
python chatbot_server.py
```

Server default URL:

```text
http://localhost:8000
```

### Step 4: Next.js website bhi running honi chahiye

Dusre terminal mein:

```bash
npm run dev
```

Chatbot user panel mein side par neechy floating button ki form mein show hota hai. User us par click karke website ki skills, services, projects, contact, about, experience, aur available content ke baare mein puch sakta hai.

## 5. Chatbot Retrain Kab Karna Hai

Jab bhi admin panel se content update karein, projects/services/skills change karein, ya MySQL data update ho, chatbot ko dobara train karein:

```bash
cd scripts
python train_chatbot.py
```

Admin chatbot page se bhi retrain kiya ja sakta hai:

```text
http://localhost:3000/admin/chatbot
```

Iske liye `.env.local` mein `CHATBOT_ADMIN_KEY` aur running Python chatbot server required hai.

## 6. Production

```bash
npm run build
npm run start
```

Production mein:

- `NEXT_PUBLIC_SITE_URL` ko live domain par set karein.
- `ADMIN_PASSWORD`, `AUTH_SECRET`, `MYSQL_PASSWORD`, aur `CHATBOT_ADMIN_KEY` strong rakhein.
- MySQL database ka backup schedule zaroor rakhein.




admin pannel men kuch changin karni hy 
ye buttons Must hony chahiyen
Dashboard
Edit Website
Page Manager
Theme Manager
Setting 
Publish Manager
Logout 
jo ky already hen aur in men kuch bhi change nai hona chahiye bilkul kuch bhi change na ho just ye buttons aur inki functionalites delete kar do sirf ye neechy waly hi buttons aur 
Content Manager
Page Manager
Template Manager
AI Tools
Media Manager 
