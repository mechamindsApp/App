from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .agents_chain import analyze_image_chain

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
      return {
          "experience": result.get("experience"),
          "perception": result.get("perception"),
          "confidence": 0.9
      }
    except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))
