# Padely - Padel Tournament Tracker

A modern React application for tracking padel tournaments, matches, and player rankings.

## Features

- 📊 View tournaments (Live Today, Upcoming, Past)
- 🎾 Real-time match tracking with auto-refresh (5 seconds)
- 📈 Detailed match statistics with set-by-set breakdown
- 🏆 Player rankings (Men & Women)
- 🔍 Search and filter tournaments
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library and styling
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Emotion** - CSS-in-JS (used by MUI)

## Project Structure

```
site-padely/
├── src/
│   ├── api/
│   │   └── api.service.js      # API integration layer
│   ├── components/
│   │   ├── Filter.jsx           # Filter buttons component
│   │   ├── MatchCard.jsx        # Match display with accordion stats
│   │   ├── MatchStats.jsx       # Detailed match statistics
│   │   ├── Tabs.jsx             # Tab navigation component
│   │   └── TournamentCard.jsx   # Tournament card display
│   ├── pages/
│   │   ├── Rankings.jsx         # Player rankings page
│   │   ├── TournamentDetail.jsx # Tournament detail with matches
│   │   └── Tournaments.jsx      # Tournament list page
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # All styles
│   └── main.jsx                 # Entry point
├── dist/                        # Production build output
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── serve-dist.py               # Production server with SPA routing
└── package.json                # Dependencies

Legacy files (can be removed):
├── js/                         # Old vanilla JS code
├── styles.css                  # Old CSS (now using MUI styling)
└── server.py                   # Old dev server
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3 (for serving production build)
- OpenAI API key (for match announcements feature)

### Installation

```bash
npm install
```

### Setup Environment Variables

For local development, you need to configure your OpenAI API key:

**Quick Setup:**
```bash
# Run the setup script
./setup-dev.sh

# Then edit .env.development and add your API key
# Get your key from: https://platform.openai.com/api-keys
```

**Manual Setup:**
```bash
# Copy the example environment file
cp .env.example .env.development

# Edit .env.development and add your OpenAI API key
```

📖 **See [SETUP.md](SETUP.md) for detailed setup instructions, including GitHub Actions deployment.**

⚠️ **Important:** Never commit `.env.development` to git - it's already in `.gitignore`.

### Development

Start the Vite dev server with hot module replacement:

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

Build the app for production:

```bash
npm run build
```

This creates optimized static files in the `dist/` folder.

### Serving Production Build

Serve the production build with the included Python server:

```bash
python3 serve-dist.py
```

Or use any static file server:

```bash
# Using Python's built-in server (requires SPA routing support)
python3 -m http.server 8080 -d dist

# Using npx serve
npx serve dist -p 8080

# Using any other static host (Netlify, Vercel, GitHub Pages, etc.)
```

**Important:** For React Router to work properly, your server must:
- Serve `index.html` for all routes that don't match static files
- The included `serve-dist.py` handles this automatically

## Key Features Implementation

### Auto-Refresh

Tournament detail pages automatically refresh match data every 5 seconds when enabled (default: ON). This provides near real-time updates for live matches.

### Smart Updates

The app uses React's efficient re-rendering to update only changed elements:
- Match scores
- Current game points
- Winner status
- Live badges

No manual DOM manipulation needed - React handles it efficiently!

### Match Statistics

Click any match to view detailed statistics:
- Overall match stats
- Set-by-set breakdown
- Serve stats (aces, double faults, etc.)
- Return stats
- Visual comparison bars

### Tournament Categories

Tournaments are automatically categorized:
- **Live Today**: Tournaments happening right now
- **Upcoming**: Future tournaments
- **Past**: Completed tournaments (shown with reduced opacity)

### Filters

- **Type filter**: Filter by tournament type (Premier, P1, P2, etc.)
- **Gender filter**: Filter matches by Men/Women categories
- **Search**: Search tournaments by name

## API Integration

The app uses the Padely API at `https://padely.fredericosilva.net`.

Endpoints used:
- `GET /events` - List tournaments
- `GET /event?id={id}&day={day}` - Get matches
- `GET /match_stats?eventId={id}&matchId={id}` - Get match statistics
- `GET /ranking?gender={gender}` - Get player rankings

## Deployment

The production build is completely static. You can deploy the `dist/` folder to:

- **Netlify**: `netlify deploy --prod --dir=dist`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Copy `dist/` contents to your gh-pages branch
- **Any static host**: Upload the `dist/` folder

All of these platforms handle SPA routing automatically.

## Migration History

This app has evolved through multiple iterations:

### v1 → v2: Vanilla JS to React + Vite
✅ Migrated from vanilla JavaScript to React
✅ Added Vite for build tooling
✅ Implemented React Router for navigation
✅ Maintained all original features

### v2 → v3: React + CSS to React + Material-UI
✅ Migrated to Material-UI component library
✅ Replaced custom CSS with MUI's sx prop and theme
✅ Fixed tabs and match stats bugs
✅ Enhanced UI with Material Design components
✅ Added icons and better visual feedback
✅ Improved responsiveness and accessibility

## License

ISC