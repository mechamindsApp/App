from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .agents_chain import analyze_image_chain
from .supabase_utils import upload_image_and_get_url, save_analysis_record
import os

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

      record = {
          "image_url": public_url,
          "experience": result.get("experience"),
          "perception": result.get("perception"),
          "confidence": 0.9,
      }
      save_analysis_record(record)

      return { **record }
    except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))

@app.get("/discover")
async def discover():
    # Ideally read from Supabase table 'analyses'
    try:
        from .supabase_utils import _get_client
        client = _get_client()
        if client:
            data = client.table("analyses").select("*").order("created_at", desc=True).limit(20).execute()
            return {"analyses": data.data}
    except Exception:
        pass
    # Fallback mock
    return {
        "analyses": [
            {"user": "Ahmet K.", "category": "nature", "likes": 24, "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200", "experience": "Sabah ışığı..."},
            {"user": "Elif S.", "category": "food", "likes": 18, "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200", "experience": "Rezervasyon..."}
        ]
    }
