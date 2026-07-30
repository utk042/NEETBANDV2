# Future Google Ads Pre-Roll Implementation Guide

This document outlines how to re-introduce pre-roll ads (ads that play before a song starts) using **Google Ads (specifically the Google IMA HTML5 SDK)**, matching the exact timing and functionality of our previous custom pre-roll system.

## 1. Prerequisites

Before implementing this, you will need:
- A **Google Ad Manager** (or AdSense for Video/Audio) account.
- An **Ad Tag URL** (VAST tag) provided by Google. This URL tells the player which ad to fetch.

## 2. Core Architecture: Google IMA SDK

We cannot just put a Google Ad URL into the `<audio>` `src` tag. Google Ads for media players require the **IMA (Interactive Media Ads) SDK**. 

The flow will be identical to our old logic:
1. User clicks a song.
2. `playWithAds` is called.
3. Instead of fetching `/ads` from our backend, the frontend triggers the IMA SDK.
4. The IMA SDK requests an ad from Google and plays it in a dedicated container.
5. When the IMA SDK fires the `ALL_ADS_COMPLETED` event, we automatically start the actual song.

## 3. Necessary Code Changes

### Step 1: Load the IMA SDK
Add the Google IMA script to your `index.html`:
```html
<script src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
```

### Step 2: The Ad Container
In `PlayerContext.jsx` or a global wrapper, we need a dedicated UI container for the ad (Google requires a DOM element to attach the ad player to, even if it's just audio):
```jsx
<div id="adContainer" style={{ display: isPlayingAd ? 'block' : 'none' }}>
  <video id="adVideoElement" />
</div>
```

### Step 3: PlayerContext State
We will re-introduce the following state variables in `PlayerContext.jsx`:
- `isPlayingAd`
- `activeAdSessionIdRef`

### Step 4: Refactoring `playWithAds`
The `playWithAds` function will be modified to request a Google Ad instead of playing a local audio file.

```javascript
const playWithAds = useCallback((track, isManual = true) => {
  // ... (login checks, etc) ...

  const shouldPlayPreRoll = !isManual && !user?.isPremium && track.audioRollsEnabled;

  if (shouldPlayPreRoll) {
    setIsPlayingAd(true);
    
    // 1. Initialize Google IMA AdDisplayContainer
    const adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'),
      document.getElementById('adVideoElement')
    );
    adDisplayContainer.initialize();

    // 2. Request Ads using your Google Ad Tag URL
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'YOUR_GOOGLE_AD_TAG_URL_HERE';
    
    // 3. Listen for Completion
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
      // Ad finished! Start the actual song.
      setIsPlayingAd(false);
      startActualSong(track);
    });

  } else {
    // Direct Playback (no ads)
    startActualSong(track);
  }
});
```

### Step 5: Handling Mid-Rolls & Popups
Just like before, we will pass a flag (`isManual`) to `playWithAds`. If a user manually changes a track, we skip the Google pre-roll. Furthermore, any custom popup triggers set to `0%` will continue to be filtered out so they don't clash with the Google Ad.

## 4. Considerations
- **Ad Blockers:** Many users use ad blockers which will block the `ima3.js` script. We must add a fallback: if the IMA SDK fails to load or the ad request fails, the player should immediately call `startActualSong(track)` so the user isn't stuck on a loading state.
- **Mobile Autoplay:** Mobile browsers require a user interaction (a tap) to start audio/video. The initial click on the song satisfies this, but the IMA SDK must be initialized synchronously during that click event.
