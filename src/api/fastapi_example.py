from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-photo/")
async def analyze_photo(file: UploadFile = File(...)):
    # Burada Vision API ve LLM entegrasyonu yapılacak
    # Şimdilik mock response dönüyor
    return {
        "objects": ["araba", "yol", "gündüz"],
        "experience": "Bu araba uzun yolda çok keyiflidir ama bagajı küçük, pikniğe gidersen dikkat et."
    }
