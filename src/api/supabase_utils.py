import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import importlib

# Lazy-loaded Supabase client (optional dependency)
_SUPABASE: Optional[Any] = None  # type: ignore[name-defined]

BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "images")


def _get_client() -> Optional[Any]:  # type: ignore[valid-type]
    global _SUPABASE
    if _SUPABASE is not None:
        return _SUPABASE

    # Dynamically import supabase to avoid hard dependency at import time
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


def save_analysis_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Saves analysis metadata to Supabase table 'analyses' and returns the new record."""
    client = _get_client()
    if not client:
        return None
    try:
        response = client.table("analyses").insert(record, returning="representation").execute()
        if response.data:
            return response.data[0]
        return None
    except Exception:
        return None


def update_analysis_record(analysis_id: str, objects: Optional[list] = None, experience: Optional[str] = None, certainty: Optional[float] = None) -> bool:
    """Updates an existing analysis row (objects inside perception + experience)."""
    client = _get_client()
    if not client:
        return False
    try:
        updates: Dict[str, Any] = {}
        if objects is not None:
            # fetch existing perception so we can merge
            try:
                existing = client.table("analyses").select("perception").eq("id", analysis_id).limit(1).execute()
                if existing.data:
                    perception = existing.data[0].get("perception") or {}
                else:
                    perception = {}
            except Exception:
                perception = {}
            perception = dict(perception)
            perception["objects"] = objects
            if certainty is not None:
                perception["certainty"] = certainty
            updates["perception"] = perception
        if experience is not None:
            updates["experience"] = experience
        if certainty is not None:
            updates["confidence"] = certainty
        if not updates:
            return True
        client.table("analyses").update(updates).eq("id", analysis_id).execute()
        return True
    except Exception:
        return False
