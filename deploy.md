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

## 2) Local development commands

### Start the backend

```bash
cd server
npm install
npm run dev
```

### Start the frontend

```bash
cd client
npm install
npm run dev
```

### Run both at the same time

From the root folder, open two terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Check backend health:

```bash
curl http://localhost:5000/api/health
```

---

## 3) Deploy the backend to Render

### Create the backend service

1. Go to https://render.com
2. Sign in and click New + > Web Service
3. Connect your GitHub repo
4. In the service settings:
   - Name: `college-complaints-server`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

### Environment variables on Render

Add these values in the Render dashboard:

```env
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-vercel-app-url.vercel.app
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=replace_with_32_char_key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/college-complaints
```

### Notes

- For local development, the app can work with a local MongoDB instance or fallback configuration.
- For production, use MongoDB Atlas for persistent storage.
- Health endpoint example:

```text
https://your-render-service.onrender.com/api/health
```

---

## 4) Deploy the frontend to Vercel

### Create the frontend project

1. Go to https://vercel.com
2. Sign in and click Add New Project
3. Import the GitHub repository
4. In the project settings:
   - Root Directory: `client`
   - Framework Preset: `Next.js`
   - Build Command: `npm install && npm run build`

### Environment variables on Vercel

Add the following variables:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-render-service.onrender.com
```

### Deploy

1. Click Deploy
2. Wait for the build to finish
3. Copy the live Vercel URL
4. Update `CLIENT_URL` in the Render backend to the live frontend URL

Example:

```env
CLIENT_URL=https://college-complaints-client.vercel.app
```

---

## 5) Final connectivity check

After both services are live:

1. Open the Vercel frontend URL
2. Register a student or admin account
3. Submit a test complaint
4. Log in as admin and update the complaint status
5. Confirm that the frontend can call the backend correctly

---

## 6) Recommended production setup

For a production-ready college system, use:

- Render for the backend API server
- Vercel for the frontend UI
- MongoDB Atlas for persistent complaint storage
- Secure secret management in Render and Vercel environment variables

---

## 7) Common issues

### Frontend cannot call backend
- Check `NEXT_PUBLIC_API_URL`
- Confirm CORS is allowed
- Verify the Render service is running

### Backend not starting
- Check logs in Render
- Confirm all required environment variables are set
- Verify MongoDB connection is available

---

This setup gives you a clean deployment pattern for a college complaint management system using a Node backend and Next.js frontend.
