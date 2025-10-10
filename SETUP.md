# Setup Guide

## Environment Variables

This project uses environment variables to configure sensitive information like API keys.

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.development
   ```

2. Edit `.env.development` and add your OpenAI API key:
   ```bash
   VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. Get your OpenAI API key from: https://platform.openai.com/api-keys

**Note:** The `.env.development` file is ignored by git and should never be committed to the repository.

### GitHub Pages Deployment (Production)

The production build uses GitHub Secrets to securely inject the API key during deployment.

#### Setup GitHub Secret:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
5. Click **Add secret**

The GitHub Actions workflow (`.github/workflows/static.yml`) will automatically inject this secret during the build process.

### Security Notes

⚠️ **IMPORTANT**:
- **Never commit `.env.development` or `.env.production`** - These files are in `.gitignore`
- Only `.env.example` should be committed (with placeholder values)
- The `.env.development` and `.env.production` files must be created locally and are not tracked by git
- Production API keys are injected at build time from GitHub Secrets
- Each developer should create their own `.env.development` with their personal API key

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE_PATH` | Base path for deployment (e.g., `/site-padely/`) | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for match announcements | Yes |

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (uses .env.production)
npm run build

# Preview production build
npm run preview
```

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

The deployment workflow:
1. Checks out the code
2. Installs dependencies
3. Builds the project (injecting `OPENAI_API_KEY` from GitHub Secrets)
4. Deploys to GitHub Pages

No manual deployment steps required! ✨
