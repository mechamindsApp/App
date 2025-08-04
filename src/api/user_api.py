from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request, Header, UploadFile, File

def get_current_user(authorization: str = Header(None)):
    """
    JWT token doğrulama dependency. Token geçersizse HTTPException döner.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Token gerekli")
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")
    return payload
from fastapi import HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.auth_utils import create_access_token, verify_token
import os
import firebase_admin
from firebase_admin import credentials, storage, firestore
from .agents_chain import analyze_image_chain
from langchain_community.llms import OpenAI





app = FastAPI()


# Basit admin yetkilendirme (örnek)
ADMIN_EMAILS = ["admin@mechaminds.com"]

def is_admin(payload: dict):
    email = payload.get("email")
    return email in ADMIN_EMAILS

@app.get("/admin/event-logs/")
async def get_event_logs(payload: dict = Depends(get_current_user)):
    """
    Admin: Event loglarını Firestore'dan çeker.
    """
    if not is_admin(payload):
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    try:
        logs = db.collection("event_logs").order_by("timestamp", direction="DESCENDING").limit(100).stream()
        log_list = [l.to_dict() for l in logs]
        return {"logs": log_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Event logları alınamadı: {str(e)}")

@app.post("/event-log/")
async def add_event_log(request: Request, payload: dict = Depends(get_current_user)):
    """
    Kullanıcı veya sistem event logunu Firestore'a kaydeder.
    """
    data = await request.json()
    event_type = data.get("type")
    event_detail = data.get("detail")
    try:
        db.collection("event_logs").add({
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "type": event_type,
            "detail": event_detail,
            "timestamp": SERVER_TIMESTAMP
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Event log kaydı başarısız: {str(e)}")


# Firestore SERVER_TIMESTAMP fix
SERVER_TIMESTAMP = firestore.firestore.SERVER_TIMESTAMP

# Firebase başlatma
FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH", "firebase_service_account.json")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "your-bucket-name.appspot.com")
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred, {
        'storageBucket': FIREBASE_STORAGE_BUCKET
    })
db = firestore.client()
bucket = storage.bucket()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fake_users_db = {}
user_photos = {}

def is_nsfw_or_violent(photo_bytes):
    # Basit NSFW/şiddet kontrolü (örnek)
    if b'nsfw' in photo_bytes or b'violent' in photo_bytes:
        return True
    return False

@app.post("/analyze-photo/")
async def analyze_photo(
    file: UploadFile = File(...),
    payload: dict = Depends(get_current_user)
):
    """
    Fotoğraf analiz endpointi. Dosya boyutu limiti ve hata yönetimi eklenmiştir.
    """
    google_id = payload.get("sub")
    photo_bytes = await file.read()
    if len(photo_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Dosya boyutu 5MB'dan büyük olamaz.")
    if is_nsfw_or_violent(photo_bytes):
        raise HTTPException(status_code=400, detail="Uygunsuz fotoğraf. Bu tür içerikleri analiz edemiyoruz.")
    try:
        blob = bucket.blob(f"photos/{google_id}/{file.filename}")
        blob.upload_from_string(photo_bytes, content_type=file.content_type or 'application/octet-stream')
        photo_url = blob.generate_signed_url(expiration=3600*24*7)
        experience = analyze_image_chain(photo_bytes)
        db.collection("photo_analysis").add({
            "user_id": google_id,
            "photo_url": photo_url,
            "filename": file.filename,
            "experience": experience,
            "timestamp": SERVER_TIMESTAMP
        })
        return {"experience": experience, "photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fotoğraf analizi başarısız: {str(e)}")
user_feedback = {}

@app.post("/feedback/")
async def feedback(
    request: Request,
    payload: dict = Depends(get_current_user)
):
    """
    Kullanıcı feedback endpointi. Feedback uzunluğu ve hata yönetimi eklenmiştir.
    """
    google_id = payload.get("sub")
    data = await request.json()
    feedback_text = data.get('feedback')
    if not feedback_text or len(feedback_text) < 5:
        raise HTTPException(status_code=400, detail="Feedback en az 5 karakter olmalı.")
    try:
        db.collection("feedback").add({
            "user_id": google_id,
            "feedback": feedback_text,
            "timestamp": SERVER_TIMESTAMP
        })
        user_feedback.setdefault(google_id, []).append(feedback_text)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback kaydı başarısız: {str(e)}")

@app.get("/photo-history/")
async def photo_history(payload: dict = Depends(get_current_user)):
    """
    Kullanıcının fotoğraf analiz geçmişi endpointi. Hata yönetimi eklenmiştir.
    """
    google_id = payload.get("sub")
    try:
        analyses = db.collection("photo_analysis").where("user_id", "==", google_id).stream()
        photo_list = [a.to_dict() for a in analyses]
        return {"photos": photo_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fotoğraf geçmişi alınamadı: {str(e)}")
@app.post("/login/")
async def login(request: Request):
    """
    Kullanıcı login endpointi. Email formatı doğrulama ve hata yönetimi eklenmiştir.
    """
    import re
    data = await request.json()
    google_id = data.get('google_id')
    email = data.get('email')
    name = data.get('name')
    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Eksik bilgi")
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Geçersiz email formatı")
    fake_users_db[google_id] = {"email": email, "name": name}
    token = create_access_token({"sub": google_id, "email": email})
    return {"success": True, "user": fake_users_db[google_id], "token": token}

@app.get("/user-data/")
async def get_user_data(payload: dict = Depends(get_current_user)):
    """
    Kullanıcıya özel veri dönen endpoint. Hata yönetimi eklenmiştir.
    """
    google_id = payload.get("sub")
    user = fake_users_db.get(google_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"user": user, "data": ["örnek veri 1", "örnek veri 2"]}
