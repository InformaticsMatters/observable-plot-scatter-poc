# GitHub Pages Deployment Setup

## What Was Added

### 1. GitHub Actions Workflow (`.github/workflows/deploy.yml`)

- Automatically builds and deploys to GitHub Pages on every push to `main`
- Can also be triggered manually from the Actions tab
- Uses pnpm for efficient dependency installation
- Builds with `pnpm run build`
- Deploys the `dist` folder to GitHub Pages

### 2. Vite Configuration Update (`vite.config.ts`)

- Added `base: "/observable-plot-scatter-poc/"` for correct asset paths on GitHub Pages
- This ensures all JavaScript, CSS, and other assets load correctly from the subdirectory

### 3. Jekyll Bypass (`public/.nojekyll`)

- Empty file that tells GitHub Pages not to process the site with Jekyll
- Ensures files starting with underscores (like Vite's `_assets/`) are served correctly

## Manual Steps Required on GitHub

### One-Time Setup (Required)

1. **Go to Repository Settings**

   - Navigate to: https://github.com/InformaticsMatters/observable-plot-scatter-poc/settings/pages

2. **Configure GitHub Pages**

   - Under "Build and deployment"
   - **Source**: Select "**GitHub Actions**" from the dropdown
   - (Don't select "Deploy from a branch" - we want to use the Actions workflow)

3. **Wait for First Deployment**

   - Push these changes to the `main` branch
   - Go to the **Actions** tab to watch the deployment progress
   - First deployment takes 2-3 minutes

4. **Access Your Site**
   - Once deployed, your app will be available at:
   - https://informaticsmatters.github.io/observable-plot-scatter-poc/

### That's It!

After the initial setup, every push to `main` will automatically trigger a new deployment. No further manual steps needed.

## Optional: Manual Deployment

You can trigger a deployment manually without pushing code:

1. Go to **Actions** tab: https://github.com/InformaticsMatters/observable-plot-scatter-poc/actions
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the `main` branch and click "Run workflow"

## Troubleshooting

### If deployment fails:

- Check the Actions tab for error logs
- Ensure the repository has Pages enabled in Settings
- Verify that Actions have write permissions (Settings → Actions → General → Workflow permissions)

### If site loads but shows 404:

- Verify the `base` path in `vite.config.ts` matches your repository name
- Check that all files are in the `dist` folder after build

### To test locally before deploying:

```sh
pnpm run build
pnpm run preview
```

This simulates the production build with the correct base path.
