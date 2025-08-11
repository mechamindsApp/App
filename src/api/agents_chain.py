import os
import json
import base64
from typing import Dict, Any, List
import importlib

# Provider flags (optional)
USE_OPENAI = bool(os.getenv("OPENAI_API_KEY"))
USE_GEMINI = bool(os.getenv("GEMINI_API_KEY")) and not USE_OPENAI

# Optional clients
_openai_client = None
_genai_model = None

# Lazy import OpenAI client
if USE_OPENAI:
    try:
        openai_mod = importlib.import_module("openai")
        OpenAI = getattr(openai_mod, "OpenAI", None)
        if OpenAI is not None:
            _openai_client = OpenAI()
        else:
            USE_OPENAI = False
    except Exception:
        _openai_client = None
        USE_OPENAI = False

# Lazy import Gemini client
if USE_GEMINI:
    try:
        genai = importlib.import_module("google.generativeai")
        configure = getattr(genai, "configure", None)
        GenerativeModel = getattr(genai, "GenerativeModel", None)
        if configure and GenerativeModel:
            configure(api_key=os.getenv("GEMINI_API_KEY"))
            _genai_model = GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json"}
            )
        else:
            USE_GEMINI = False
    except Exception:
        _genai_model = None
        USE_GEMINI = False


STRICT_SPEC = (
    "Return ONLY JSON with keys: objects (array), scene (string), context (string), certainty (number 0..1). "
    "objects MUST be array of either strings or {name, confidence} where confidence in 0..1."
)


def _normalize_objects(objs: Any) -> List[str]:  # type: ignore
    names: List[str] = []
    if isinstance(objs, list):
        for x in objs:
            if isinstance(x, str):
                names.append(x.lower().strip())
            elif isinstance(x, dict) and "name" in x:
                names.append(str(x["name"]).lower().strip())
    return list({n for n in names if n})


def _perception_via_openai(image_bytes: bytes) -> Dict[str, Any]:
    assert _openai_client is not None
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt = (
        "Analyze the image accurately. "
        + STRICT_SPEC
        + " Be careful with ambiguous items. If a 'brush' appears, decide if it's a paintbrush vs toothbrush vs hairbrush based on head/handle/usage cues. "
          "If a 'mouse' appears, prefer 'bilgisayar faresi' unless it's clearly an animal (tail, fur). "
          "Avoid guessing construction materials unless obvious (bricks, cement bags, helmets)."
    )
    try:
        resp = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You produce concise JSON only."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    ],
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        content = resp.choices[0].message.content or "{}"
        data = json.loads(content)
        objects = _normalize_objects(data.get("objects", []))
        return {
            "objects": objects,
            "scene": data.get("scene", ""),
            "context": data.get("context", ""),
            "certainty": data.get("certainty", 0.6),
            "provider": "openai",
        }
    except Exception:
        return {}


def _perception_via_gemini(image_bytes: bytes) -> Dict[str, Any]:
    assert _genai_model is not None
    prompt = (
        "Analyze the image accurately. "
        + STRICT_SPEC
        + " Be careful with ambiguous items (brush types, computer mouse vs animal)."
    )
    try:
        resp = _genai_model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes},
        ])
        text = None
        if hasattr(resp, "text") and resp.text:
            text = resp.text
        elif hasattr(resp, "candidates") and resp.candidates:
            cand = resp.candidates[0]
            parts = getattr(getattr(cand, "content", None), "parts", None)
            if parts and len(parts) > 0 and hasattr(parts[0], "text"):
                text = parts[0].text
        if not text:
            return {}
        data = json.loads(text)
        objects = _normalize_objects(data.get("objects", []))
        return {
            "objects": objects,
            "scene": data.get("scene", ""),
            "context": data.get("context", ""),
            "certainty": data.get("certainty", 0.6),
            "provider": "gemini",
        }
    except Exception:
        return {}


# Fallback stub

def _perception_stub(image_bytes: bytes) -> Dict[str, Any]:
    return {
        "objects": ["nesne"],
        "scene": "Bir iç mekân",
        "context": "Genel bağlam",
        "certainty": 0.5,
        "provider": "stub",
    }


def perception_agent(image_bytes: bytes) -> Dict[str, Any]:
    if USE_OPENAI and _openai_client is not None:
        data = _perception_via_openai(image_bytes)
        if data:
            return data
    if USE_GEMINI and _genai_model is not None:
        data = _perception_via_gemini(image_bytes)
        if data:
            return data
    return _perception_stub(image_bytes)


