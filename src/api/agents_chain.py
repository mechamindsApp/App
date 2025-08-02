from langchain_openai import OpenAI
from pydantic import SecretStr
from langchain.prompts import PromptTemplate
import os

# Vision agent (mock)
def perception_agent(image_bytes):
    # Gerçek Vision API entegrasyonu burada olmalı
    # Örnek JSON çıktısı
    return {
        "objects": ["araba", "yol", "gündüz"],
        "scene": "Yolda bir araba",
        "context": "Gündüz, açık hava"
    }

# Experience agent
experience_prompt = PromptTemplate(
    input_variables=["scene_json"],
    template=(
        "You are an AI experience consultant. Your task is to interpret the scene like a human, "
        "providing experiential insights, tips, and potential emotional experiences. Avoid technical jargon or hallucinated facts. "
        "If unsure, say so politely.\n"
        "Scene JSON: {scene_json}\n"
        "Give your answer in Turkish."
    )
)
llm = OpenAI(temperature=0.2, top_p=0.9, api_key=SecretStr(os.getenv("OPENAI_API_KEY", "")))

def experience_agent(scene_json):
    prompt = experience_prompt.format(scene_json=scene_json)
    return llm(prompt)

# Verifier agent
verifier_prompt = PromptTemplate(
    input_variables=["scene_json", "experience_text"],
    template=(
        "Check if the experiential output is logically consistent with the scene JSON. If not, revise.\n"
        "Scene JSON: {scene_json}\n"
        "Experience Output: {experience_text}\n"
        "Give your answer in Turkish."
    )
)

def verifier_agent(scene_json, experience_text):
    prompt = verifier_prompt.format(scene_json=scene_json, experience_text=experience_text)
    return llm(prompt)

# Main chain

def analyze_image_chain(image_bytes):
    scene_json = perception_agent(image_bytes)
    experience_text = experience_agent(scene_json)
    verified_text = verifier_agent(scene_json, experience_text)
    return verified_text
