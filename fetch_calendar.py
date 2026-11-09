import os
import json
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Auto-detect paths based on operating system
if os.name == 'nt': 
    # Windows PC Testing paths
    BASE_DIR = os.getcwd()
    OUTPUT_FILE = os.path.join(BASE_DIR, 'events.json')
    PHOTO_DIR = os.path.join(BASE_DIR, 'photos')
    PHOTOS_JSON = os.path.join(BASE_DIR, 'photos.json')
else: 
    # Raspberry Pi paths
    BASE_DIR = '/home/ndrost' 
    OUTPUT_FILE = '/var/www/html/events.json'
    PHOTO_DIR = '/var/www/html/photos'
    PHOTOS_JSON = '/var/www/html/photos.json'

CREDS_FILE = os.path.join(BASE_DIR, 'credentials.json')
TOKEN_FILE = os.path.join(BASE_DIR, 'token.json')

def update_photos_manifest():
    """Scan the photos folder and write photos.json for the web UI."""
    try:
        valid_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
        photo_files = []
        if os.path.exists(PHOTO_DIR):
            for file in sorted(os.listdir(PHOTO_DIR)):
                if file.lower().endswith(valid_extensions):
                    photo_files.append(f"photos/{file}")
        
        with open(PHOTOS_JSON, 'w') as f:
            json.dump(photo_files, f)
    except Exception as e:
        print(f"Error updating photos list: {e}")

def main():
    # Update photo slideshow manifest
    update_photos_manifest()

    creds = None
    # Load the permanent refresh token if it exists
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    # Authenticate and save the token if missing or expired
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Calculate rolling date range with buffer to prevent timezone offsets from clipping edge events
        now = datetime.datetime.now(datetime.timezone.utc)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_grid = today - datetime.timedelta(days=today.isoweekday() % 7)
        fetch_start = start_grid - datetime.timedelta(days=7)
        fetch_end = start_grid + datetime.timedelta(days=42)
        
        start_iso = fetch_start.isoformat()
        end_iso = fetch_end.isoformat()
        
        # Fetch events from all selected calendars
        calendar_list = service.calendarList().list().execute()
        all_events = []
        
        for cal in calendar_list.get('items', []):
            if not cal.get('selected'):
                continue
            events_result = service.events().list(
                calendarId=cal['id'], timeMin=start_iso, timeMax=end_iso,
                singleEvents=True, orderBy='startTime', showDeleted=False).execute()
            
            for event in events_result.get('items', []):
                event['customColor'] = cal.get('backgroundColor', '#3b82f6')
                all_events.append(event)
        
        # Sort chronologically and export JSON
        all_events.sort(key=lambda x: x['start'].get('dateTime', x['start'].get('date')))
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(all_events, f)
            
    except Exception as e:
        print(f"Error fetching calendars: {e}")

if __name__ == '__main__':
    main()
