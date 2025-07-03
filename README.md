# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/(website)/page.tsx`.

## Building for Mobile with Capacitor

This Next.js project is configured to be easily wrapped into native iOS and Android applications using Capacitor.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) installed.
-   [Xcode](https://developer.apple.com/xcode/) for iOS development (macOS only).
-   [Android Studio](https://developer.android.com/studio) for Android development.

### Step-by-Step Guide

1.  **Install Capacitor CLI:**
    Open your terminal and install the Capacitor command-line interface globally.

    ```bash
    npm install -g @capacitor/cli
    ```

2.  **Initialize Capacitor:**
    In your project's root directory, run the Capacitor init command. It will ask you for your app name and a package ID (e.g., `com.company.appname`).

    ```bash
    npx cap init
    ```

3.  **Configure Next.js for Static Export:**
    For Capacitor to work, your Next.js app needs to be exported as a static site. Open `next.config.ts` and ensure the `output: 'export'` option is present. This has already been done for you.

4.  **Build Your Next.js App for Mobile:**
    Run the special `build:mobile` command to generate only the necessary app files in the `out` directory. This command excludes the public website, keeping your native app lightweight.

    ```bash
    npm run build:mobile
    ```

5.  **Add Native Platforms:**
    Add the iOS and Android platforms to your project. This will create `ios` and `android` folders in your project root.

    ```bash
    # For iOS
    npx cap add ios

    # For Android
    npx cap add android
    ```

6.  **Sync Your Web Build:**
    The `sync` command copies your web build (`out` directory) into the native projects and updates dependencies.

    ```bash
    npx cap sync
    ```

7.  **Open in Native IDE:**
    You can now open the native projects in their respective IDEs.

    ```bash
    # To open in Xcode (for iOS)
    npx cap open ios

    # To open in Android Studio
    npx cap open android
    ```

From Xcode or Android Studio, you can run your app on a simulator/emulator or a physical device, and build the final release versions for the App Store and Google Play Store.

---
