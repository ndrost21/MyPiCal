import os
import sys
import json
import datetime
import argparse

# Auto-detect paths based on operating system (matching fetch_calendar.py)
if os.name == 'nt':
    # Windows PC Testing paths
    BASE_DIR = os.getcwd()
    OUTPUT_FILE = os.path.join(BASE_DIR, 'sleep.json')
    TOKEN_DIR = os.path.join(BASE_DIR, '.garmin_tokens')
    CONFIG_FILE = os.path.join(BASE_DIR, 'garmin_config.json')
else:
    # Raspberry Pi paths
    BASE_DIR = '/home/ndrost'
    OUTPUT_FILE = '/var/www/html/sleep.json'
    TOKEN_DIR = os.path.join(BASE_DIR, '.garmin_tokens')
    CONFIG_FILE = os.path.join(BASE_DIR, 'garmin_config.json')


def format_duration(seconds):
    """Format seconds into Xh Ym."""
    if not seconds or seconds < 0:
        return "0h 0m"
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    return f"{hours}h {minutes}m"


def generate_mock_sleep_data():
    """Generates realistic 7-day mock sleep data for UI testing."""
    today = datetime.date.today()
    sample_scores = [76, 82, 85, 71, 88, 79, 86]
    sample_hours = [7.2, 7.8, 8.1, 6.5, 8.4, 7.3, 7.7]

    history = []
    total_seconds = 0
    total_score = 0
    valid_scores_count = 0

    for i in range(7):
        day_date = today - datetime.timedelta(days=(6 - i))
        dur_hours = sample_hours[i]
        dur_sec = int(dur_hours * 3600)
        score = sample_scores[i]

        deep_sec = int(dur_sec * 0.20)
        rem_sec = int(dur_sec * 0.24)
        awake_sec = int(dur_sec * 0.06)
        light_sec = dur_sec - (deep_sec + rem_sec + awake_sec)

        qualifier = "EXCELLENT" if score >= 90 else "GOOD" if score >= 80 else "FAIR" if score >= 60 else "POOR"

        history.append({
            "date": day_date.isoformat(),
            "day": day_date.strftime("%a"),
            "score": score,
            "qualifier": qualifier,
            "duration_seconds": dur_sec,
            "duration_hours": round(dur_hours, 1),
            "duration_formatted": format_duration(dur_sec),
            "deep_seconds": deep_sec,
            "light_seconds": light_sec,
            "rem_seconds": rem_sec,
            "awake_seconds": awake_sec
        })

        total_seconds += dur_sec
        total_score += score
        valid_scores_count += 1

    latest = history[-1]

    data = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "is_mock": True,
        "latest": latest,
        "weekly_history": history,
        "weekly_average_hours": round(total_seconds / (7 * 3600), 1),
        "weekly_average_score": round(total_score / valid_scores_count) if valid_scores_count else None
    }
    return data


def get_garmin_client():
    """Authenticate and return an initialized Garmin client with saved token support."""
    try:
        from garminconnect import (
            Garmin,
            GarminConnectAuthenticationError,
            GarminConnectConnectionError,
            GarminConnectTooManyRequestsError,
        )
    except ImportError:
        print("Error: 'garminconnect' package is not installed.")
        print("Please run: pip install garminconnect")
        sys.exit(1)

    # Read credentials from garmin_config.json or environment variables
    email = os.environ.get('GARMIN_EMAIL')
    password = os.environ.get('GARMIN_PASSWORD')

    if not email or not password:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    cfg = json.load(f)
                    email = cfg.get('email')
                    password = cfg.get('password')
            except Exception as e:
                print(f"Error reading {CONFIG_FILE}: {e}")

    # Prompt user interactively if credentials not found and tokens don't exist
    has_tokens = os.path.exists(TOKEN_DIR)
    if not has_tokens and (not email or not password or email == "your_garmin_email@example.com"):
        if sys.stdin.isatty():
            print("\n--- Garmin Connect Credentials Setup ---")
            email = input("Garmin Email: ").strip()
            import getpass
            password = getpass.getpass("Garmin Password: ").strip()
        else:
            raise ValueError(
                f"Garmin credentials missing. Please edit {CONFIG_FILE} with your actual Garmin email and password."
            )

    try:
        print(f"Connecting to Garmin Connect (saving session to {TOKEN_DIR})...")
        os.makedirs(TOKEN_DIR, exist_ok=True)

        def mfa_callback():
            print("\nGarmin Multi-Factor Authentication (MFA) required.")
            print("Please check your email or authenticator app for the 6-digit security code.")
            return input("Enter Garmin MFA Code: ").strip()

        garmin = Garmin(
            email=email if (email and email != "your_garmin_email@example.com") else None,
            password=password if (password and password != "your_garmin_password") else None,
            prompt_mfa=mfa_callback
        )

        garmin.login(tokenstore=TOKEN_DIR)

        try:
            garmin.client.dump(TOKEN_DIR)
        except Exception:
            pass

        print("Successfully authenticated with Garmin Connect.")
        return garmin

    except GarminConnectAuthenticationError as err:
        print(f"\nGarmin Connect authentication error: {err}")
        print("Please check your email and password in garmin_config.json.")
        sys.exit(1)
    except GarminConnectTooManyRequestsError as err:
        print(f"\nGarmin Connect rate limit: {err}")
        print("Garmin may temporarily rate limit login attempts. Please wait a few minutes before trying again.")
        sys.exit(1)
    except Exception as err:
        print(f"\nUnexpected error during Garmin login: {err}")
        sys.exit(1)


