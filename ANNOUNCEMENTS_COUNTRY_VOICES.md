# Country-Aware Voice Selection for Announcements

## Overview

The announcement system now automatically selects the appropriate voice based on the players' countries for better pronunciation of names. This means Spanish player names will be pronounced with a Spanish voice, Italian names with an Italian voice, etc.

## How It Works

### 1. Country Detection

The system extracts country codes from player flag URLs:
- Flag URL: `https://widget.matchscorerlive.com/images/flags/ESP.jpg`
- Extracted country: `ESP` (Spain)

### 2. Language Mapping

Each country code is mapped to the appropriate language/voice:

| Country | Code | Voice Language | Example Players |
|---------|------|----------------|----------------|
| Spain | ESP | es-ES (Spanish) | Most Spanish players |
| Argentina | ARG | es-AR (Argentine Spanish) | Galan, Tapia, etc. |
| Italy | ITA | it-IT (Italian) | Di Nenno, etc. |
| France | FRA | fr-FR (French) | French players |
| Portugal | POR | pt-PT (Portuguese) | Portuguese players |
| Brazil | BRA | pt-BR (Brazilian Portuguese) | Brazilian players |
| Mexico | MEX | es-MX (Mexican Spanish) | Mexican players |
| Germany | GER | de-DE (German) | German players |
| Sweden | SWE | sv-SE (Swedish) | Swedish players |
| Netherlands | NED | nl-NL (Dutch) | Dutch players |
| USA | USA | en-US (US English) | American players |
| UK | GBR | en-GB (British English) | British players |
| Australia | AUS | en-AU (Australian English) | Australian players |

### 3. Voice Selection Logic

For each match:

1. **Collect all player countries** from both teams (up to 4 players)
2. **Count language occurrences** (e.g., if 3 players are Spanish and 1 is Italian)
3. **Select the most common language**
4. **Spanish preference**: If Spanish is among the top languages, it's preferred (since padel is a Spanish sport)
5. **Fallback**: If no suitable voice is found, defaults to English

### 4. Voice Matching

The system tries multiple fallback strategies:
1. Try exact language match (e.g., `es-ES`)
2. Try language family match (e.g., any `es-*` for Spanish)
3. Fall back to English if no match found

## Examples

### Example 1: All Spanish Players
**Match:** Agustin Galan / Federico Chingotto vs Martin Di Nenno / Augusto Tapia
- **Countries:** ARG, ARG, ARG, ARG
- **Selected Voice:** Spanish (es-AR or es-ES)
- **Result:** Spanish pronunciation of all names

### Example 2: Mixed Nationalities (Spanish majority)
**Match:** V. Virseda Sanchez (ESP) / M. Calvo Santamaria (ESP) vs M. Fassio Goyeneche (ARG) / C. Orsi (ITA)
- **Countries:** ESP, ESP, ARG, ITA
- **Languages:** es-ES (2), es-AR (1), it-IT (1)
- **Selected Voice:** Spanish (es-ES) - most common, plus Spanish preference
- **Result:** Spanish pronunciation

### Example 3: No Spanish Players
**Match:** Two Italian players vs Two French players
- **Countries:** ITA, ITA, FRA, FRA
- **Languages:** it-IT (2), fr-FR (2)
- **Selected Voice:** Italian (it-IT) - first alphabetically with same count
- **Result:** Italian pronunciation

## Technical Implementation

### Files Modified

1. **`src/api/announcement.service.js`**
   - Added `getCountryFromFlag()` - Extracts country code from flag URL
   - Added `getLanguageForCountry()` - Maps country to language code
   - Added `getMatchLanguage()` - Determines best voice for a match
   - Updated `speakAnnouncement()` - Accepts match object and selects voice

2. **`src/contexts/AnnouncementContext.jsx`**
   - Updated all `speakAnnouncement()` calls to pass match object
   - Match object now flows through to voice selection

### Code Flow

```
Match Data (with player flags)
    ↓
getMatchLanguage(match)
    ↓
Extract country codes from all 4 players
    ↓
Map countries to languages
    ↓
Count language occurrences
    ↓
Select most common (with Spanish preference)
    ↓
speakAnnouncement(text, match)
    ↓
Find voice matching language
    ↓
Speak with appropriate accent!
```

## Browser Compatibility

### Available Voices

The number and quality of voices varies by browser:

- **Chrome/Edge (Windows):** 50+ voices including Spanish, Italian, French, Portuguese, etc.
- **Safari (macOS/iOS):** 70+ high-quality voices in many languages
- **Firefox:** Fewer voices, may fall back to English more often
- **Chrome (Linux):** Limited voices, may need additional language packs

### Checking Available Voices

Open the browser console and run:
```javascript
window.speechSynthesis.getVoices().forEach(voice => {
    console.log(voice.name, voice.lang);
});
```

## Benefits

✅ **Better Pronunciation**: Spanish names pronounced by Spanish voice, Italian by Italian, etc.
✅ **Authentic Experience**: Matches the international nature of padel
✅ **Automatic Detection**: No manual configuration needed
✅ **Smart Fallbacks**: Always finds the best available voice
✅ **Cultural Respect**: Proper pronunciation shows respect for players' heritage

## Limitations

⚠️ **Voice Availability**: Depends on browser and operating system
⚠️ **Mixed Teams**: When teams have very different nationalities, one language must be chosen
⚠️ **Quality Varies**: Some browser voices sound more natural than others
⚠️ **Internet Not Required**: Uses built-in browser voices (offline capable)

## Future Enhancements

Possible improvements:
- Allow users to manually override voice selection
- Split announcements by player (each name in their own language)
- Add voice quality preferences
- Support for more countries/languages
- Voice selection UI/settings panel

## Testing

To test the feature:

1. **Find a match with Spanish players**
   - Enable announcements
   - Should hear Spanish pronunciation

2. **Check console logs**
   - Look for: `Preferred language for match: es-ES`
   - Look for: `Using voice: [Voice Name] es-ES`

3. **Test different nationality combinations**
   - All Spanish → Spanish voice
   - Mixed → Most common language
   - No Spanish data → English fallback

## Debug Information

The system logs useful debug info to console:
- `Preferred language for match: [language]`
- `Using voice: [name] [language]`

Check these logs if pronunciation seems incorrect.
