"""Header component: slide title, category eyebrow badge, and context subtitle."""

from typing import Optional
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_TOP

def add_slide_header(
    slide: SlideWrapper,
    title: str,
    category: Optional[str] = None,
    subtitle: Optional[str] = None,
    left=DEFAULT_MARGIN_LEFT,
    top=DEFAULT_MARGIN_TOP,
    width=Inches(11.5),
    morph_name: Optional[str] = None
):
    """Add a structured header block with optional category pill badge, title, and subtitle."""
    current_y = top

    # 1. Eyebrow badge
    if category:
        slide.add_eyebrow_badge(
            text=category,
            left=left,
            top=current_y,
            color_hex=slide.theme.palette.accent,
            bg_hex=slide.theme.palette.card_bg
        )
        current_y += Inches(0.40)

    # 2. Main Slide Title
    title_box = slide.add_text_box(
        text=title,
        left=left,
        top=current_y,
        width=width,
        height=Inches(0.60),
        font_size=slide.theme.scale.slide_title,
        font_name=slide.theme.fonts.heading_font,
        color_hex=slide.theme.palette.text_primary,
        bold=True,
        morph_name=morph_name or "!!header_title"
    )
    current_y += Inches(0.62)

    # 3. Context Subtitle
    if subtitle:
        sub_h = Inches(0.55) if len(subtitle) > 75 else Inches(0.35)
        sub_box = slide.add_text_box(
            text=subtitle,
            left=left,
            top=current_y,
            width=width,
            height=sub_h,
            font_size=slide.theme.scale.subtitle,
            font_name=slide.theme.fonts.body_font,
            color_hex=slide.theme.palette.text_muted,
            bold=False
        )
        current_y += sub_h + Inches(0.1)

    return current_y
