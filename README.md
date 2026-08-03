# Majors Tracker

Abbott World Marathon Majors entry-window, qualifying-time, and charity-bib tracker.

## Run it locally

```bash
npm install
npm start
```

Opens at http://localhost:3000.

## Push to GitHub

```bash
git init
git add .
git commit -m "Majors tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/majors-tracker.git
git push -u origin main
```

## Deploy to GitHub Pages

1. In `package.json`, set `"homepage"` to your Pages URL, e.g.
   `"homepage": "https://YOUR-USERNAME.github.io/majors-tracker"`
2. Install and deploy:

   ```bash
   npm install
   npm run deploy
   ```

3. In your repo on GitHub: **Settings → Pages → Source → gh-pages branch**.
   Your site will be live at the homepage URL above within a minute or two.

## What works outside claude.ai, and what doesn't

Everything in the tracker works normally once self-hosted: the countdown clock,
the race table, qualifying times, charity minimums, and the "Apply" links.

Two features were built specifically for the Claude.ai artifact environment
and behave differently here:

- **"Check for updates"** calls the Anthropic API directly with web search to
  look for newly confirmed race dates. That call needs an API key and isn't
  meant to run from a public browser bundle, so outside claude.ai it will
  show "Update check needs a Claude-hosted environment" instead of failing
  silently. The tracker's baseline data (dated in the header) is still
  accurate as of when it was last generated — you'd just need to check the
  official race sites (linked in each row) for anything newer.
- **Persistent storage**: inside claude.ai this uses a hosted storage API;
  self-hosted, it automatically falls back to your browser's `localStorage`,
  so your data still persists between visits on the same device/browser.