# Disambiguate & normalize labels stage
CANON = {
    "paintbrush": ["paint brush", "brush", "boya fırçası", "fırça", "şerit fırça"],
    "toothbrush": ["diş fırçası", "tooth brush"],
    "hairbrush": ["saç fırçası"],
    "computer mouse": ["mouse", "fare", "computer-mouse", "bilgisayar faresi"],
}


def _rule_normalize(objs: List[str]) -> List[str]:
    out: List[str] = []
    for o in objs:
        low = o.lower()
        mapped = None
        for k, vals in CANON.items():
            if low == k or any(low == v for v in vals) or any(v in low for v in vals):
                mapped = k
                break
        out.append(mapped or low)
    # simple cleanups
    cleaned = []
    for x in out:
        if x == "brush":
            cleaned.append("paintbrush")
        elif x == "mouse":
            cleaned.append("computer mouse")
        else:
            cleaned.append(x)
    # de-dup
    return list(dict.fromkeys(cleaned))


def normalize_scene(scene: Dict[str, Any]) -> Dict[str, Any]:
    objs = scene.get("objects", [])
    if not isinstance(objs, list):
        objs = []
    norm = _rule_normalize([str(x) for x in objs])
    scene = dict(scene)
    scene["objects"] = norm
    return scene


# Experience agent using available providers, else fallback

def _experience_with_openai(scene_json: Dict[str, Any]) -> str:
    assert _openai_client is not None
    style = (
        "Türkçe, kısa ve insani bir tonda yaz. 3 madde halinde pratik ve yaşanmışlık içeren öneriler ver. "
        "Gerçekçi ol, emin olmadığın yerde kibarca belirt. Abartma, pazarlama dili kullanma."
    )
    prompt = (
        f"{style}\nBağlam: {json.dumps(scene_json, ensure_ascii=False)}\n" 
        "Cevap formatı: her satır '• ' ile başlasın."
    )
    try:
        resp = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are helpful and grounded."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""
    except Exception:
        return ""


def _experience_with_gemini(scene_json: Dict[str, Any]) -> str:
    assert _genai_model is not None
    try:
        resp = _genai_model.generate_content([
            "Türkçe, 3 kısa maddeyle gerçek kullanıcı yorumlarına benzer, abartısız öneriler yaz.",
            json.dumps(scene_json, ensure_ascii=False),
        ])
        if hasattr(resp, "text") and resp.text:
            return resp.text
        return ""
    except Exception:
        return ""


def experience_agent(scene_json: Dict[str, Any]) -> str:
    scene_json = normalize_scene(scene_json)
    certainty = float(scene_json.get("certainty", 0.6) or 0.6)
    if certainty < 0.45:
        # Low confidence: be cautious
        objs = ", ".join(scene_json.get("objects", [])) or "belirsiz nesneler"
        return (
            "• Görseldeki nesneler tam seçilemiyor; farklı açı veya daha iyi ışıkla tekrar deneyin.\n"
            f"• Yakalanan ipuçları: {objs}. Emin olmadığım için ihtiyatlı yorum yapıyorum.\n"
            "• Ben olsam netlik için bir-iki kare daha çekip karşılaştırırdım."
        )
    if USE_OPENAI and _openai_client is not None:
        text = _experience_with_openai(scene_json)
        if text:
            return text
    if USE_GEMINI and _genai_model is not None:
        text = _experience_with_gemini(scene_json)
        if text:
            return text
    objs = ", ".join(scene_json.get("objects", [])) or "çeşitli ögeler"
    scene = scene_json.get("scene", "Bir sahne")
    return (
        f"• {scene} için, ortamı kısa süre gözlemleyip detayları yakalamak iyi sonuç verir.\n"
        f"• Fotoğrafta ({objs}) görülüyor; farklı açılar ve ışık deneyin.\n"
        f"• Emin olmadığınız noktada dürüstçe belirtin; deneyimi kişisel gözlemlerle destekleyin."
    )


def verifier_agent(scene_json: Dict[str, Any], experience_text: str) -> str:
    # Simple pass-through; could add safety/grounding checks later
    return experience_text


def analyze_image_chain(image_bytes: bytes) -> Dict[str, Any]:
    scene_json = refined_perception_agent(image_bytes)
    experience_text = experience_agent(scene_json)
    verified_text = verifier_agent(scene_json, experience_text)
    return {"perception": scene_json, "experience": verified_text}


