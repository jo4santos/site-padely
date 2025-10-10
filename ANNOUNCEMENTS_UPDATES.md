# Announcement Feature Updates

## Changes Made

### 1. Remove Player Rankings from Announcements

**Issue:** Player names sometimes include rankings (e.g., "V. Virseda Sanchez (8)") which were being read aloud.

**Solution:** Added `cleanPlayerName()` function that removes ranking numbers in parentheses.

**Example:**
- Before: "V. Virseda Sanchez (8) / M. Di Nenno (5)"
- After: "V. Virseda Sanchez / M. Di Nenno"

**Code Added:**
```javascript
function cleanPlayerName(name) {
    if (!name) return '';
    // Remove ranking numbers in parentheses
    return name.replace(/\s*\(\d+\)\s*$/, '').trim();
}
```

### 2. Include Score in Match End Announcements

**Issue:** When a match was already finished and user clicked to enable announcements, only the winner was announced without the score.

**Solution:** Updated both AI-generated and fallback announcements to include the full score.

**Examples:**

**AI-Generated Announcement (with OpenAI):**
> "A. Galan / F. Chingotto claim victory 6-4 6-3!"

**Fallback Announcement (without OpenAI):**
> "Galan / Chingotto win the match by 6-4 6-3"

**Score Format:**
- Sets are space-separated (e.g., "6-4 6-3" or "6-4 3-6 7-5")
- Each set shows games won by each team

## Files Modified

- `src/api/announcement.service.js`
  - Added `cleanPlayerName()` function
  - Updated `getTeamNames()` to use `cleanPlayerName()`
  - Updated `generateMatchEndPrompt()` to include score and loser's name
  - Updated fallback `MATCH_END` case to include full score

## Testing

To test these changes:

1. **Test Ranking Removal:**
   - Find a match with players that have rankings
   - Enable announcements
   - Verify the ranking numbers are not spoken

2. **Test Match End Score:**
   - Find a finished match
   - Click the bell icon to enable announcements
   - Should hear: "[Winner] win the match by [score]"
   - Example: "Galan / Chingotto win the match by 6-4 6-3"

## Technical Details

**Regex Pattern for Ranking Removal:**
```javascript
/\s*\(\d+\)\s*$/
```
- `\s*` - Optional whitespace before parenthesis
- `\(` - Opening parenthesis
- `\d+` - One or more digits
- `\)` - Closing parenthesis
- `\s*` - Optional whitespace after parenthesis
- `$` - End of string

This ensures we only remove rankings at the end of names, not other numbers that might appear in names.

## Examples

### Before Changes
```
Announcement: "Virseda Sanchez (8) / Di Nenno (5) wins the match!"
```

### After Changes
```
Announcement: "Virseda Sanchez / Di Nenno win the match by 6-4 6-3"
```
