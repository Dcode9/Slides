"""Pull quote and testimonial callout components."""

from typing import Optional
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, CONTENT_WIDTH_16_9, hex_to_rgb

def add_quote_callout(
    slide: SlideWrapper,
    quote_text: str,
    author: str,
    author_title: Optional[str] = None,
    top=Inches(2.4),
    left=DEFAULT_MARGIN_LEFT,
    width=CONTENT_WIDTH_16_9,
    height=Inches(4.0)
):
    """Add a prominent editorial pull quote card with stylized quotation mark."""
    theme = slide.theme

    card = slide.add_card(
        left=left,
        top=top,
        width=width,
        height=height,
        bg_color=theme.palette.card_bg,
        border_color=theme.palette.card_border,
        border_width=1.0,
        morph_name="!!quote_card"
    )

    pad_x = Inches(0.8)
    inner_y = top + Inches(0.5)

    # Stylized Quotation Mark
    slide.add_text_box(
        text="“",
        left=left + pad_x,
        top=inner_y - Inches(0.3),
        width=Inches(1.0),
        height=Inches(0.8),
        font_size=Pt(72),
        font_name="Georgia",
        color_hex=theme.palette.accent,
        bold=True
    )
    inner_y += Inches(0.5)

    # Quote Body
    slide.add_text_box(
        text=f'"{quote_text}"',
        left=left + pad_x,
        top=inner_y,
        width=width - (pad_x * 2),
        height=Inches(1.6),
        font_size=Pt(22),
        font_name="Georgia" if "editorial" in theme.palette.name.lower() else theme.fonts.heading_font,
        color_hex=theme.palette.text_primary,
        bold=False,
        line_spacing=1.35
    )
    inner_y += Inches(1.8)

    # Author
    author_full = f"— {author}" + (f",  {author_title}" if author_title else "")
    slide.add_text_box(
        text=author_full,
        left=left + pad_x,
        top=inner_y,
        width=width - (pad_x * 2),
        height=Inches(0.4),
        font_size=theme.scale.body,
        font_name=theme.fonts.heading_font,
        color_hex=theme.palette.accent,
        bold=True
    )

    slide.add_animation(card, effect="fade", delay_ms=200, dur_ms=600)
    return card