def fetch_garmin_sleep():
    """Fetch 7 days of sleep metrics from Garmin Connect and save to sleep.json."""
    garmin = get_garmin_client()
    today = datetime.date.today()

    weekly_history = []
    total_seconds = 0
    total_score = 0
    scored_days_count = 0

    print("Fetching sleep data for the last 7 days...")
    for i in range(7):
        target_date = today - datetime.timedelta(days=(6 - i))
        date_str = target_date.isoformat()

        day_record = {
            "date": date_str,
            "day": target_date.strftime("%a"),
            "score": None,
            "qualifier": None,
            "duration_seconds": 0,
            "duration_hours": 0.0,
            "duration_formatted": "0h 0m",
            "deep_seconds": 0,
            "light_seconds": 0,
            "rem_seconds": 0,
            "awake_seconds": 0,
            "sleep_start": None,
            "sleep_end": None
        }

        try:
            raw_data = garmin.get_sleep_data(date_str)
            daily_dto = raw_data.get('dailySleepDTO') or {}

            # Sleep duration in seconds
            sleep_time_sec = daily_dto.get('sleepTimeSeconds') or 0
            day_record["duration_seconds"] = sleep_time_sec
            day_record["duration_hours"] = round(sleep_time_sec / 3600, 1)
            day_record["duration_formatted"] = format_duration(sleep_time_sec)

            # Sleep stages
            day_record["deep_seconds"] = daily_dto.get('deepSleepSeconds') or 0
            day_record["light_seconds"] = daily_dto.get('lightSleepSeconds') or 0
            day_record["rem_seconds"] = daily_dto.get('remSleepSeconds') or 0
            day_record["awake_seconds"] = daily_dto.get('awakeSleepSeconds') or 0
            day_record["sleep_start"] = daily_dto.get('sleepStartTimestampGMT')
            day_record["sleep_end"] = daily_dto.get('sleepEndTimestampGMT')

            # Sleep score extraction (Garmin nests this under sleepScores.overall)
            sleep_scores = daily_dto.get('sleepScores') or {}
            overall_score_obj = sleep_scores.get('overall') or {}
            score_val = overall_score_obj.get('value')

            # Fallback if in different location in payload
            if score_val is None:
                score_val = daily_dto.get('sleepScore')

            if score_val is not None:
                day_record["score"] = int(score_val)
                qualifier = overall_score_obj.get('qualifierKey') or daily_dto.get('sleepScoreFeedback')
                if qualifier:
                    day_record["qualifier"] = str(qualifier).upper()
                else:
                    day_record["qualifier"] = (
                        "EXCELLENT" if score_val >= 90 else
                        "GOOD" if score_val >= 80 else
                        "FAIR" if score_val >= 60 else "POOR"
                    )
                total_score += int(score_val)
                scored_days_count += 1

            total_seconds += sleep_time_sec

        except Exception as e:
            print(f"Warning: Could not fetch sleep for {date_str}: {e}")

        weekly_history.append(day_record)

    # Determine latest night with valid sleep data
    latest_record = None
    for rec in reversed(weekly_history):
        if rec["duration_seconds"] > 0 or rec["score"] is not None:
            latest_record = rec
            break
    if not latest_record and weekly_history:
        latest_record = weekly_history[-1]

    avg_hours = round(total_seconds / (7 * 3600), 1)
    avg_score = round(total_score / scored_days_count) if scored_days_count > 0 else None

    payload = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "is_mock": False,
        "latest": latest_record,
        "weekly_history": weekly_history,
        "weekly_average_hours": avg_hours,
        "weekly_average_score": avg_score
    }

    return payload


def main():
    parser = argparse.ArgumentParser(description="Fetch Garmin Connect sleep data for Pi Calendar Dashboard")
    parser.add_argument("--demo", "--mock", action="store_true", help="Generate mock sleep data for UI testing without Garmin credentials")
    args = parser.parse_args()

    if args.demo:
        print("Generating mock sleep data...")
        data = generate_mock_sleep_data()
    else:
        try:
            data = fetch_garmin_sleep()
        except Exception as e:
            print(f"Error fetching Garmin sleep data: {e}")
            print("Falling back to mock data so UI remains functional...")
            data = generate_mock_sleep_data()

    # Ensure output directory exists and write JSON
    out_dir = os.path.dirname(OUTPUT_FILE)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Successfully wrote sleep data to {OUTPUT_FILE}")
    if data.get("latest"):
        latest = data["latest"]
        print(f"Latest Night: {latest.get('date')} | Score: {latest.get('score')} ({latest.get('qualifier')}) | Sleep Time: {latest.get('duration_formatted')}")


if __name__ == '__main__':
    main()
