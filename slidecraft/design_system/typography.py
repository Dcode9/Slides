"""Typography pairings, hierarchical scales, and font definitions for SlideCraft."""

from dataclasses import dataclass
from typing import Dict
from pptx.util import Pt

@dataclass
class FontPairing:
    name: str
    heading_font: str
    body_font: str
    mono_font: str = "Consolas"

FONT_PAIRINGS: Dict[str, FontPairing] = {
    "modern_tech": FontPairing(
        name="Modern Tech",
        heading_font="Segoe UI",      # Universally available on Windows & Office
        body_font="Segoe UI",
        mono_font="Consolas"
    ),
    "editorial_luxury": FontPairing(
        name="Editorial Luxury",
        heading_font="Georgia",
        body_font="Calibri",
        mono_font="Consolas"
    ),
    "executive": FontPairing(
        name="Executive Clean",
        heading_font="Arial",
        body_font="Calibri",
        mono_font="Consolas"
    ),
    "geometric": FontPairing(
        name="Geometric",
        heading_font="Century Gothic",
        body_font="Segoe UI",
        mono_font="Consolas"
    )
}

@dataclass
class TypeScale:
    hero_title: Pt = Pt(44)
    slide_title: Pt = Pt(30)
    subtitle: Pt = Pt(16)
    section_title: Pt = Pt(22)
    card_title: Pt = Pt(18)
    body: Pt = Pt(13.5)
    body_small: Pt = Pt(11)
    stat_giant: Pt = Pt(64)
    stat_medium: Pt = Pt(44)
    eyebrow: Pt = Pt(10)

def get_font_pairing(name: str) -> FontPairing:
    """Retrieve font pairing by name."""
    return FONT_PAIRINGS.get(name.lower(), FONT_PAIRINGS["modern_tech"])
