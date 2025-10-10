# Match Notification System

## Overview

The site now has **two separate notification systems** for match updates:

1. **Voice Announcements** - AI-generated text-to-speech announcements
2. **Smart Notifications** - Hybrid system that adapts to page visibility

Both systems can be enabled/disabled independently for each match.

## Features

### Voice Announcements

- Uses OpenAI GPT-3.5-turbo to generate natural language announcements
- Text-to-speech with premium English voices at 0.85 speed (slower for clarity)
- Automatically disabled for finished matches
- Toggle with volume icon (🔊/🔇) on match cards

### Smart Notifications (Hybrid System)

The notification system intelligently adapts based on whether you're actively viewing the page:

#### When Page is Visible (Foreground)
- **In-App Toast Notifications** - Material-UI Snackbar
- Displayed in the top-right corner
- Auto-dismiss after 5 seconds
- Different colors for different event types:
  - **Success** (green) - Match ended
  - **Info** (blue) - All other updates
- Non-intrusive and visually integrated

#### When Page is Hidden (Background)
- **Native OS Notifications** - HTML5 browser notifications
- Appear at the system level (Windows/macOS notification center)
- Work even when browser is minimized or you're using other apps
- Click notification to focus browser window
- **Requires user permission** - Browser will ask on first use

This ensures you always see notifications in the most appropriate way!

## Announcement Types

Both systems announce 5 types of match events:

1. **Match Start** - When a match begins
2. **Game Won** - When a game is won (every game)
3. **Set Won** - When a set is completed
4. **Tiebreak Point** - During tiebreak points
5. **Match End** - When the match finishes (winner's score first)

## Toggle Controls

Each match card has two independent toggle buttons:

| Icon | System | States |
|------|--------|--------|
| 🔊 VolumeUp | Voice Announcements | Enabled |
| 🔇 VolumeOff | Voice Announcements | Disabled |
| 🔔 NotificationsActive | Visual Notifications | Enabled |
| 🔕 NotificationsOff | Visual Notifications | Disabled |

## Player Names

- Uses **full player names** (e.g., "Juan Martín Díaz")
- Removes ranking numbers from names (e.g., "(8)" is stripped)
- Announces both team members separated by "and"

## Score Formatting

Match end announcements always show the **winner's score first**:

**Example:**
- If Team B wins 6-4, 6-4, the announcement is:
  - ✅ "Team B wins the match 6-4, 6-4"
  - ❌ NOT "Team B wins 4-6, 4-6"

## Technical Implementation

### Files

- **src/api/announcement.service.js** - OpenAI integration and speech synthesis
- **src/contexts/AnnouncementContext.jsx** - State management for both systems and native notifications
- **src/components/MatchCard.jsx** - Match card with dual toggle buttons

### Browser Permissions

Native notifications require user permission:

```javascript
// Permission is requested automatically when user first enables notifications
if (Notification.permission === 'default') {
    await Notification.requestPermission();
}
```

### Native Notification Features

- **Tag-based** - Prevents duplicate notifications for the same match
- **Auto-close** - Dismisses after 5 seconds
- **Click handler** - Focuses browser window when clicked
- **Icon/Badge** - Uses site favicon for branding
- **Silent option** - Can be configured to be silent or play system sound

### Environment Variables

Required in `.env` files:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Dependencies

```json
{
  "openai": "^4.x.x"
}
```

**Note:** Native notifications use the browser's built-in Notification API - no additional dependencies required.

## State Management

The `AnnouncementContext` tracks:

- **voiceSubscriptions** - Set of match IDs with voice enabled
- **notificationSubscriptions** - Set of match IDs with notifications enabled
- **lastAnnouncedStates** - Last known state of each match
- **notificationPermission** - Current browser notification permission status

## Notification Permission States

1. **default** - User hasn't been asked yet (will prompt on first toggle)
2. **granted** - User allowed notifications (notifications will show)
3. **denied** - User blocked notifications (shows alert to enable in settings)

## Auto-disable Logic

Voice announcements are **automatically disabled** when a match finishes to prevent repeated announcements.

Visual notifications continue to work for finished matches (user can manually disable).

## How It Works

1. User toggles notification for a match
2. Browser requests permission (if not already granted)
3. Context adds match ID to subscriptions
4. Auto-refresh polls for match updates
5. When a change is detected:
   - **Voice**: Generates AI announcement → Speaks via Web Speech API
   - **Notification (Page Visible)**: Generates AI message → Shows in-app toast
   - **Notification (Page Hidden)**: Generates AI message → Shows native OS notification
6. Notifications auto-close after 5 seconds
7. Click native notification to focus browser window

### Visibility Detection

The system uses `document.hidden` and `document.visibilityState` to detect if the page is in the foreground or background:

```javascript
const isPageHidden = document.hidden || document.visibilityState === 'hidden';
// If hidden → Native OS notification
// If visible → In-app toast notification
```

## Usage Example

**User wants both voice and notifications:**
1. Click 🔊 icon → Voice enabled
2. Click 🔔 icon → Browser asks for permission → Notifications enabled
3. Match updates trigger both systems
4. **While viewing the page**: See in-app toast notifications
5. **While in another app**: Receive native OS notifications

**Testing notifications:**
1. Enable notifications on a match
2. Keep the page open → See toast notifications
3. Minimize browser or switch to another app → Receive OS notifications
4. Click OS notification → Browser window comes to focus

## Usage Example

**User wants both voice and notifications:**
1. Click 🔊 icon → Voice enabled
2. Click 🔔 icon → Browser asks for permission → Notifications enabled
3. Match updates trigger both systems

**User wants only notifications (silent):**
1. Keep 🔇 icon (voice disabled)
2. Click 🔔 icon → Browser asks for permission → Notifications enabled
3. Match updates show only OS notifications

**User wants only voice:**
1. Click 🔊 icon → Voice enabled
2. Keep 🔕 icon (notifications disabled)
3. Match updates are spoken but no OS notifications

## Browser Compatibility

Native notifications work in:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile with iOS 16.4+)
- ✅ Opera (Desktop)

**Note:** Some browsers may require HTTPS for notifications to work (localhost is exempt).

## Future Enhancements

Potential improvements:

- Notification sound effects (in addition to voice)
- Customizable auto-close duration
- Notification history panel
- Batch notifications for multiple matches
- Persistent user preferences (localStorage)
