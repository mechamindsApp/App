import os
from typing import Dict, Any

try:
    from langchain_openai import OpenAI
    from pydantic import SecretStr
    from langchain.prompts import PromptTemplate
    HAS_OPENAI = True
except Exception:
    HAS_OPENAI = False

# Vision agent (mock/stub)
# In a real setup, replace with OpenAI Vision / Gemini call using image_bytes

def perception_agent(image_bytes: bytes) -> Dict[str, Any]:
    # Minimal heuristic stub; replace with real vision model
    # Avoid heavy libs to keep example portable
    return {
        "objects": ["sahne", "foto"],
        "scene": "Fotoğraf sahnesi",
        "context": "Genel bağlam"
    }

if HAS_OPENAI:
    experience_prompt = PromptTemplate(
        input_variables=["scene_json"],
        template=(
            "You are an AI experience consultant. Interpret the scene like a human, "
            "providing experiential insights, tips, and potential emotional experiences. "
            "Avoid technical jargon or hallucinated facts. If unsure, say so politely.\n"
            "Scene JSON: {scene_json}\n"
            "Give your answer in Turkish with 3 short bullet insights."
        )
    )
    llm = OpenAI(temperature=0.2, top_p=0.9, api_key=SecretStr(os.getenv("OPENAI_API_KEY", "")))

    def experience_agent(scene_json: Dict[str, Any]) -> str:
        prompt = experience_prompt.format(scene_json=scene_json)
        return llm(prompt)  # type: ignore
else:
    def experience_agent(scene_json: Dict[str, Any]) -> str:  # type: ignore
        # Deterministic fallback without API key
        objs = ", ".join(scene_json.get("objects", [])) or "çeşitli ögeler"
        scene = scene_json.get("scene", "Bir sahne")
        return (
            f"• {scene} için en iyi deneyim, ortamı kısa süre gözlemleyip detayları yakalamaktır.\n"
            f"• Fotoğrafta görülen ({objs}) temelinde farklı açılar deneyin; sabah/akşam ışığı çok fark yaratır.\n"
            f"• Emin olmadığınız noktalarda güvenli kalın; deneyimi paylaşırken kişisel gözleminizi ekleyin."
        )

# Verifier agent (simple pass-through to keep MVP fast)

def verifier_agent(scene_json: Dict[str, Any], experience_text: str) -> str:
    # In real setup, run another LLM pass to check consistency.
    return experience_text

# Main chain

def analyze_image_chain(image_bytes: bytes) -> Dict[str, Any]:
    scene_json = perception_agent(image_bytes)
    experience_text = experience_agent(scene_json)
    verified_text = verifier_agent(scene_json, experience_text)
    return {"perception": scene_json, "experience": verified_text}
