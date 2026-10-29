# Project Guidelines & Rules

## Git & Branching Strategy
* **Feature Branch First**: Never make changes or edits directly on `main`. Before modifying any files, always create and switch to a descriptive feature/fix branch (e.g., `feature/<name>` or `fix/<name>`).

## Versioning & Visual Verification
* **Always Bump `APP_VERSION`**: Whenever editing `index.html` (or associated frontend code), always increment `APP_VERSION` (e.g., `v1.1.0` -> `v1.1.1`) in `index.html`. This ensures the user can visually confirm on the physical display that the latest push has been loaded.

## Assets & Images
* **Header Images**: Month-specific images follow the format `<Month>_pic.png` (e.g., `Oct_pic.png`, `Nov_pic.png`). If missing, the header cleanly hides itself.
* **Ignore PNGs**: Local `.png` images are ignored by version control to keep personal assets local to the kiosk display.
