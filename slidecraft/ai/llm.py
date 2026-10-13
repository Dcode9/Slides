"""Unified LLM client for generating structured SlideCraft presentation specifications."""

import os
import json
import logging
from typing import Dict, Any, Optional

import requests
from slidecraft.schema.models import PresentationSpec

logger = logging.getLogger("slidecraft.ai.llm")

SYSTEM_PROMPT = """You are an elite keynote presentation designer and slide architect.
Generate a cohesive, visually compelling presentation in strict JSON adhering to the SlideCraft PresentationSpec schema.

Guidelines:
1. Choose an appropriate palette:
   - 'obsidian_cyber': dark cyberpunk / AI / security / deep tech
   - 'linear_enterprise': modern sleek dark / SaaS / developer platforms
   - 'silicon_bento': dark slate & emerald / product pitch decks
   - 'warm_editorial': sophisticated light cream / culture / luxury / editorial
   - 'nordic_minimalist': ultra-clean light slate / research / corporate
   - 'sunset_horizon': energetic dark navy & coral / consumer products

2. Choose font pairing:
   - 'modern_tech': Inter + Space Grotesk
   - 'corporate_clean': Helvetica / Arial + Segoe UI
   - 'editorial_serif': Georgia + Garamond
   - 'bold_display': Montserrat + Roboto

3. Structure the narrative arc across 4 to 6 slides:
   - Slide 1: 'hero' title slide with dramatic headline and subtitle
   - Slide 2: 'cards' or 'comparison' establishing the challenge or landscape
   - Slide 3: 'bento' or 'timeline' detailing architecture, mechanism, or journey
   - Slide 4: 'metrics' highlighting proof points and quantified impact
   - Slide 5: 'quote' or 'hero' conclusion synthesizing the takeaway

4. Always output ONLY valid JSON matching the PresentationSpec format without markdown fences or extraneous text.
"""

class LLMProvider:
    """Base class for presentation generation LLM providers."""
    def generate_spec(self, user_prompt: str, slide_count: int = 5) -> PresentationSpec:
        raise NotImplementedError

class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider using google-genai SDK or direct REST API."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = model

    def generate_spec(self, user_prompt: str, slide_count: int = 5) -> PresentationSpec:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\nUser Request: Create a {slide_count}-slide presentation about: {user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        res = requests.post(url, json=payload, timeout=60)
        res.raise_for_status()
        data = res.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        spec_dict = json.loads(raw_text)
        return spec_dict

class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider via REST API."""
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-7-sonnet-20250219"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model

    def generate_spec(self, user_prompt: str, slide_count: int = 5) -> PresentationSpec:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is not configured.")
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "max_tokens": 4096,
            "system": SYSTEM_PROMPT,
            "messages": [
                {"role": "user", "content": f"Create a {slide_count}-slide presentation about: {user_prompt}\nReturn valid JSON only."}
            ]
        }
        res = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        raw_text = res.json()["content"][0]["text"]
        clean_json = raw_text.strip()
        if clean_json.startswith("```"):
            lines = clean_json.split("\n")
            clean_json = "\n".join(lines[1:-1])
        spec_dict = json.loads(clean_json)
        return spec_dict

class OpenAIProvider(LLMProvider):
    """OpenAI / OpenRouter compatible REST provider."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o", base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self.base_url = base_url.rstrip("/")

    def generate_spec(self, user_prompt: str, slide_count: int = 5) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Create a {slide_count}-slide presentation about: {user_prompt}"}
            ],
            "response_format": {"type": "json_object"}
        }
        res = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        raw_text = res.json()["choices"][0]["message"]["content"]
        spec_dict = json.loads(raw_text)
        return spec_dict

