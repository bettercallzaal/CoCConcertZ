# TestFlight Runbook - COC Concertz iOS

Capacitor shell app (strategy per ZAOOS research doc 218). The native app loads
https://www.cocconcertz.com, so every Vercel deploy updates the app content
instantly - no App Store resubmission for content changes.

## What exists (this repo)

- `capacitor.config.ts` - appId `com.cocconcertz.app`, remote server URL,
  allowNavigation for Spatial/Twitch/YouTube/Cloudinary embeds
- `ios/` - generated Xcode project (Capacitor 8.4.1, iOS 16 deployment target).
  Verified: builds for simulator with signing disabled
- `capacitor-shell/` - offline fallback page

## Local dev loop

```bash
npx cap sync ios          # after changing capacitor.config.ts
npx cap open ios          # opens Xcode
# Run on simulator from Xcode, or:
cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -sdk iphonesimulator build
```

## Path to TestFlight (Zaal's steps, ~1 hour once account exists)

1. Apple Developer Program membership ($99/yr) on the Apple ID that will own
   the app
2. App Store Connect: create app record - name "COC Concertz", bundle ID
   `com.cocconcertz.app` (register the ID in Certificates/Identifiers first)
3. Xcode (`npx cap open ios`): select the App target, Signing & Capabilities,
   pick your Team - Xcode auto-manages certs
4. App icon: drop 1024x1024 (`images/coc-icon-1024.png` is already the right
   size) into `ios/App/App/Assets.xcassets/AppIcon.appiconset`
5. Product -> Archive -> Distribute App -> App Store Connect -> Upload
6. App Store Connect -> TestFlight tab: internal testing (up to 100 testers on
   your team, live in minutes) or external testing (public link, needs a quick
   Beta App Review, usually about a day)

## Later hardening (before public App Store, not needed for TestFlight)

- Native push via @capacitor/push-notifications (APNs) - pairs with the
  Firestore notificationTokens system
- App Store review guideline 4.2 (minimum functionality): a pure webview can
  get pushback at PUBLIC release. Mitigations: native push, app-only features
  (attendance badge claim), haptics on battle votes. TestFlight itself is fine.
- Android: `npx cap add android` when ready; Play Store via the same config
