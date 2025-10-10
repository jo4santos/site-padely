# Quick Start Guide - Match Announcements

## Setup Steps

### 1. Add Your OpenAI API Key

Open `.env.development` and add your OpenAI API key:

```bash
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Restart the Development Server

```bash
npm run dev
```

### 3. Start Using Announcements

1. Navigate to any tournament
2. Find a match you want to follow
3. Click the bell icon (🔔) on the match card
4. The icon will turn blue when announcements are enabled

## How It Works

### Before Match Starts
Click the bell → You'll hear: *"The match between [Team A] and [Team B] has begun"* when it starts

### During Match
Click the bell → You'll hear announcements for:
- Every game won (*"Galan / Chingotto lead 3 games to 2"*)
- Every set won (*"Galan / Chingotto win set 1!"*)
- Every point in tiebreaks (*"Tiebreak: Galan / Chingotto 5, Di Nenno / Augusto 3"*)

### After Match Ends
Click the bell → You'll hear the final result: *"Galan / Chingotto win the match! Final score: 6-4, 7-6"*

## Example Announcements

**Match Start:**
> "The match between Galan / Chingotto and Di Nenno / Augusto has begun!"

**Game Score:**
> "Galan / Chingotto lead 4 games to 2"
> "Match is tied 5-5"

**Set Won:**
> "Galan / Chingotto take the first set, winning 6-3!"

**Tiebreak:**
> "Tiebreak tension! Galan / Chingotto lead 6 to 5"

**Match End:**
> "Galan / Chingotto claim victory! Final score: 6-3, 7-6"

## Tips

- ✅ Enable announcements for multiple matches to follow them simultaneously
- ✅ The browser's text-to-speech will read announcements aloud
- ✅ Click the bell again to disable announcements
- ⚠️ Make sure your device volume is on
- ⚠️ Each announcement uses a small amount of your OpenAI API credits

## Troubleshooting

**No sound?**
- Check your device volume
- Make sure your browser supports Web Speech API (Chrome, Edge, Safari work best)

**No announcements?**
- Verify your OpenAI API key is set in `.env.development`
- Check browser console for errors
- Make sure you've restarted the dev server after adding the API key

**Getting errors?**
- Check your OpenAI API key is valid
- Ensure you have API credits available
- Check your internet connection

## Cost Information

- Each announcement costs approximately $0.001-0.002 USD (using GPT-3.5-turbo)
- A typical match might generate 15-30 announcements
- Total cost per match: ~$0.02-0.05 USD

Enjoy your enhanced padel watching experience! 🎾🔔
