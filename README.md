# 75 Hard

A 75 Hard challenge tracker. It runs as a home-screen web app on iPhone (hosted on GitHub Pages) and also as an Expo phone app.

## Install on your iPhone (web app)

1. Open `https://<your-github-username>.github.io/75-hard/` in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open it from the home screen. After the first load it works offline, and your data stays on the phone.
4. In **Settings → Reminders**, add the four daily reminders to Google Calendar.

Data (checklist, diet, photos) is stored in the browser on your phone. Deleting the home-screen app deletes your data.

## Publishing updates

Every push to `main` builds the app and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).
The site path is set by `experiments.baseUrl` in `app.json` (`/75-hard`), which must match the repo name.

```bash
npm run build:web   # build to dist/ locally
```

## Run with Expo Go (development)

`npm start`, then scan the QR code with the iPhone Camera (needs this computer running).

## Rules the app enforces

- 7 daily tasks: 8 AM check-in (counts until 8:15), 45-min workout, 45-min outdoor workout, 1 gallon of water, progress photo, personal goal (editable in Settings), and following the diet.
- When a day ends at midnight, the app scores it. A complete day moves you forward one day. A missed day sends you back 10 days (never below Day 1) and resets your streak.
- If you start after 8 AM on Day 1, that day's wake-up check-in is waived.

## Code map

- `src/lib/challenge.ts`: day scoring and the rollback rule
- `src/lib/foods.ts`: food list with diet-restriction tags, and the recommended plan built around them
- `src/lib/calendar.ts`: Google Calendar reminder links (web)
- `src/lib/notifications.ts`: local notifications (Expo phone app)
- `src/lib/photos.ts` / `photos.web.ts`: photo storage (file system / IndexedDB)
- `src/lib/store.tsx`: app state, saved with AsyncStorage (localStorage on web)
- `src/app/(tabs)/`: Today, Progress, Diet, Photos, Settings screens
- `public/` + `scripts/pwa.mjs`: home-screen app files (manifest, icons, offline service worker)
