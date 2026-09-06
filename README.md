# Pocket DBT

Pocket DBT is a private, offline, DBT-informed skills cheat sheet built with React Native and Expo.

## Local development

```bash
npm install
npm run ios
```

## TestFlight production build

Prerequisites: an active Apple Developer Program membership and an Expo account.

```bash
npm install --global eas-cli
eas login
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

The bundle identifier is `com.micheletighe.pocketdbt`. Build numbers are managed remotely and automatically incremented by EAS.

## Release material

- App icon and splash artwork: `assets/`
- App Store listing draft: `store/app-store-listing.md`
- Privacy policy: `store/privacy-policy.html`
- Support page: `store/support.html`

The privacy and support HTML files must be published at stable HTTPS URLs before App Store submission. Replace their contact placeholders with a monitored support email first.

## Important release checks

- Have the skill content reviewed by a qualified DBT clinician.
- Test call/text actions and every navigation path on a physical iPhone.
- Verify VoiceOver, Larger Text, reduced motion, and smaller supported iPhone screens.
- Confirm the App Privacy answers still match the current code before every release.
- Update the privacy policy before adding analytics, accounts, storage, or any third-party SDK that handles data.
