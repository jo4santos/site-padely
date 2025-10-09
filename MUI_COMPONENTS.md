# Material-UI Components Used

This document lists all MUI components used in the Padely application.

## Layout Components

- **Container** - Responsive container for page content
- **Box** - Generic container with sx prop for styling
- **Stack** - Flexbox container for aligned items
- **Grid** - Responsive grid layout

## Navigation

- **AppBar** - Top navigation bar
- **Toolbar** - Container for app bar content
- **Button** - Action buttons throughout the app
- **IconButton** - Icon-based buttons (e.g., expand/collapse)
- **Tabs** - Day navigation in tournament detail
- **Tab** - Individual tab items
- **ToggleButtonGroup** - Filter button groups
- **ToggleButton** - Individual filter buttons

## Display Components

- **Typography** - All text rendering (h1-h6, body, etc.)
- **Card** - Container for tournaments, matches, rankings
- **CardContent** - Content wrapper for cards
- **CardMedia** - Tournament images
- **Chip** - Small labels (tournament types, LIVE badges)
- **Avatar** - Player photos and country flags
- **Collapse** - Animated expand/collapse for match stats
- **LinearProgress** - Visual stat comparison bars

## Feedback

- **CircularProgress** - Loading spinners
- **Alert** - Error messages

## Icons (from @mui/icons-material)

- **SportsTennis** - Tennis ball icon (app logo, serving indicator)
- **ArrowBack** - Back button
- **Refresh** - Auto-refresh toggle
- **ExpandMore** - Expand match stats
- **FiberManualRecord** - Live indicator dot

## Theming

- **ThemeProvider** - MUI theme wrapper
- **CssBaseline** - CSS reset and baseline styles
- **createTheme** - Custom theme configuration

## Theme Configuration

```javascript
{
  palette: {
    primary: { main: '#1976d2' },    // Blue
    secondary: { main: '#dc004e' },  // Pink/Red
    success: { main: '#00a86b' },    // Green
    error: { main: '#f44336' }       // Red (LIVE badges)
  }
}
```

## Styling Approach

The app uses MUI's `sx` prop for all styling:
- No custom CSS files
- Theme-aware styling
- Responsive breakpoints
- Hover effects
- Animations

Example:
```jsx
<Box sx={{
  display: 'flex',
  justifyContent: 'center',
  p: 4,
  '@media (max-width: 600px)': {
    p: 2
  }
}} />
```
