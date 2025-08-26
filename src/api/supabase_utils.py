import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import importlib

# Lazy-loaded Supabase client (optional dependency)
_SUPABASE: Optional[Any] = None  # type: ignore[name-defined]

BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "images")


def _get_client() -> Optional[Any]:  # type: ignore[valid-type]
    """Return Supabase client if env and package exist; otherwise None."""
    global _SUPABASE
    if _SUPABASE is not None:
        return _SUPABASE
    try:
        supabase_mod = importlib.import_module("supabase")
        create_client = getattr(supabase_mod, "create_client", None)
        if create_client is None:
            return None
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            return None
        _SUPABASE = create_client(url, key)
        return _SUPABASE
    except Exception:
        return None


def upload_image_and_get_url(content: bytes, filename: str = "photo.jpg") -> Optional[str]:
    """Upload bytes to Supabase Storage and return public URL (or None)."""
    client = _get_client()
    if not client:
        return None
    ext = (filename.split(".")[-1].lower() if "." in filename else "jpg") or "jpg"
    path = f"{datetime.utcnow().strftime('%Y/%m/%d')}/{uuid.uuid4().hex}.{ext}"
    bucket = client.storage.from_(BUCKET_NAME)
    # supabase-py v1/v2 compatibility
    try:
        bucket.upload(path, content, {"contentType": f"image/{ext}", "upsert": False})
    except TypeError:
        try:
            bucket.upload(path=path, file=content, file_options={"content-type": f"image/{ext}"}, upsert=False)
        except Exception:
            return None
    except Exception:
        return None

    try:
        pub = bucket.get_public_url(path)
        if isinstance(pub, dict):
            # v2 sometimes returns {'data': {'publicUrl': '...'}}
            return (pub.get("data") or {}).get("publicUrl") or pub.get("publicUrl")
        return pub
    except Exception:
        return None


def save_analysis_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Insert into 'analyses' and return inserted row (with id) or None."""
    client = _get_client()
    if not client:
        return None
    try:
        try:
            resp = client.table("analyses").insert(record, returning="representation").execute()
        except TypeError:
            resp = client.table("analyses").insert(record).execute()
        data = getattr(resp, "data", None)
        if not data and isinstance(resp, dict):
            data = resp.get("data")
        if isinstance(data, list) and data:
            return data[0]
        return None
    except Exception:
        return None


def update_analysis_record(
    analysis_id: str,
    objects: Optional[list] = None,
    experience: Optional[str] = None,
    certainty: Optional[float] = None,
) -> bool:
    """Update 'analyses' row fields: perception.objects/certainty, experience, confidence."""
    client = _get_client()
    if not client:
        return False
    try:
        updates: Dict[str, Any] = {}
        # Merge perception json
        if objects is not None or certainty is not None:
            perception: Dict[str, Any] = {}
            try:
                existing = client.table("analyses").select("perception").eq("id", analysis_id).limit(1).execute()
                existing_data = getattr(existing, "data", None) or (existing.get("data") if isinstance(existing, dict) else None)
                if existing_data:
                    perception = dict(existing_data[0].get("perception") or {})
            except Exception:
                perception = {}
            if objects is not None:
                perception["objects"] = objects
            if certainty is not None:
                perception["certainty"] = certainty
                updates["confidence"] = certainty
            updates["perception"] = perception

        if experience is not None:
            updates["experience"] = experience

        if not updates:
            return True

        client.table("analyses").update(updates).eq("id", analysis_id).execute()
        return True
    except Exception:
        return False
