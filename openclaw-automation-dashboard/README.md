# ZeekHQ - OpenClaw Automation Dashboard

A web dashboard for managing OpenClaw cron jobs and monitoring system status.

## Features

- View all OpenClaw cron jobs in real-time
- Enable/disable jobs
- Run jobs manually 
- Monitor gateway status
- Activity log

## Setup

1. **Install dependencies:**
   ```bash
   cd openclaw-automation-dashboard
   npm install
   ```

2. **Start the API bridge:**
   ```bash
   npm start
   ```

3. **Open the dashboard:**
   - Open `index.html` in your browser
   - Or serve it via a local server for development

## How It Works

The dashboard connects to the real OpenClaw CLI through a Node.js API bridge:

- **Frontend**: HTML/CSS/JavaScript dashboard
- **API Bridge**: Node.js server (`api-bridge.js`) that calls OpenClaw CLI
- **OpenClaw CLI**: The actual cron job management

## API Endpoints

- `GET /api/cron/jobs` - List all cron jobs
- `GET /api/gateway/status` - Check gateway status  
- `POST /api/cron/jobs/:id/toggle` - Enable/disable job
- `POST /api/cron/jobs/:id/run` - Run job immediately

## Current Jobs

The dashboard shows your actual OpenClaw cron jobs:

1. **BuffiBot data segmentation engineering follow-up** (disabled)
2. **BTC $90k Alert** (every 30m)
3. **Evening Standup** (daily at 6 PM)
4. **Morning Standup** (daily at 8 AM)

## Creating New Jobs

Use the OpenClaw CLI to create new jobs:

```bash
openclaw cron add --name "My Job" --schedule "0 9 * * *" --command "echo hello"
```

The dashboard will automatically show new jobs after refresh.