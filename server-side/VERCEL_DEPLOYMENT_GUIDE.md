# Deploying Server-Side to Vercel

This Express backend is configured as a Vercel Serverless Function.

## Files Configured
- **`vercel.json`**: Routes incoming HTTP requests into the serverless entrypoint.
- **`api/index.js`**: Serverless function handler exporting the Express `app`.
- **`index.js`**:
  - Global MongoDB connection caching (preventing connection exhaustion across serverless lambda cold/warm invocations).
  - DB initialization middleware (guaranteeing MongoDB collections are ready before route queries execute).
  - Permissive CORS handling (supports cross-origin requests & preflight OPTIONS).
  - Dynamic execution: Runs `app.listen()` when started locally, and exports `app` when running in Vercel.
- **`.env.example`**: Reference template for environment variables.

---

## Deployment Option 1: Vercel Dashboard (Recommended)

1. Push your changes to your Git repository (GitHub / GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository (`donor-search`).
4. In the **Configure Project** screen:
   - **Framework Preset**: Select **Other**.
   - **Root Directory**: Click **Edit** and choose `server-side`. *(Crucial!)*
5. Open **Environment Variables** and add the following keys from your `.env`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `DB_NAME`: Your database name (e.g. `myDatabase`).
   - `ADMIN_NAME`: Admin username (e.g. `admin`).
   - `ADMIN_EMAIL`: Admin email (e.g. `admin@gmail.com`).
   - `ADMIN_PASSWORD`: Admin password.
6. Click **Deploy**.

---

## Deployment Option 2: Vercel CLI

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. Navigate to the `server-side` folder:
   ```bash
   cd server-side
   ```
3. Run the deploy command:
   ```bash
   vercel
   ```
4. Follow the interactive prompts (deploy current directory `.` as project root).
5. Add your environment variables when prompted or via the Vercel dashboard.
6. For production release:
   ```bash
   vercel --prod
   ```

---

## Testing Your Deployed API
- **Health Check**: `https://<your-project>.vercel.app/`
- **Donors API**: `https://<your-project>.vercel.app/api/donors`
- **Users**: `https://<your-project>.vercel.app/users`
