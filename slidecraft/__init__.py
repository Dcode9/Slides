"""SlideCraft: Frontier-Grade AI PowerPoint Presentation Generation Harness.

A powerful library and engine for natively compiling rich PowerPoint presentations (.pptx)
with modern design aesthetics: Bento grids, typography hierarchy, native shapes,
custom geometry, SVG vector compilation, gradients, soft shadows, Morph transitions,
and SMIL animations.
"""

from slidecraft.engine.presentation import SlideDeck
from slidecraft.design_system.palettes import PALETTES, ColorPalette
from slidecraft.design_system.theme import Theme, get_theme
from slidecraft.schema.compiler import compile_presentation_from_json, compile_presentation_from_dict

__version__ = "1.0.0"
__all__ = [
    "SlideDeck",
    "Theme",
    "get_theme",
    "PALETTES",
    "ColorPalette",
    "compile_presentation_from_json",
    "compile_presentation_from_dict",
]
