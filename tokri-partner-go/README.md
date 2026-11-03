# Tokriii Partner (Expo)

Delivery partner app for assigned COD orders: collect cash or show Razorpay QR.

## API hosts

| Run | API |
|---|---|
| Local `npx expo start` | Staging `https://server.tokriii.com/api/v1` |
| EAS `development` / `staging` | Staging |
| EAS `production` | Live `https://tokriii.com/api/v1` |

Override with `EXPO_PUBLIC_API_BASE_URL` if needed.

## Start

```bash
cd tokri-partner-go
npm install
npx expo start
```

Create an active Delivery Partner in Admin (staging) with email/password before login.

After first EAS project setup, set `extra.eas.projectId` in `app.config.js`.
