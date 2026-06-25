# Firebase Environment Configuration Implementation Plan

## 1. Create Template File (`firebase/.env.example`)

* Create `.env.example` in the `firebase/` folder with generic placeholders:

    ```env
    FIREBASE_API_KEY="<Firebase API Key>"
    FIREBASE_AUTH_DOMAIN="<Firebase Auth Domain>"
    FIREBASE_PROJECT_ID="<Firebase Project ID>"
    FIREBASE_STORAGE_BUCKET="<Firebase Storage Bucket>"
    FIREBASE_MESSAGING_SENDER_ID="<Firebase Messaging Sender ID>"
    FIREBASE_APP_ID="<Firebase App ID>"
    ```

## 2. Local Environment File (`firebase/.env`)

* Create `.env` in the `firebase/` folder containing the actual configuration values:

    ```env
    FIREBASE_API_KEY="<Your Firebase API Key>"
    FIREBASE_AUTH_DOMAIN="<Your Firebase Auth Domain>"
    FIREBASE_PROJECT_ID="<Your Firebase Project ID>"
    FIREBASE_STORAGE_BUCKET="<Your Firebase Storage Bucket>"
    FIREBASE_MESSAGING_SENDER_ID="<Your Firebase Messaging Sender ID>"
    FIREBASE_APP_ID="<Your Firebase App ID>"
    ```

## 3. Gitignore Configuration

* Append both `.env` and `firebase.config.json` to the bottom of `firebase/.gitignore` to ensure they are ignored.

## 4. Create Generator Script (`firebase/scripts/generate-config.js`)

* Create `firebase/scripts/generate-config.js` with the following logic:
  * Resolve absolute path to `firebase/.env`.
  * Load `.env` using Node's native `process.loadEnvFile(envPath)`.
  * Map environment variables:
    * `process.env.FIREBASE_API_KEY` $\rightarrow$ `apiKey`
    * `process.env.FIREBASE_AUTH_DOMAIN` $\rightarrow$ `authDomain`
    * `process.env.FIREBASE_PROJECT_ID` $\rightarrow$ `projectId`
    * `process.env.FIREBASE_STORAGE_BUCKET` $\rightarrow$ `storageBucket`
    * `process.env.FIREBASE_MESSAGING_SENDER_ID` $\rightarrow$ `messagingSenderId`
    * `process.env.FIREBASE_APP_ID` $\rightarrow$ `appId`
  * Write the mapped key-value pairs into `firebase/firebase.config.json`.

## 5. Update package.json & Generate Config

* Add `"config:generate": "node scripts/generate-config.js"` to the `scripts` object in `firebase/package.json`.
* Run `npm run config:generate` to generate the initial `firebase.config.json`.
