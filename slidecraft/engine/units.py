"""Units and dimension constants for SlideCraft engine."""

from pptx.util import Inches, Pt, Cm, Emu

# Standard 16:9 Widescreen (PowerPoint modern default)
SLIDE_WIDTH_16_9 = Inches(13.333333)    # 12,192,000 EMUs
SLIDE_HEIGHT_16_9 = Inches(7.5)          # 6,858,000 EMUs

# 4:3 Standard
SLIDE_WIDTH_4_3 = Inches(10.0)
SLIDE_HEIGHT_4_3 = Inches(7.5)

# Standard margin recommendations (8% horizontal, 7% vertical)
DEFAULT_MARGIN_LEFT = Inches(0.9)
DEFAULT_MARGIN_RIGHT = Inches(0.9)
DEFAULT_MARGIN_TOP = Inches(0.65)
DEFAULT_MARGIN_BOTTOM = Inches(0.7)

CONTENT_WIDTH_16_9 = SLIDE_WIDTH_16_9 - DEFAULT_MARGIN_LEFT - DEFAULT_MARGIN_RIGHT
CONTENT_HEIGHT_16_9 = SLIDE_HEIGHT_16_9 - DEFAULT_MARGIN_TOP - DEFAULT_MARGIN_BOTTOM

def parse_color_hex(hex_str: str) -> tuple[int, int, int]:
    """Parse hex color string like '#1E293B' or '1E293B' to (R, G, B) tuple."""
    clean = hex_str.lstrip('#')
    if len(clean) == 3:
        clean = ''.join(c * 2 for c in clean)
    if len(clean) != 6:
        return (0, 0, 0)
    return (int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16))

def hex_to_rgb(hex_str: str):
    """Return pptx.dml.color.RGBColor from hex string."""
    from pptx.dml.color import RGBColor
    r, g, b = parse_color_hex(hex_str)
    return RGBColor(r, g, b)
