# Dev Notes

## Python virtual environment
- Prefer using `.venv/` at repo root.
- If both `.venv/` and `venv/` exist locally, remove one to avoid confusion.

## Secrets
- Keep `firebase_service_account.json` out of git. Use env vars as described in `SECURITY_NOTES.md`.
