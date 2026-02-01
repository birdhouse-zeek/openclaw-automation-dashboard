# OpenClaw Automation Dashboard

A clean, responsive web dashboard for managing OpenClaw automation and cron jobs.

![Dashboard Preview](https://via.placeholder.com/800x400/2563eb/ffffff?text=Dashboard+Preview)

## Features

- **Real-time System Status**: Monitor OpenClaw gateway and automation health
- **Cron Job Management**: View, create, edit, and delete cron jobs through a clean UI
- **Activity Monitoring**: Track recent automation activity and system changes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Simple Tech Stack**: Pure HTML/CSS/JavaScript - no complex build process

## Quick Start

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Your dashboard will be live at `https://yourusername.github.io/openclaw-automation-dashboard`

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/openclaw-automation-dashboard.git
   cd openclaw-automation-dashboard
   ```

2. Serve locally (any HTTP server works):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (if available)
   npx serve .
   
   # Or just open index.html in your browser
   ```

3. Open `http://localhost:8000` in your browser

## Configuration

### API Endpoints

The dashboard automatically detects the environment:
- **Local development**: Uses `http://localhost:3000` for OpenClaw API
- **Production**: Uses `https://api.openclaw.dev` for API calls

To customize the API endpoint, edit the `apiBase` configuration in `app.js`:

```javascript
this.apiBase = 'https://your-openclaw-instance.com';
```

### OpenClaw Integration

This dashboard is designed to integrate with OpenClaw's REST API. The expected endpoints are:

- `GET /api/gateway/status` - Gateway health status
- `GET /api/cron/jobs` - List all cron jobs
- `POST /api/cron/jobs` - Create new cron job
- `PUT /api/cron/jobs/{id}` - Update existing job
- `DELETE /api/cron/jobs/{id}` - Delete job
- `POST /api/cron/jobs/{id}/toggle` - Enable/disable job

## Project Structure

```
openclaw-automation-dashboard/
├── index.html          # Main dashboard page
├── styles.css          # All styling and responsive design
├── app.js             # Dashboard functionality and API integration
├── README.md          # This file
└── .github/
    └── workflows/
        └── deploy.yml  # Automated deployment to GitHub Pages
```

## Technology Stack

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+**: Clean, modern JavaScript without dependencies
- **Font Awesome**: Icons for better UX
- **No Build Process**: Direct browser deployment

## Features in Detail

### System Status
- **Gateway Status**: Real-time monitoring of OpenClaw gateway
- **Active Jobs Count**: Number of currently enabled cron jobs
- **Last Update**: Timestamp of most recent data refresh

### Cron Job Management
- **Visual Job List**: All jobs displayed with schedule, status, and actions
- **CRUD Operations**: Create, read, update, and delete jobs through the UI
- **Enable/Disable**: Toggle jobs on/off without deletion
- **Schedule Validation**: Cron expression format validation

### Activity Feed
- **Recent Changes**: Live feed of dashboard and job modifications
- **Timestamps**: Precise timing of all activities
- **Auto-cleanup**: Maintains last 20 activities to prevent bloat

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**: CSS Grid, Fetch API, ES6 Modules, CSS Variables

## Development

### Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Make your changes
4. Test locally: `python3 -m http.server 8000`
5. Commit: `git commit -m "Add awesome feature"`
6. Push: `git push origin feature/awesome-feature`
7. Create a Pull Request

### Code Style

- **HTML**: Semantic elements, proper accessibility attributes
- **CSS**: BEM methodology, CSS custom properties for theming
- **JavaScript**: ES6+ features, async/await for API calls, clear error handling

## Deployment

### GitHub Pages (Automated)

This repository includes a GitHub Actions workflow for automatic deployment:

1. Push to `main` branch
2. GitHub Actions builds and deploys to GitHub Pages
3. Dashboard is live at your GitHub Pages URL

### Manual Deployment

Upload the files to any static hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload as static website
- **Any web server**: Copy files to web root

## Contributing

1. Check existing issues or create a new one
2. Fork the repository
3. Create your feature branch
4. Make changes with proper testing
5. Update documentation as needed
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check the OpenClaw documentation for API details
- **Community**: Join the OpenClaw Discord for support and discussion

---

Built with ❤️ for the OpenClaw community