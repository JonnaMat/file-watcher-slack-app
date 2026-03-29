<div align="center">
  <img src="docs/assets/file-watcher-logo.png" width="100px" alt="File Watcher Slack Bot" />
  <h1 style="font-size: 28px; margin: 10px 0;">File Watcher for Slack</h1>
  <p>Watch local files, get them delivered to your Slack DM — instantly.</p>
</div>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://nodejs.org/">
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-green.svg" />
  </a>
  <a href="https://api.slack.com/">
    <img alt="Slack API" src="https://img.shields.io/badge/Slack%20API-latest-blue.svg" />
  </a>
</p>

---

## ✨ What does it do?

A lightweight Node.js daemon that watches a local directory (including mounted cloud storage like Google Cloud Storage buckets) and automatically uploads new or changed files directly to your Slack DM. Access your AI agent outputs — `plan.md`, `final-report.pdf`, plots, and more — from your phone without needing VPN access to your workstation.

---

## 📸 Demo

> **Slack DM with uploaded files**

```
┌─────────────────────────────────────────┐
│ 🤖 file-watcher-bot                     │
│                                         │
│ 📎 final-report.pdf                     │
│    New file detected by File Watcher    │
│    /gcs/bucket/agents/output/...        │
│    [View] [Download]                    │
│                                         │
│ 📄 plan.md → PDF                        │
│    New file detected by File Watcher    │
│    /gcs/bucket/agents/output/...        │
│    [View] [Download]                    │
└─────────────────────────────────────────┘
```

---

## 🎯 Use Cases

> **🤖 AI Agent Outputs:** Your AI agents write `plan.md`, `final-report.md`, generate plots, and more to a watched folder. Files appear in Slack instantly — read and inspect results from your phone.
>
> **📱 Remote Access:** Mount Google Cloud Storage (or any cloud bucket) locally, then get files delivered to Slack. No VPN or remote desktop needed.
>
> **📥 Automated Workflows:** AI pipelines, data exports, or scheduled reports land in your Slack DM the moment they're ready.

### Available Now

| Feature                           | Description                                                                                  |
|-----------------------------------|----------------------------------------------------------------------------------------------|
| **📡 Real-time file watching**   | Detects new and modified files instantly using chokidar                                      |
| **📄 Auto Markdown → PDF**        | Seamlessly converts `.md` files to PDFs via pandoc                                           |
| **💬 Direct to Slack DM**         | Files land in your App Home direct message                                                   |
| **🔁 Smart debouncing**           | Batches rapid file changes to avoid spam                                                    |
| **⚙️ Flexible glob patterns**     | Watch exactly the files you need (`*.pdf`, `*.doc`, etc.)                                    |
| **🔒 Graceful shutdown**         | Clean startup and shutdown handling                                                          |
| **🔁 Retry with backoff**        | Automatic retry on transient upload failures                                                 |

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18
- **pandoc** and **pdflatex** (for Markdown → PDF conversion)
- A **Slack App** with a Bot Token

```bash
# Install pandoc (macOS)
brew install pandoc
brew install --cask mactex

# Install pandoc (Ubuntu/Debian)
sudo apt install pandoc texlive-latex-base
```

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**
2. Choose **From an app manifest**
3. Select your workspace and paste the contents of [`manifest.json`](manifest.json)
4. Navigate to **Basic Information** → **App Icon** and upload `docs/assets/file-watcher-logo.png` as the icon.
5. Install the app to your workspace and copy the **Bot User OAuth Token** (`xoxb-...`)


### 2. Get your Slack User ID

- Click your Slack profile → **Copy member ID**, or
- Use the [Slack API explorer](https://api.slack.com/methods/users.identity) to look up your user ID

### 3. Clone and configure

```bash
git clone https://github.com/your-username/file-watcher-slack-app.git
cd file-watcher-slack-app
cp .env.example .env
```

Edit `.env`:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_USER_ID=U0123456789
WATCH_PATH=/path/to/your/folder
WATCH_PATTERNS=*.pdf,*.md,*.txt
DEBOUNCE_MS=60000
SLACK_MESSAGE=New file detected by File Watcher
```

### 4. Install and run

```bash
npm install
npm start
```

> **Tip:** Run in the background with `tmux` or `screen`, or use a process manager like `pm2`.

---

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `SLACK_BOT_TOKEN` | ✅ | — | Bot OAuth token (`xoxb-...`) from your Slack app |
| `SLACK_USER_ID` | ✅ | — | Your Slack member ID to receive uploads |
| `WATCH_PATH` | ✅ | — | Absolute path to the folder to watch |
| `WATCH_PATTERNS` | ✅ | — | Comma-separated glob patterns (e.g., `*.pdf,*.png`) |
| `DEBOUNCE_MS` | ❌ | `60000` | Milliseconds to wait after last change before uploading |
| `SLACK_MESSAGE` | ❌ | `"New file detected by File Watcher"` | Message prefix for uploads |

### Glob Pattern Tips

Patterns are normalized automatically — no need for full `**/*.` prefix:

| You write | Interpreted as |
|---|---|
| `pdf` | `**/*.pdf` |
| `.md` | `**/*.md` |
| `*.pdf,*.png` | `**/*.pdf`, `**/*.png` |
| `**/*.md` | `**/*.md` *(unchanged)* |

---

## 🔧 Project Structure

```
file-watcher-slack-app/
├── src/
│   ├── index.js      # Entry point, graceful shutdown
│   ├── watcher.js    # File watching (chokidar)
│   ├── uploader.js   # Slack API file upload
│   ├── converter.js  # Markdown → PDF (pandoc)
│   ├── debouncer.js  # Event debouncing
│   ├── config.js     # Env validation
│   └── logger.js     # Timestamped console logging
├── manifest.json     # Slack app manifest
├── .env.example      # Config template
├── run.sh            # Convenience startup script
└── package.json
```

---

## 🛤️ Coming Features

| Feature                                                                           | Status        |
|-----------------------------------------------------------------------------------|---------------|
| **Web dashboard** — Monitor watched files and upload history in real-time        | 🏗️ Planned   |
| **Channel selection** — Upload to channels, not just DMs                         | 🏗️ Planned   |
| **Custom triggers** — Slack slash commands to pause/resume watching              | 🏗️ Planned   |

Want a feature? [Open an issue](https://github.com/your-username/file-watcher-slack-app/issues/new)!

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Development Setup

```bash
# Clone and set up
git clone https://github.com/your-username/file-watcher-slack-app.git
cd file-watcher-slack-app
npm install
```

### Workflow

1. **Fork** the repository and create a branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Follow the existing code style.

3. **Test any new functionality.**

4. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add your feature name"
   ```

5. **Push** and open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [chokidar](https://github.com/paulmillr/chokidar) — Fantastic file watching
- [pandoc](https://pandoc.org/) — Universal document converter
- [Slack API](https://api.slack.com/docs) — For making this integration possible
