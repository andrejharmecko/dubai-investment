# Setup Instructions

Run these commands in your terminal from the `dubai-investment-app` folder:

## 1. Initialize Git & Create GitHub Repo

```bash
cd dubai-investment-app
git init
git add .
git commit -m "Initial commit: Dubai investment dashboard"

# Create GitHub repo and push (requires gh CLI: brew install gh)
gh repo create dubai-investment --public --source=. --push
```

## 2. Install & Run Locally

```bash
npm install
npm run dev
```

## 3. Deploy to Vercel (free, one command)

```bash
npx vercel
```

That's it — you'll get a live URL like https://dubai-investment.vercel.app
