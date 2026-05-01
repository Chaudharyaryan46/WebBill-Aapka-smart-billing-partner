# 🚀 Going Live with BillEasy

This guide explains how to deploy the **BillEasy SaaS** to the internet while keeping local hardware printing functional.

## 1. Deploy the Frontend (Cloud)
The frontend is built with Next.js and is ready for **Vercel**.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Vercel will automatically detect Next.js and deploy it.
4. You will get a live URL like `https://bill-easy.vercel.app`.

---

## 2. Make the Local Print Agent Accessible
Since your browser is now on `https`, it cannot directly talk to `http://localhost:3001` (Blocked by Mixed Content policies). You have two options:

### Option A: Use a Tunnel (Recommended for Live Demo)
Use `ngrok` to give your local agent a public HTTPS URL.

1. Install ngrok: `npm install -g ngrok`
2. Run ngrok: `ngrok http 3001`
3. Copy the `https://xxxx.ngrok-free.app` URL.
4. In the **BillEasy Web App** -> **Settings**, paste this URL.

### Option B: Local Network Usage
If you are using the app within a shop's local network:
1. Open the app on `http` (not `https`) if possible.
2. Use the local IP of the machine running the agent (e.g., `http://192.168.1.10:3001`).

---

## 3. Production Hardening
Before using this in a real shop:
- **Auth**: Add Clerk or NextAuth to protect the `/` route.
- **Database**: Replace `localStorage` with a real database like **Supabase** or **PostgreSQL**.
- **Security**: Add an API Key to the Print Agent so only your frontend can trigger prints.

---

## 🛠️ Tech Stack Used
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion.
- **Agent**: Node.js, Express, ESC/POS, Pino (Logging).
- **Storage**: LocalStorage (Mocking Cloud Sync).
