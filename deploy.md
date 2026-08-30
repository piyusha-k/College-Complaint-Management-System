# Deployment Guide

This project is split into two deployable apps:

- Backend: Node.js + Express on Render
- Frontend: Next.js on Vercel

Before pushing to GitHub, make sure the project root contains the .gitignore file so environment files and build output are not committed.

---

## 1) Prepare the repository

1. Make sure all project folders are in the repo root:
   - `client/`
   - `server/`
   - `.gitignore`
2. Commit the repo normally:
   ```bash
   git add .
   git commit -m "Initial project setup"
   ```
3. Create a GitHub repository and push:
   ```bash
   git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
   ```

---

## 2) Deploy the backend to Render

### Create the backend service

1. Go to https://render.com
2. Sign in and click New + > Web Service
3. Connect your GitHub repo
4. In the service settings:
   - Name: `agentflow-server`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

### Environment variables on Render

Add these variables in the Render dashboard under Environment:

```env
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-vercel-app-url.vercel.app
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=replace_with_32_char_key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agentflow
REDIS_URL=redis://default:password@host:port
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=https://your-render-service.onrender.com/api/integrations/oauth/gmail/callback
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=https://your-render-service.onrender.com/api/integrations/oauth/slack/callback
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://your-render-service.onrender.com/api/integrations/oauth/discord/callback
GOOGLE_SHEETS_CLIENT_ID=
GOOGLE_SHEETS_CLIENT_SECRET=
GOOGLE_SHEETS_REDIRECT_URI=https://your-render-service.onrender.com/api/integrations/oauth/google-sheets/callback
```

### Notes

- If you do not provide MongoDB and Redis, the app can fall back to in-memory services for development, but for production you should use managed services like:
  - MongoDB Atlas
  - Redis Cloud or Render Redis
- The app health endpoint is available at:
  ```text
  https://your-render-service.onrender.com/api/health
  ```

---

## 3) Deploy the frontend to Vercel

### Create the frontend project

1. Go to https://vercel.com
2. Sign in and click Add New Project
3. Import the GitHub repo
4. In the project settings:
   - Root Directory: `client`
   - Framework Preset: `Next.js`
   - Build Command: leave default or use `npm install && npm run build`

### Environment variables on Vercel

Add these variables in Vercel project settings:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-render-service.onrender.com
```

### Deploy

1. Click Deploy
2. Wait for the build to finish
3. After deployment, copy the Vercel app URL
4. Update `CLIENT_URL` in the Render backend to match the live frontend URL

Example:
```env
CLIENT_URL=https://agentflow-client.vercel.app
```

---

## 4) Final app connectivity check

After both services are live:

1. Open the Vercel frontend URL
2. Log in with a seeded account or register a new one
3. Confirm the frontend reaches the backend API
4. Test the health endpoint:
   ```bash
   curl https://your-render-service.onrender.com/api/health
   ```

Expected response should include a JSON object with `status: "healthy"`.

---

## 5) Recommended production setup

For a production-ready deployment, use:

- Render for the backend API service
- Vercel for the frontend UI
- MongoDB Atlas for persistent database storage
- Redis Cloud or Render Redis for background job queue
- Secure secrets stored in Render and Vercel environment variables

---

## 6) Useful commands

Local backend:
```bash
cd server
npm install
npm run dev
```

Local frontend:
```bash
cd client
npm install
npm run dev
```

---

## 7) Common production issues

### Frontend cannot call backend
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Ensure the Render backend is not using a private URL only
- Confirm CORS is allowed for the Vercel domain

### Backend not starting
- Check Render logs
- Confirm all required env vars are present
- Verify the app can access MongoDB and Redis

### OAuth integrations fail
- Update redirect URIs in Google / Slack / Discord settings
- Use the live Render service URL, not localhost

---

This setup gives you a clean production deployment pattern for a Node backend and a Next.js frontend using Render and Vercel.
