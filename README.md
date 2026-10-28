# Pi Calendar Dashboard

A beautiful, self-hosted, 24/7 smart wall calendar designed for the Raspberry Pi. It features a rolling 5-week grid view, multi-calendar synchronization, dynamic 12-month seasonal color themes, a rotating photo banner slideshow, automated background syncing, and mouse cursor hiding.

---

## Architecture & How It Works

This project uses a decoupled architecture designed for reliability and seamless kiosk performance:
1. **The Python Backend (`fetch_calendar.py`)**: Runs securely in the background (via a 15-minute cron job). It uses OAuth2 refresh tokens to pull events from all active Google Calendars and exports them into a lightweight `events.json` file. It also scans a local photos folder to generate a `photos.json` manifest.
2. **The Lightweight Web Server (`lighttpd`)**: Serves the local HTML and JSON files directly from `/var/www/html/` so the app loads instantly on boot without relying on external web hosting.
3. **The Frontend Dashboard (`index.html`)**: A responsive, high-contrast single-page web app built with Tailwind CSS. It features a live digital clock, a cross-fading photo banner, automated seasonal color palettes based on the current month, and a rolling 5-week calendar grid with highlighted current-day styling.
4. **The Display Kiosk (`Chromium`)**: Launches automatically on system startup in full-screen kiosk mode (`--kiosk`), displaying the dashboard cleanly without browser UI elements or mouse cursors.

---

## File Structure

* **`index.html`** — The main frontend dashboard interface, containing the calendar grid, clock, photo slideshow logic, and seasonal theme definitions.
* **`config.js`** — Stores your Google API configuration (`CLIENT_ID` and `API_KEY`).
* **`fetch_calendar.py`** — The Python backend script that authenticates with Google, fetches calendar events, and updates `events.json` and `photos.json`.
* **`credentials.json`** — Your Google Cloud OAuth client secret file (Desktop application type).
* **`token.json`** — Contains your persistent Google account refresh token (generated automatically on first run).
* **`events.json`** — Dynamically generated runtime file containing upcoming calendar events.
* **`photos.json`** — Dynamically generated runtime file listing photos for the banner slideshow.
* **`display_pic.png`** — Fallback header image for the photo banner.
* **`photos/`** — Folder containing custom images (`.jpg`, `.png`, `.webp`) for the rotating header banner slideshow.

---

## Installation Guide (From Scratch on Raspberry Pi)

### Step 1: Google Cloud Platform Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **APIs & Services > Library** and enable the **Google Calendar API**.
4. Go to **OAuth consent screen**, configure it as **External**, and add your personal email address as a test user.
5. Go to **Credentials** -> **+ Create Credentials** -> **OAuth client ID**.
   * Application type: **Desktop app**
   * Download the resulting JSON file and save it as `credentials.json` in your project folder.
6. Create an **API Key** and save it alongside your Client ID.

### Step 2: Configure `config.js`
Create a file named `config.js` in your project folder:
```javascript
const GOOGLE_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    API_KEY: 'YOUR_API_KEY_HERE'
};
```

### Step 3: Transfer Files to the Raspberry Pi
Using SCP from your PC terminal (replace `ndrost` with your Pi username and `mypical` with your Pi's hostname or IP):
```cmd
scp index.html config.js fetch_calendar.py credentials.json display_pic.png ndrost@mypical:~/
```

### Step 4: Pi Server & Dependencies Setup
SSH into your Raspberry Pi (`ssh ndrost@mypical`) and run:
```bash
# 1. Install lighttpd web server and unclutter
sudo apt update && sudo apt install -y lighttpd unclutter

# 2. Move web files to the active server directory
sudo mv ~/index.html /var/www/html/index.html
sudo mv ~/config.js /var/www/html/config.js
sudo mv ~/display_pic.png /var/www/html/display_pic.png 2>/dev/null || true

# 3. Create photos directory for slideshow support
sudo mkdir -p /var/www/html/photos

# 4. Grant your user write permissions to the web folder
sudo chown -R $USER:$USER /var/www/html/

# 5. Set up Python virtual environment and install Google libraries
python3 -m venv ~/cal_env
source ~/cal_env/bin/activate
pip install --upgrade pip
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib

# 6. Run initial sync to generate token.json and events.json
python ~/fetch_calendar.py
```
*(Note: The first time you run `fetch_calendar.py`, it will output a link. Open that link in your browser, log into your Google account, and grant calendar permissions).*

### Step 5: Automate Background Syncing (Cron Job)
1. Open crontab:
   ```bash
   crontab -e
   ```
2. Add this line at the bottom to sync events every 15 minutes:
   ```text
   */15 * * * * /home/ndrost/cal_env/bin/python /home/ndrost/fetch_calendar.py
   ```

### Step 6: Configure Kiosk Mode & Boot Display
1. Create the autostart directory and configuration file:
   ```bash
   mkdir -p ~/.config/autostart
   nano ~/.config/autostart/kiosk.desktop
   ```
2. Paste the following configuration (disabling keyring prompts and hiding the mouse cursor):
   ```ini
   [Desktop Entry]
   Type=Application
   Name=Calendar Kiosk
   Exec=chromium --kiosk --noerrdialogs --disable-infobars --password-store=basic --cursor-visibility=none --check-for-update-interval=31536000 http://localhost
   X-GNOME-Autostart-enabled=true
   ```
3. Make the file executable and reboot:
   ```bash
   chmod +x ~/.config/autostart/kiosk.desktop
   sudo reboot
   ```

---

## Customization & Management

* **Adding Photos**: Drop any `.jpg` or `.png` images into `/var/www/html/photos/` on your Pi (or set up a Samba network share for drag-and-drop access from Windows). The banner will automatically cross-fade between them.
* **Seasonal Themes**: The dashboard automatically inspects the current month on startup and applies a custom color palette ranging from winter frosted blues to autumn harvest ambers and Halloween spooks, with today's date highlighted distinctly.