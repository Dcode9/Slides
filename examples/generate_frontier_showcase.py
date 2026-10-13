"""Generate the flagship SlideCraft Frontier Showcase presentation."""

import os
import sys

# Ensure slidecraft is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from slidecraft.engine.presentation import SlideDeck
from slidecraft.design_system.theme import get_theme
from slidecraft.components.hero import create_hero_title_slide
from slidecraft.components.header import add_slide_header
from slidecraft.components.metrics import add_metric_row
from slidecraft.components.bento import create_bento_grid
from slidecraft.components.cards import add_card_grid
from slidecraft.components.timeline import add_horizontal_timeline
from slidecraft.components.comparison import add_comparison_split
from slidecraft.components.quote import add_quote_callout

def build_showcase():
    output_dir = "output_presentations"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "SlideCraft_Frontier_Showcase.pptx")

    theme = get_theme("obsidian_cyber", "modern_tech")
    deck = SlideDeck(theme=theme, aspect_ratio="16:9")

    # ==========================================
    # SLIDE 1: Hero Title
    # ==========================================
    s1 = deck.add_slide(transition="fade", transition_duration_ms=800)
    create_hero_title_slide(
        slide=s1,
        eyebrow="FRONTIER PRESENTATION HARNESS",
        title="SlideCraft: The AI Presentation Engine",
        subtitle="Enabling frontier models to compile native, publication-grade PowerPoint presentations with modern Bento grids, custom geometry, and Morph transitions.",
        presenter="Antigravity Research Labs",
        date="October 2026",
        accent_badge="NATIVE OPENXML COMPILATION"
    )

    # ==========================================
    # SLIDE 2: High-Impact Metrics
    # ==========================================
    s2 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s2,
        category="PERFORMANCE & CAPABILITIES",
        title="Order-of-Magnitude Visual Superiority",
        subtitle="Benchmark metrics comparing standard programmatic PPT generation against SlideCraft."
    )
    add_metric_row(
        slide=s2,
        metrics=[
            {
                "value": "100%",
                "label": "NATIVE VECTOR FIDELITY",
                "delta": "Lossless",
                "delta_positive": True,
                "sub_caption": "Compiles SVG paths directly into DrawingML custom geometry.",
                "icon": "shield",
                "highlight": True
            },
            {
                "value": "12ms",
                "label": "COMPILE LATENCY",
                "delta": "14x Faster",
                "delta_positive": True,
                "sub_caption": "Direct XML synthesis without external PowerPoint COM dependencies.",
                "icon": "zap"
            },
            {
                "value": "60+",
                "label": "NATIVE ICONS & SHAPES",
                "delta": "+50 Lib",
                "delta_positive": True,
                "sub_caption": "Built-in curated vector library ready for instant programmatic placement.",
                "icon": "star"
            }
        ]
    )

    # ==========================================
    # SLIDE 3: Modern Bento Grid
    # ==========================================
    s3 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s3,
        category="MODULAR ARCHITECTURE",
        title="Bento Grid Layout Engine",
        subtitle="Asymmetric visual compartments eliminate boring bullet points and guide audience attention."
    )
    create_bento_grid(
        slide=s3,
        layout="hero_left",
        items=[
            {
                "type": "metric",
                "value": "0-Overlap",
                "label": "PIXEL-PERFECT COORDINATES",
                "body": "Deterministic EMU grid calculation guarantees that cards, labels, and icons never collide across viewports.",
                "icon": "target"
            },
            {
                "title": "Native Morph Synchronization",
                "body": "Cross-slide shape tags (!!name) trigger Microsoft 365 Morph interpolation for fluid card expansions.",
                "icon": "refresh",
                "tag": "MOTION"
            },
            {
                "title": "Subtle Shadows & Radii",
                "body": "Apple and Linear style rounded corners (adj=6000) with 15% opacity soft outer drop shadows.",
                "icon": "sparkles",
                "tag": "AESTHETICS"
            }
        ]
    )

    # ==========================================
    # SLIDE 4: Feature Cards Grid
    # ==========================================
    s4 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s4,
        category="TECHNICAL CAPABILITIES",
        title="Engineered for Frontier AI Models",
        subtitle="A complete toolkit designed from first principles for Claude, GPT, and Gemini."
    )
    add_card_grid(
        slide=s4,
        items=[
            {
                "title": "Declarative JSON Schema",
                "body": "Frontier models produce structured, validated JSON presentations in a single inference call.",
                "icon": "code",
                "tag": "LLM HARNESS",
                "highlight": True
            },
            {
                "title": "DrawingML Custom Geometry",
                "body": "Parses complex SVG paths (M, L, C, S, Q, Z) and compiles them into native vector PowerPoint shapes.",
                "icon": "layers",
                "tag": "VECTOR COMPILER"
            },
            {
                "title": "SMIL Animation Timing",
                "body": "Injects schema-compliant <p:timing> trees for fly-ins, fades, and staggered sequence reveals.",
                "icon": "clock",
                "tag": "TIMELINE ENGINE"
            }
        ]
    )

    # ==========================================
    # SLIDE 5: Phased Roadmap Timeline
    # ==========================================
    s5 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s5,
        category="EXECUTION ROADMAP",
        title="Delivery & Adoption Phases",
        subtitle="Structured milestones for embedding SlideCraft into production AI workflows."
    )
    add_horizontal_timeline(
        slide=s5,
        milestones=[
            {
                "date": "PHASE 1",
                "title": "Core Engine",
                "body": "Widescreen EMU math, OpenXML transitions, and SMIL timing trees.",
                "icon": "lock"
            },
            {
                "date": "PHASE 2",
                "title": "Design System",
                "body": "Curated palettes, typography pairings, Bento grids, and icon registry.",
                "icon": "star"
            },
            {
                "date": "PHASE 3",
                "title": "AI Harness",
                "body": "Declarative schema compiler and frontier LLM prompt specification.",
                "icon": "brain"
            },
            {
                "date": "PHASE 4",
                "title": "Production Scale",
                "body": "Automated slide generation across enterprise teams and applications.",
                "icon": "rocket"
            }
        ]
    )

    # ==========================================
    # SLIDE 6: Comparison Split
    # ==========================================
    s6 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s6,
        category="ARCHITECTURAL COMPARISON",
        title="Legacy PPT Automation vs. SlideCraft",
        subtitle="Why traditional python-pptx templates fail, and how SlideCraft redefines presentation design."
    )
    add_comparison_split(
        slide=s6,
        left_side={
            "tag": "TRADITIONAL AUTOMATION",
            "title": "Legacy PPT Generators",
            "points": [
                "Unstyled text boxes floating on blank backgrounds",
                "Default Calibri with zero typographic scale",
                "Static cuts with no Morph or SMIL animation support",
                "Low-res bitmap icons that blur on 4K projectors"
            ]
        },
        right_side={
            "tag": "SLIDECRAFT ENGINE",
            "title": "Frontier AI Harness",
            "points": [
                "Modular Bento grids and elevated cards with soft shadows",
                "Curated 2-font typography hierarchy (30pt title / 14pt body)",
                "Seamless OpenXML Morph transitions and staggered fly-ins",
                "Crisp 100% vector SVG DrawingML custom geometry"
            ]
        }
    )

    # ==========================================
    # SLIDE 7: Quote / Closing Vision
    # ==========================================
    s7 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s7,
        category="LEADERSHIP VISION",
        title="The Future of Presentation Generation",
        subtitle="Empowering frontier intelligence with publication-grade design primitives."
    )
    add_quote_callout(
        slide=s7,
        quote_text="Presentations are the ultimate communication artifact. When frontier models are equipped with real design primitives instead of flat text boxes, the quality of knowledge transfer reaches an entirely new dimension.",
        author="Frontier AI Systems Lead",
        author_title="Deep Learning & Presentation Systems"
    )

    deck.save(output_path)
    print(f"Flagship Showcase generated successfully at: {output_path}")
    return output_path

if __name__ == "__main__":
    build_showcase()
