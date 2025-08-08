import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except Exception:
    HAS_SUPABASE = False

_SUPABASE: Optional["Client"] = None

BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "images")


def _get_client() -> Optional["Client"]:
    global _SUPABASE
    if not HAS_SUPABASE:
        return None
    if _SUPABASE is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            return None
        _SUPABASE = create_client(url, key)
    return _SUPABASE


def upload_image_and_get_url(content: bytes, filename: str = "photo.jpg") -> Optional[str]:
    """Uploads bytes to Supabase Storage and returns public URL. Requires bucket to exist."""
    client = _get_client()
    if not client:
        return None
    ext = filename.split(".")[-1].lower() if "." in filename else "jpg"
    path = f"{datetime.utcnow().strftime('%Y/%m/%d')}/{uuid.uuid4().hex}.{ext}"
    try:
        client.storage.from_(BUCKET_NAME).upload(path, content, {
            "contentType": f"image/{ext}",
            "upsert": False,
        })
        pub = client.storage.from_(BUCKET_NAME).get_public_url(path)
        return pub
    except Exception:
        return None


def save_analysis_record(record: Dict[str, Any]) -> bool:
    """Saves analysis metadata to Supabase table 'analyses'."""
    client = _get_client()
    if not client:
        return False
    try:
        client.table("analyses").insert(record).execute()
        return True
    except Exception:
        return False
