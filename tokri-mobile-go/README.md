# Tokriii Mobile App

Expo SDK 54 app for the Tokriii fruit store. Use this folder for Expo Go testing and APK builds.

**API:** `https://tokriii.com/api/v1`

## Run on your phone

```bash
cd /var/www/html/tokri/tokri-mobile-go
npm start
```

Scan the QR code in **Expo Go**.

## Build APK (from your PC, not the live server)

The live server hosts the website and API. The APK is built from this project on your computer using Expo EAS (the build runs in Expo's cloud):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

The APK already talks to `https://tokriii.com/api/v1`.

## Build for TestFlight

Use the production profile for an App Store / TestFlight build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
```

This uses the `store` distribution in `eas.json`, which is the correct profile for an App Store build that can be uploaded to TestFlight. After the build completes, submit it with:

```bash
eas submit --platform ios --profile production
```
