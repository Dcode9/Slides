"""Theme definition tying together color palette, typography, and surface styling rules."""

from dataclasses import dataclass, field
from slidecraft.design_system.palettes import ColorPalette, get_palette
from slidecraft.design_system.typography import FontPairing, TypeScale, get_font_pairing

@dataclass
class Theme:
    palette: ColorPalette = field(default_factory=lambda: get_palette("obsidian_cyber"))
    fonts: FontPairing = field(default_factory=lambda: get_font_pairing("modern_tech"))
    scale: TypeScale = field(default_factory=TypeScale)
    card_radius: int = 6000           # Subtle modern corner radius
    card_shadow: bool = True          # Enable soft outer drop shadow on cards
    card_border: bool = True          # Enable subtle border stroke
    shadow_opacity: float = 0.18      # Shadow opacity
    shadow_blur_pt: float = 12.0      # Shadow blur in points
    border_opacity: float = 0.45      # Card border opacity

def get_theme(palette_name: str = "obsidian_cyber", font_name: str = "modern_tech") -> Theme:
    """Create a Theme from palette and font names."""
    palette = get_palette(palette_name)
    fonts = get_font_pairing(font_name)
    # Adjust shadow opacity for light themes
    shadow_op = 0.08 if not palette.is_dark else 0.22
    border_op = 0.6 if not palette.is_dark else 0.4
    return Theme(
        palette=palette,
        fonts=fonts,
        shadow_opacity=shadow_op,
        border_opacity=border_op
    )
