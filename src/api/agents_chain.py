import os
import json
import base64
from typing import Dict, Any

# Provider flags (optional)
USE_OPENAI = bool(os.getenv("OPENAI_API_KEY"))
USE_GEMINI = bool(os.getenv("GEMINI_API_KEY")) and not USE_OPENAI

# Optional imports
_openai_client = None
_genai_model = None

if USE_OPENAI:
    try:
        from openai import OpenAI  # SDK v1.x
        _openai_client = OpenAI()
    except Exception:
        _openai_client = None
        USE_OPENAI = False

if USE_GEMINI:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        _genai_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
    except Exception:
        _genai_model = None
        USE_GEMINI = False


def _perception_via_openai(image_bytes: bytes) -> Dict[str, Any]:
    assert _openai_client is not None
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt = (
        "Analyze the image and return pure JSON with keys: "
        "objects (array of strings), scene (string), context (string). "
        "Do not include any extra keys."
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
            temperature=0.2,
        )
        content = resp.choices[0].message.content or "{}"
        data = json.loads(content)
        return {
            "objects": data.get("objects", []),
            "scene": data.get("scene", ""),
            "context": data.get("context", ""),
        }
    except Exception:
        return {}


def _perception_via_gemini(image_bytes: bytes) -> Dict[str, Any]:
    assert _genai_model is not None
    prompt = (
        "Analyze the image and return JSON with keys: objects(array), scene(string), context(string)."
    )
    try:
        resp = _genai_model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes},
        ])
        text = getattr(resp, "text", None) or getattr(resp, "candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
        data = json.loads(text)
        return {
            "objects": data.get("objects", []),
            "scene": data.get("scene", ""),
            "context": data.get("context", ""),
        }
    except Exception:
        return {}


# Fallback stub

def _perception_stub(image_bytes: bytes) -> Dict[str, Any]:
    return {
        "objects": ["sahne", "foto"],
        "scene": "Fotoğraf sahnesi",
        "context": "Genel bağlam",
    }


def perception_agent(image_bytes: bytes) -> Dict[str, Any]:
    if USE_OPENAI:
        data = _perception_via_openai(image_bytes)
        if data:
            return data
    if USE_GEMINI:
        data = _perception_via_gemini(image_bytes)
        if data:
            return data
    return _perception_stub(image_bytes)

# Experience & verifier stay the same below
from typing import Dict as _Dict, Any as _Any
try:
    from langchain_openai import OpenAI as _LCOpenAI
    from pydantic import SecretStr as _SecretStr
    from langchain.prompts import PromptTemplate as _PromptTemplate
    _HAS_LC = True
except Exception:
    _HAS_LC = False

if _HAS_LC and os.getenv("OPENAI_API_KEY"):
    experience_prompt = _PromptTemplate(
        input_variables=["scene_json"],
        template=(
            "You are an AI experience consultant. Interpret the scene like a human, "
            "providing experiential insights, tips, and potential emotional experiences. Avoid technical jargon or hallucinated facts. "
            "If unsure, say so politely.\nScene JSON: {scene_json}\nGive your answer in Turkish with 3 short bullet insights."
        ),
    )
    _llm = _LCOpenAI(temperature=0.2, top_p=0.9, api_key=_SecretStr(os.getenv("OPENAI_API_KEY", "")))

    def experience_agent(scene_json: _Dict[str, _Any]) -> str:
        prompt = experience_prompt.format(scene_json=scene_json)
        return _llm(prompt)  # type: ignore
else:
    def experience_agent(scene_json: _Dict[str, _Any]) -> str:  # type: ignore
        objs = ", ".join(scene_json.get("objects", [])) or "çeşitli ögeler"
        scene = scene_json.get("scene", "Bir sahne")
        return (
            f"• {scene} için en iyi deneyim, ortamı kısa süre gözlemleyip detayları yakalamaktır.\n"
            f"• Fotoğrafta görülen ({objs}) temelinde farklı açılar deneyin; sabah/akşam ışığı çok fark yaratır.\n"
            f"• Emin olmadığınız noktalarda güvenli kalın; deneyimi paylaşırken kişisel gözleminizi ekleyin."
        )


def verifier_agent(scene_json: _Dict[str, _Any], experience_text: str) -> str:
    return experience_text


def analyze_image_chain(image_bytes: bytes) -> Dict[str, Any]:
    scene_json = perception_agent(image_bytes)
    experience_text = experience_agent(scene_json)
    verified_text = verifier_agent(scene_json, experience_text)
    return {"perception": scene_json, "experience": verified_text}
