# Slack File Watcher

Watches a local folder for new or updated files and sends them to your Slack App Home. Markdown files (`.md`) are automatically converted to PDF before upload.

## Setup

### 1. Create the Slack app

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From a manifest**
2. Paste the contents of `manifest.json` and create the app
3. Go to **Install App** → install to your workspace → copy the **Bot User OAuth Token** (`xoxb-...`)

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

| Variable          | Description                                                       |
|-------------------|-------------------------------------------------------------------|
| `SLACK_BOT_TOKEN` | Bot OAuth token from step 1                                       |
| `SLACK_USER_ID`   | Your Slack user ID — find it via **Profile → ⋯ → Copy member ID** |
| `WATCH_PATH`      | Absolute path to the folder to watch                              |
| `WATCH_PATTERNS`  | Comma-separated globs, e.g. `*.pdf,*.txt,*.md`                    |
| `DEBOUNCE_MS`     | Wait time before uploading after last change (default: `60000`)   |
| `SLACK_MESSAGE`   | Prefix shown in the Slack message                                 |


### 3. Run

```bash
bash run.sh
```

Files matching `WATCH_PATTERNS` that are added or changed under `WATCH_PATH` will appear in the **Messages** tab of the File Watcher app in Slack after the debounce period.

## Notes

- `.md` files require `pandoc` and `pdflatex` to be installed (`apt install pandoc texlive-latex-base`)
- Pre-existing files are ignored on startup — only changes made after the watcher starts trigger uploads
- If a file is modified multiple times within the debounce window, only one upload is sent

