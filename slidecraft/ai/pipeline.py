"""End-to-end multi-model presentation generation pipeline."""

import os
import argparse
import logging
from typing import Optional, Dict, Any

from slidecraft.ai.llm import get_llm_provider
from slidecraft.ai.images import ImageGenerator
from slidecraft.schema.compiler import compile_presentation_from_dict
from slidecraft.schema.models import PresentationSpec

logger = logging.getLogger("slidecraft.ai.pipeline")

class AIPipeline:
    """Orchestrates multi-model presentation generation from user prompt to final .pptx."""
    
    def __init__(self, provider_name: Optional[str] = None):
        self.llm = get_llm_provider(provider_name)
        self.image_gen = ImageGenerator()

    def run(
        self,
        prompt: str,
        output_path: str = "output_presentations/AI_Generated_Presentation.pptx",
        slide_count: int = 5,
        generate_images: bool = True
    ) -> str:
        """Execute end-to-end generation."""
        print(f"\n[1/3] Synthesizing narrative structure with LLM ({type(self.llm).__name__})...")
        spec: Dict[str, Any] = self.llm.generate_spec(prompt, slide_count=slide_count)
        title = spec.get("title", "Presentation")
        palette = spec.get("palette", "linear_enterprise")
        font = spec.get("font_pairing", "modern_tech")
        slides = spec.get("slides", [])
        print(f"      Deck Title: '{title}'")
        print(f"      Palette: {palette} | Font: {font} | Slides: {len(slides)}")

        # Check for image generation needs
        if generate_images:
            print("\n[2/3] Checking visual asset requirements...")
            for idx, slide in enumerate(slides):
                if slide.get("type") == "hero" and not slide.get("image_path"):
                    print(f"      Generating hero asset for Slide {idx + 1}...")
                    img_path = self.image_gen.generate_image(
                        prompt=f"{title} - {slide.get('title', '')}",
                        filename=f"slide_{idx + 1}_hero.png"
                    )

        print("\n[3/3] Compiling DrawingML, SMIL timing tree & OPC package...")
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        deck = compile_presentation_from_dict(spec, output_path)
        print(f"      Success! Saved presentation to: {output_path}")
        return output_path

def generate_presentation_from_prompt(
    prompt: str,
    output_path: str = "output_presentations/AI_Generated_Presentation.pptx",
    provider: Optional[str] = None,
    slide_count: int = 5
) -> str:
    """Convenience helper function."""
    pipeline = AIPipeline(provider_name=provider)
    return pipeline.run(prompt=prompt, output_path=output_path, slide_count=slide_count)

def main():
    parser = argparse.ArgumentParser(description="SlideCraft AI: Multi-Model Presentation Harness")
    parser.add_argument("prompt", help="Prompt or topic for presentation")
    parser.add_argument("-o", "--output", default="output_presentations/AI_Generated_Presentation.pptx", help="Output .pptx path")
    parser.add_argument("-p", "--provider", default=None, help="LLM provider: 'gemini', 'claude', 'openai', or 'offline'")
    parser.add_argument("-n", "--slides", type=int, default=5, help="Target number of slides")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    generate_presentation_from_prompt(
        prompt=args.prompt,
        output_path=args.output,
        provider=args.provider,
        slide_count=args.slides
    )

if __name__ == "__main__":
    main()
