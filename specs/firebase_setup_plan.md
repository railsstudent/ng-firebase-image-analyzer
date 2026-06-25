# Firebase Implementation Plan

## 1. Directory & Dependencies

* Create the `firebase/` directory in the root of the workspace.
* Run `npm init -y` inside `firebase/` to initialize `package.json`.
* Run `npm install -D firebase-tools eslint prettier` to install the CLI and formatting tools locally.

## 2. Firebase Project Initialization

* Set `vertexai-tts` as the active project using `npx firebase use vertexai-tts` inside `firebase/`.
* Initialize Firebase AI Logic by running `npx firebase init ailogic`.

## 3. App Hosting & Emulator Scripts

* Create a `firebase.json` file inside `firebase/` with the following configuration:
  * An `apphosting` block pointing to the Angular app root.
  * An `emulators` block setting the `apphosting` emulator to port `5005`.
* Add an npm script to `package.json`:
  * `"emulate": "firebase emulators:start --project default"`

## 4. Remote Config Custom Fetcher

* Create a Node.js script named `get-remote-config.js`.
* This script will execute `npx firebase remoteconfig:get --json --project default`.
* The script will parse the JSON output, extract the default values from the `parameters` object, and construct a flat JSON object of `key:value` pairs.
* The script will then write this flat JSON object to a new file named `remote-config-defaults.json` inside the `firebase/` folder.
* Add an npm script to `package.json`:
  * `"config:fetch": "node get-remote-config.js"`

## 5. Code Quality Setup

* Create an `eslint.config.js` file (using the modern Flat Config format) and a `.prettierrc` file in the `firebase/` directory.
* Add the following npm scripts to `package.json`:
  * `"lint": "eslint *.js"`
  * `"format": "prettier --write ."`
