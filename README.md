# NIRF TLR Assessment Platform

A professional assessment tool for testing new joinees on NIRF's Teaching, Learning & Resources (TLR) parameter. Scores are automatically emailed to the trainer on completion.

---

## Project Structure

```
nirf-assessment/
├── server.js          ← Node.js backend (Express + Nodemailer)
├── package.json
├── .env               ← Your credentials (never commit this)
└── public/
    └── index.html     ← The assessment frontend
```

---

## Setup (5 minutes)

### Step 1 — Install dependencies
```bash
cd nirf-assessment
npm install
```

### Step 2 — Generate a Gmail App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in → Select app: **Mail** → Select device: **Other (custom name)** → name it "NIRF Assessment"
3. Click **Generate** → copy the 16-character password

> **Important:** This only works if 2-Step Verification is enabled on your Google account.

### Step 3 — Configure your .env file
Edit `.env` and fill in:
```
GMAIL_USER=akhilsribhasyam@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← your 16-char app password
TRAINER_EMAIL=akhilsribhasyam@gmail.com
PORT=3000
```

### Step 4 — Start the server
```bash
npm start
```
You should see:
```
  NIRF Assessment Backend running
  → http://localhost:3000
```

### Step 5 — Open the assessment
Open your browser and go to:
```
http://localhost:3000
```

That's it. The `public/index.html` is served automatically by the backend.

---

## How It Works

1. Participant opens `http://localhost:3000`
2. Enters their name → takes 15 questions with a 30-second timer each
3. Sees their score, grade, and category breakdown
4. Clicks **"Send Score Sheet to Trainer"**
5. Backend sends a professional HTML email to `akhilsribhasyam@gmail.com`

---

## Deploying Online (optional)

To share with participants over the internet (instead of local network):

**Option A — Railway (free, easiest)**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Then set your environment variables in the Railway dashboard.

**Option B — Render (free tier)**
- Push this folder to a GitHub repo
- Connect it to [render.com](https://render.com)
- Add the env variables in the Render dashboard
- Set start command: `node server.js`

After deploying, update this line in `public/index.html`:
```js
const BACKEND_URL = 'https://your-app-url.railway.app/submit-score';
```

---

## Email Preview

Each participant gets a professional score sheet emailed to you with:
- Name and timestamp
- Score percentage with colour-coded grade
- Bar chart breakdown by Conceptual / Calculation / Applied
- TLR sub-component reference table

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `Invalid login` error | Check Gmail App Password in `.env` |
| Email not received | Check spam folder; verify `TRAINER_EMAIL` |
| Port 3000 in use | Change `PORT=3001` in `.env` |
| CORS error in browser | Set `ALLOWED_ORIGIN=*` in `.env` |
