# Obsidian Google Calendar Dashboard

A minimalistic, beautiful Google Calendar integration for Obsidian that allows you to consolidate events from multiple Google accounts into a single, unified month-view dashboard. The plugin is built with privacy in mind and communicates directly with the Google Calendar API locally on your machine.

## Features

- **Month Calendar Grid**: A beautiful 7-column interactive grid layout.
- **Full Event Management (CRUD)**: Create, read, update, and delete Google Calendar events directly inside Obsidian.
- **Multi-Account Support**: Authenticate and sync events from multiple Google accounts simultaneously.
- **Privacy First**: Direct OAuth2 authentication. Your data never touches a third-party server.
- **Seamless UI**: Built with isolated CSS, the UI blends smoothly with your Obsidian theme and will never interfere with native settings.

---

## 🛠️ Setup Instructions

Setting up the plugin takes a few minutes as you need to generate your own Google API credentials. Follow these steps carefully:

### Step 1: Install the Plugin in Obsidian

1. Locate your Obsidian vault on your computer.
2. Navigate to `<your-vault-path>/.obsidian/plugins/`.
3. Create a new folder named `obsidian-google-calendar-dashboard` (or similar).
4. Copy the compiled `main.js`, `styles.css`, and `manifest.json` files from this repository into that folder.
5. Open Obsidian, go to **Settings > Community Plugins**, turn off "Safe Mode" if it's on, and **enable** the plugin.

### Step 2: Configure Google Cloud Console

To pull your calendar data, you need to create an OAuth2 app in Google Cloud.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** at the top, and click **New Project**. Give it a name (e.g., "Obsidian Calendar") and click **Create**.
3. Once the project is created, select it.
4. In the left sidebar, navigate to **APIs & Services > Library**.
5. Search for **Google Calendar API** and click **Enable**.

### Step 3: Setup OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services > OAuth consent screen**.
2. Select **External** as the User Type and click **Create**.
3. Fill in the required fields:
   - **App name**: Obsidian Calendar
   - **User support email**: (Your email)
   - **Developer contact info**: (Your email)
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes**. Search for "Google Calendar API" and **enable all scopes** related to the Google Calendar API. Click Update, then click **Save and Continue**.
6. **CRITICAL STEP (Test Users)**: While your app is in the "Testing" phase, Google requires you to explicitly whitelist emails that are allowed to log in. Under **Test users**, click **+ Add Users** and type in the Google email address(es) you plan to link to the plugin. If you don't do this, you will get an `Access Denied (403)` error when trying to log in!
7. Click **Save and Continue**.

### Step 4: Generate OAuth Credentials

1. In the left sidebar, go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Name it something like "Obsidian Plugin".
5. Under **Authorized redirect URIs**, click **+ Add URI** and enter exactly: `http://127.0.0.1:3000/callback`
6. Click **Create**.
7. A window will pop up with your **Client ID** and **Client Secret**. Keep this window open or copy them down.

### Step 5: Configure the Obsidian Plugin

1. Open Obsidian and go to **Settings > Google Calendar Dashboard**.
2. Paste the **Client ID** and **Client Secret** into the respective fields.
3. Scroll down to the **Google Accounts** section and click **Add Account**.
4. A web browser will open asking you to sign in to your Google Account.
5. _Note: Because your app is not "verified" by Google, you will see a warning screen saying "Google hasn't verified this app". Click **Advanced** and then **Go to Obsidian Calendar (unsafe)**._
6. Check the boxes to allow the plugin to view and edit your calendar events, and click **Continue**.
7. You should see an "Authentication Successful" message in your browser. You can now close the browser tab.
8. Your account will appear in the Obsidian plugin settings.

---

## 📅 Usage

Once an account is linked, you can open the Calendar Dashboard!

- Run the command **`Google Calendar: Open Dashboard`** via the Obsidian Command Palette (`Ctrl/Cmd + P`).
- The interactive Month View will appear as a central pane. 
- You can navigate through months using the **Prev** and **Next** buttons.
- Click **+ Add Event** or click any day cell to create a new event.
- Click any existing event pill to view its details, edit it, or delete it.

## Tech Stack

- **Language**: TypeScript
- **UI**: React
- **Bundler**: ESBuild
- **API**: Google Calendar REST API (v3)
