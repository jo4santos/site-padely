# Match Announcements Feature

## Overview

The match announcements feature allows users to receive live audio updates about matches as they progress. Announcements are generated using OpenAI's GPT-3.5 model and spoken using the browser's Web Speech API.

## Setup

### 1. OpenAI API Key

You need to add your OpenAI API key to the environment files:

**Development (.env.development):**
```bash
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

**Production (.env.production):**
```bash
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` files

## Features

### Announcement Types

The system supports the following announcement types:

1. **Match Start**: Announced when a match begins (if user enables notifications before the match starts)
   - Example: *"The match between Galan / Chingotto and Di Nenno / Augusto has begun!"*

2. **Game Won**: Announced when a team wins a game within a set
   - Example: *"Galan / Chingotto lead 3 games to 2"*
   - Example: *"Match is tied 3-3"*

3. **Set Won**: Announced when a team wins a set
   - Example: *"Galan / Chingotto win set 1 with a score of 6-4!"*

4. **Tiebreak Points**: When a set is tied 6-6, every point is announced
   - Example: *"Galan / Chingotto lead tiebreak 5 to 3"*

5. **Match End**: Announced when the match concludes
   - Example: *"Galan / Chingotto win the match! Final score: 6-4, 7-6"*

### How to Use

1. **Enable Announcements**: Click the bell icon (🔔) on any match card to enable announcements
2. **Disable Announcements**: Click the bell icon again to disable
3. **Visual Indicator**: 
   - Active (blue bell): Announcements enabled
   - Inactive (gray bell): Announcements disabled

### Special Cases

- **Match Not Started**: If you enable announcements before a match starts, you'll receive a notification when the match begins, followed by all in-game announcements
- **Match Ended**: If you enable announcements after a match has finished, the system will simply read out the final score
- **Match In Progress**: If you enable announcements during a match, you'll start receiving updates from the next state change

## Technical Details

### Architecture

- **AnnouncementContext**: React context that manages announcement subscriptions and tracks match state changes
- **announcement.service.js**: Service that interfaces with OpenAI API and Web Speech API
- **MatchCard**: Updated to include announcement toggle button

### State Tracking

The system tracks match state changes by:
1. Monitoring changes in set scores (set1, set2, set3)
2. Detecting tiebreak scenarios (6-6 in games)
3. Tracking point changes during tiebreaks
4. Identifying match completion

### AI-Generated Content

Announcements are generated using OpenAI's GPT-3.5-turbo model with:
- Role: Sports commentator for padel tennis
- Temperature: 0.7 (for varied, natural responses)
- Max tokens: 100
- Fallback: Hardcoded announcements if OpenAI API is unavailable

### Browser Compatibility

- **OpenAI API**: Works in all modern browsers (requires API key)
- **Web Speech API**: Supported in most modern browsers (Chrome, Edge, Safari, Firefox)

## Limitations

1. **API Costs**: Each announcement generates an OpenAI API call (approximately $0.001-0.002 per announcement)
2. **Client-Side API**: The OpenAI API key is exposed in the browser (use with caution, consider rate limits)
3. **Browser Support**: Text-to-speech requires browser support for Web Speech API
4. **Internet Connection**: Requires active internet connection for AI-generated announcements

## Future Enhancements

Potential improvements:
- Add announcement history/log
- Volume control
- Voice selection
- Announcement delay/interval settings
- Server-side API proxy to hide OpenAI key
- Support for multiple languages
- Custom announcement templates
- Notification sound effects

## Security Notes

⚠️ **Important**: The current implementation uses `dangerouslyAllowBrowser: true` for the OpenAI client, which exposes your API key in the browser. For production use, consider:

1. Implementing a backend proxy for OpenAI API calls
2. Using API key restrictions and rate limits
3. Monitoring API usage
4. Implementing request throttling

## Files Modified/Created

- `src/api/announcement.service.js` - New service for announcements
- `src/contexts/AnnouncementContext.jsx` - New context for state management
- `src/components/MatchCard.jsx` - Added announcement toggle
- `src/App.jsx` - Wrapped app with AnnouncementProvider
- `.env.example`, `.env.development`, `.env.production` - Added OpenAI API key
- `package.json` - Added openai dependency
