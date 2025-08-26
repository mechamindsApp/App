# Secrets and Local Config

- Remove `firebase_service_account.json` from the repository. Keep it out of git and load via env var.
- Python API (`src/api/user_api.py`) reads:
  - `FIREBASE_CRED_PATH` -> path to your JSON key file
  - `FIREBASE_STORAGE_BUCKET` -> your bucket name
- On Windows PowerShell, set before running backend:
  ```powershell
  $env:FIREBASE_CRED_PATH = "C:\path\to\firebase_service_account.json"
  $env:FIREBASE_STORAGE_BUCKET = "your-bucket.appspot.com"
  ```