class OfflineMockProvider(LLMProvider):
    """Deterministic offline fallback provider for zero-API-key testing and benchmarks."""
    def generate_spec(self, user_prompt: str, slide_count: int = 5) -> PresentationSpec:
        topic = user_prompt.strip().capitalize() if user_prompt else "Autonomous AI Systems"
        spec_dict = {
            "title": f"{topic} Executive Deck",
            "palette": "linear_enterprise",
            "font_pairing": "modern_tech",
            "slides": [
                {
                    "type": "hero",
                    "title": topic,
                    "subtitle": f"Strategic overview, architecture, and quantitative milestones for {topic.lower()}.",
                    "eyebrow": "EXECUTIVE BRIEFING • 2026",
                    "presenter": "Antigravity Research",
                    "date": "October 2026",
                    "accent_badge": "CONFIDENTIAL"
                },
                {
                    "type": "cards",
                    "category": "CURRENT CHALLENGES",
                    "title": f"The Landscape of {topic}",
                    "subtitle": "Critical friction points identified across industry implementations.",
                    "columns": 3,
                    "cards": [
                        {
                            "title": "Scale Bottlenecks",
                            "body": "Throughput limits under high concurrency and distributed state coordination.",
                            "badge": "THROUGHPUT",
                            "highlight": False
                        },
                        {
                            "title": "Data Governance",
                            "body": "Maintaining strict privacy boundaries across heterogeneous model providers.",
                            "badge": "COMPLIANCE",
                            "highlight": True
                        },
                        {
                            "title": "Latency Overhead",
                            "body": "Real-time edge synthesis requirements outpacing cloud inference latency.",
                            "badge": "LATENCY",
                            "highlight": False
                        }
                    ]
                },
                {
                    "type": "timeline",
                    "category": "EXECUTION TIMELINE",
                    "title": "Strategic Implementation Roadmap",
                    "subtitle": "Four milestone phases delivering continuous value and risk reduction.",
                    "steps": [
                        {
                            "step_number": "01",
                            "title": "Foundations",
                            "description": "Core architecture hardening and deterministic schema stabilization."
                        },
                        {
                            "step_number": "02",
                            "title": "Integration",
                            "description": "Multi-agent synthesis workflows and vector asset compilation."
                        },
                        {
                            "step_number": "03",
                            "title": "Validation",
                            "description": "Automated regression testing across Office 365 and web engines."
                        },
                        {
                            "step_number": "04",
                            "title": "Production",
                            "description": "Global multi-region deployment with sub-second turnaround."
                        }
                    ]
                },
                {
                    "type": "metrics",
                    "category": "MEASURED IMPACT",
                    "title": "Key Performance Indicators",
                    "subtitle": "Quantified outcomes across speed, reliability, and precision benchmarks.",
                    "metrics": [
                        {
                            "value": "99.98%",
                            "label": "Reliability Rate",
                            "delta": "+4.2%",
                            "delta_positive": True,
                            "sub_caption": "Zero runtime unhandled exceptions",
                            "highlight": True
                        },
                        {
                            "value": "< 15ms",
                            "label": "Compile Latency",
                            "delta": "10x FASTER",
                            "delta_positive": True,
                            "sub_caption": "In-memory DrawingML AST assembly"
                        },
                        {
                            "value": "100%",
                            "label": "XML Compliance",
                            "delta": "ISO 29500-1",
                            "delta_positive": True,
                            "sub_caption": "Strict schema validation pass"
                        }
                    ]
                },
                {
                    "type": "quote",
                    "category": "FINAL PERSPECTIVE",
                    "title": "The Strategic Horizon",
                    "subtitle": "Guiding principles for the next era of development.",
                    "quote": f"Transforming {topic.lower()} into an ambient capability requires deterministic precision beneath creative intelligence.",
                    "author": "Chief Systems Architect",
                    "author_title": "Antigravity Research Group"
                }
            ]
        }
        return spec_dict

def get_llm_provider(name: Optional[str] = None) -> LLMProvider:
    """Factory retrieving the configured LLM provider based on env vars or explicit request."""
    if name:
        n = name.lower()
        if "gemini" in n or "google" in n:
            return GeminiProvider()
        elif "claude" in n or "anthropic" in n:
            return AnthropicProvider()
        elif "openai" in n or "gpt" in n:
            return OpenAIProvider()
        elif "offline" in n or "mock" in n:
            return OfflineMockProvider()
    
    # Auto-detection from environment
    if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
        return GeminiProvider()
    elif os.getenv("ANTHROPIC_API_KEY"):
        return AnthropicProvider()
    elif os.getenv("OPENAI_API_KEY"):
        return OpenAIProvider()
    
    # Fallback to offline mock provider if no API keys configured
    return OfflineMockProvider()
