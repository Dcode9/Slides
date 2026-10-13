import os
import json
import win32com.client
from slidecraft.schema.compiler import compile_presentation_from_dict

spec = {
    "theme": {
        "palette": "obsidian_cyber",
        "fonts": "modern_tech"
    },
    "aspect_ratio": "16:9",
    "slides": [
        {
            "type": "hero",
            "eyebrow": "AUTONOMOUS DESIGN HARNESS",
            "title": "Engineering Native Presentations with AI",
            "subtitle": "Bypassing legacy template engines to compile OpenXML DrawingML, SMIL animations, and fluid Morph transitions.",
            "presenter": "Antigravity Research Labs",
            "date": "October 2026",
            "accent_badge": "SLIDECRAFT V2.0",
            "image_path": os.path.abspath("images/sikkim_landscape.jpg"),
            "transition": "fade"
        },
        {
            "type": "metrics",
            "category": "PERFORMANCE & QUALITY BENCHMARKS",
            "title": "Zero Repair Errors. Pure Native DrawingML.",
            "subtitle": "Rigorous compilation benchmarks across 1,000 stress-tested presentations.",
            "items": [
                {
                    "value": "0",
                    "label": "XML SCHEMA CORRUPTIONS",
                    "delta": "100% Valid",
                    "delta_positive": True,
                    "icon": "shield",
                    "highlight": True,
                    "sub_caption": "Strict element ordering adheres to ISO/IEC 29500-1 specification."
                },
                {
                    "value": "12ms",
                    "label": "GENERATION SPEED",
                    "delta": "Sub-Second",
                    "delta_positive": True,
                    "icon": "zap",
                    "sub_caption": "Direct memory compilation without slow PowerPoint headless browser renders."
                },
                {
                    "value": "60+",
                    "label": "NATIVE VECTOR ASSETS",
                    "delta": "Lossless",
                    "delta_positive": True,
                    "icon": "cpu",
                    "sub_caption": "SVG cubic bezier & elliptical arc path conversion directly to custom geometry."
                }
            ],
            "transition": "morph"
        },
        {
            "type": "bento",
            "category": "MODULAR ARCHITECTURE",
            "title": "Asymmetric Spatial Bento Layouts",
            "subtitle": "Guiding audience attention through structured visual containers rather than bare bullets.",
            "layout": "hero_left",
            "items": [
                {
                    "type": "metric",
                    "value": "100%",
                    "label": "VECTOR ACCURACY",
                    "body": "Converts standard SVG path coordinates into integer DrawingML path units with zero raster pixelation.",
                    "icon": "sparkles"
                },
                {
                    "title": "Native Morph Interpolation",
                    "body": "Pairs OpenXML shape tokens across slides for cinematic spatial movement and continuity.",
                    "icon": "layers",
                    "tag": "SPATIAL MOTION"
                },
                {
                    "title": "Adaptive Color Science",
                    "body": "Semantic 12-color palettes dynamically adjust contrast, surface levels, and dark/light modes.",
                    "icon": "box",
                    "tag": "DESIGN SYSTEM"
                }
            ],
            "transition": "morph"
        },
        {
            "type": "comparison",
            "category": "PARADIGM SHIFT",
            "title": "Standard AI Slides vs. SlideCraft Native Engine",
            "subtitle": "A side-by-side technical evaluation of presentation generation architectures.",
            "left": {
                "tag": "LEGACY WRAPPERS & TEMPLATES",
                "title": "Template Hacks & Flat Bullets",
                "points": [
                    "Plain unstyled text boxes on bare backgrounds",
                    "Inverted XML tags triggering repair dialogs",
                    "SVGs flattened into blurry 72 DPI PNGs",
                    "Zero motion: no Morph or timed animations",
                    "Brittle coordinate guessing causing overlaps"
                ]
            },
            "right": {
                "tag": "NATIVE COMPILATION ENGINE",
                "title": "DrawingML & SMIL AST Compiler",
                "points": [
                    "Elevated bento containers & glassmorphic cards",
                    "Strict ISO/IEC 29500-1 schema validation",
                    "Hardware-accelerated custom geometry vector paths",
                    "Full SMIL time tree with sequential click triggers",
                    "Deterministic EMU layout solver with 0 collisions"
                ]
            },
            "transition": "morph"
        },
        {
            "type": "timeline",
            "category": "AUTONOMOUS PIPELINE",
            "title": "Multi-Model Synthesis Lifecycle",
            "subtitle": "How multimodal AI models orchestrate from raw prompt to compiled PPTX.",
            "items": [
                {
                    "date": "PHASE 01",
                    "title": "Semantic Intent",
                    "body": "LLM plans narrative flow, slide count, and selects archetype layouts.",
                    "icon": "brain"
                },
                {
                    "date": "PHASE 02",
                    "title": "Multimodal Synthesis",
                    "body": "Generates high-res photography, custom SVG icons, and copy text.",
                    "icon": "sparkles"
                },
                {
                    "date": "PHASE 03",
                    "title": "EMU Spatial Solver",
                    "body": "Computes exact pixel bounds, card padding, and typography scaling.",
                    "icon": "target"
                },
                {
                    "date": "PHASE 04",
                    "title": "OpenXML Packaging",
                    "body": "Assembles DrawingML trees, Morph IDs, and streams into ZIP container.",
                    "icon": "rocket"
                }
            ],
            "transition": "morph"
        },
        {
            "type": "quote",
            "category": "THE FUTURE OF KNOWLEDGE WORK",
            "title": "The End of Manual Presentation Formatting",
            "subtitle": "Transforming complex human insights into visual impact.",
            "quote": "Presentations are spatial stories. By giving AI direct control over the native OpenXML vector canvas, we bridge the gap between pure thought and publication-grade visual communication.",
            "author": "SlideCraft Engineering",
            "author_title": "Antigravity Advanced Agentic Systems",
            "transition": "morph"
        }
    ]
}

os.makedirs("output_presentations", exist_ok=True)
pptx_path = os.path.abspath("output_presentations/SlideCraft_AI_Native_Showcase.pptx")
print(f"Compiling presentation to {pptx_path}...")
compile_presentation_from_dict(spec, pptx_path)
print("PPTX compiled successfully!")

# Export slide screenshots using PowerPoint COM
render_dir = os.path.abspath("test_output/demo_rendered_slides")
os.makedirs(render_dir, exist_ok=True)

print("Opening in PowerPoint Desktop COM to export 1080p slide screenshots...")
ppt = win32com.client.Dispatch("PowerPoint.Application")
try:
    pres = ppt.Presentations.Open(pptx_path, ReadOnly=True, WithWindow=False)
    for i in range(1, pres.Slides.Count + 1):
        out_png = os.path.join(render_dir, f"slide_{i}.png")
        pres.Slides(i).Export(out_png, "PNG", 1920, 1080)
        print(f"Exported Slide {i} -> {out_png}")
    pres.Close()
finally:
    ppt.Quit()

print("All slides exported successfully!")
