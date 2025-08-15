from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .agents_chain import analyze_image_chain, experience_agent
from .supabase_utils import upload_image_and_get_url, save_analysis_record, _get_client, update_analysis_record
import os
from typing import Dict, Any, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/analyze-photo/")
async def analyze_photo(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = analyze_image_chain(image_bytes)

        public_url = None
        if os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_BUCKET"):
            public_url = upload_image_and_get_url(image_bytes, file.filename or "photo.jpg")

        record: Dict[str, Any] = {
            "image_url": public_url,
            "experience": result.get("experience"),
            "perception": result.get("perception"),
            "confidence": result.get("perception", {}).get("certainty", 0.8),
        }
        
        saved_record = save_analysis_record(record)

        if not saved_record:
            raise HTTPException(status_code=500, detail="Failed to save analysis record.")

        return saved_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine-analysis")
async def refine_analysis(payload: Dict[str, Any]):
    analysis_id = payload.get("analysis_id")
    corrected_objects = payload.get("corrected_objects")
    
    if not analysis_id or not isinstance(corrected_objects, list):
        raise HTTPException(status_code=400, detail="Missing analysis_id or corrected_objects")

    try:
        # 1. Fetch existing perception to keep scene/context
        client = _get_client()
        if not client:
            raise HTTPException(status_code=500, detail="Could not connect to database.")
        
        db_response = client.table("analyses").select("perception").eq("id", analysis_id).limit(1).execute()
        if not db_response.data:
            raise HTTPException(status_code=404, detail="Analysis not found.")

        # 2. Create a new scene JSON with corrected objects
        current_perception = db_response.data[0].get("perception") or {}
        new_scene_json = {
            "objects": corrected_objects,
            "scene": current_perception.get("scene", "bir sahne"),
            "context": current_perception.get("context", "genel bağlam"),
            "certainty": 0.95,  # User-corrected, so high certainty
            "provider": current_perception.get("provider", "refined"),
        }

        # 3. Regenerate experience with the new scene
        new_experience = experience_agent(new_scene_json)

        # 4. Update the record in Supabase
        update_analysis_record(
            analysis_id=analysis_id,
            objects=corrected_objects,
            experience=new_experience,
            certainty=0.95
        )

        return {"success": True, "experience": new_experience, "perception": new_scene_json}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feedback")
async def feedback(payload: Dict[str, Any]):
    client = _get_client()
    if client:
        try:
            client.table("feedback").insert({
                "analysis_id": payload.get("analysis_id"),
                "feedback": payload.get("feedback"),
            }).execute()
        except Exception:
            pass
    return {"ok": True}

@app.post("/like")
async def like(payload: Dict[str, Any]):
    client = _get_client()
    if client:
        try:
            client.table("likes").insert({
                "analysis_id": payload.get("analysis_id"),
            }).execute()
        except Exception:
            pass
    return {"ok": True}

@app.post("/correction")
async def correction(payload: Dict[str, Any]):
    client = _get_client()
    if client:
        try:
            # optional: store corrections in feedback table
            client.table("feedback").insert({
                "analysis_id": payload.get("analysis_id"),
                "feedback": f"CORRECTION|original={payload.get('original')}|corrected={payload.get('corrected')}"
            }).execute()
        except Exception:
            pass
    return {"ok": True}

@app.get("/discover")
async def discover():
    try:
        client = _get_client()
        if client:
            data = client.table("analyses").select("*").order("created_at", desc=True).limit(20).execute()
            return {"analyses": data.data}
    except Exception:
        pass
    return {
        "analyses": [
            {"user": "Ahmet K.", "category": "nature", "likes": 24, "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200", "experience": "Sabah ışığı..."},
            {"user": "Elif S.", "category": "food", "likes": 18, "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200", "experience": "Rezervasyon..."}
        ]
    }