# --- Ambiguity & refinement additions ---
AMBIGUOUS_BASE = {"brush", "mouse"}

REFINE_PROMPT = (
    "Ön algı nesnelerinde belirsiz öğeler var. 'brush' gördüysen türünü ayır: paintbrush (boya fırçası), toothbrush (diş fırçası), hairbrush (saç fırçası). "
    "'mouse' gördüysen bilgisayar faresi mi hayvan mı ayır. İpucu: masa, klavye, laptop, kablo => computer mouse. "
    "Yalnızca JSON döndür. Aynı şema: objects, scene, context, certainty. Fazla nesne ekleme, sadece düzelt."
)


def _needs_refine(scene_json: Dict[str, Any]) -> bool:
    objs = [o.lower() for o in scene_json.get("objects", []) if isinstance(o, str)]
    return any(o in AMBIGUOUS_BASE for o in objs)


def _refine_with_openai(scene_json: Dict[str, Any], image_bytes: bytes) -> Dict[str, Any]:
    if not (_openai_client and USE_OPENAI):
        return scene_json
    try:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        prompt = (
            REFINE_PROMPT + "\nÖn Algı JSON:" + json.dumps(scene_json, ensure_ascii=False)
        )
        resp = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You refine existing JSON only."},
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                ]},
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        content = resp.choices[0].message.content or "{}"
        data = json.loads(content)
        if data.get("objects"):
            return data
    except Exception:
        pass
    return scene_json


def _refine_with_gemini(scene_json: Dict[str, Any], image_bytes: bytes) -> Dict[str, Any]:
    if not (_genai_model and USE_GEMINI):
        return scene_json
    try:
        resp = _genai_model.generate_content([
            REFINE_PROMPT + "\nÖn Algı JSON:" + json.dumps(scene_json, ensure_ascii=False),
            {"mime_type": "image/jpeg", "data": image_bytes},
        ])
        text = getattr(resp, "text", None)
        if not text and getattr(resp, "candidates", None):
            cand = resp.candidates[0]
            parts = getattr(getattr(cand, "content", None), "parts", None)
            if parts and len(parts) > 0 and hasattr(parts[0], "text"):
                text = parts[0].text
        if text:
            data = json.loads(text)
            if data.get("objects"):
                return data
    except Exception:
        pass
    return scene_json


# Rule-based post adjustments using context keywords
_KEYBOARD_CTX = {"keyboard", "klavye", "laptop", "bilgisayar", "monitor", "masa", "desk"}
_PAINT_CTX = {"paint", "boya", "canvas", "tuval", "palette", "palet"}
_HAIR_CTX = {"hair", "saç", "tarak", "mirror", "ayna"}
_TOOTH_CTX = {"tooth", "diş", "bathroom", "banyo", "lavabo"}


def _post_rules(scene_json: Dict[str, Any]) -> Dict[str, Any]:
    objs = [o.lower() for o in scene_json.get("objects", []) if isinstance(o, str)]
    ctx_blob = (scene_json.get("scene", "") + " " + scene_json.get("context", "")).lower()
    def has_any(words):
        return any(w in ctx_blob for w in words)
    fixed = []
    for o in objs:
        if o == "brush":
            if has_any(_PAINT_CTX):
                fixed.append("paintbrush")
            elif has_any(_HAIR_CTX):
                fixed.append("hairbrush")
            elif has_any(_TOOTH_CTX):
                fixed.append("toothbrush")
            else:
                fixed.append("paintbrush")  # varsayılan daha güvenli
        elif o == "mouse":
            if has_any(_KEYBOARD_CTX):
                fixed.append("computer mouse")
            else:
                fixed.append("computer mouse")  # hayvanı çok yanlışlama riskine karşı
        else:
            fixed.append(o)
    scene_json = dict(scene_json)
    scene_json["objects"] = list(dict.fromkeys(fixed))
    return scene_json


# Patch perception_agent to include refinement
orig_perception_agent = perception_agent

def refined_perception_agent(image_bytes: bytes) -> Dict[str, Any]:
    scene_json = orig_perception_agent(image_bytes)
    if _needs_refine(scene_json):
        if USE_OPENAI:
            scene_json = _refine_with_openai(scene_json, image_bytes)
        elif USE_GEMINI:
            scene_json = _refine_with_gemini(scene_json, image_bytes)
    scene_json = normalize_scene(scene_json)
    scene_json = _post_rules(scene_json)
    return scene_json
