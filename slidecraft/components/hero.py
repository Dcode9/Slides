import os
from typing import Optional, List
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_TOP, hex_to_rgb
from slidecraft.engine.effects import apply_soft_shadow, set_corner_radius, apply_subtle_border

def create_hero_title_slide(
    slide: SlideWrapper,
    title: str,
    subtitle: Optional[str] = None,
    eyebrow: Optional[str] = None,
    presenter: Optional[str] = None,
    date: Optional[str] = None,
    accent_badge: Optional[str] = None,
    center_aligned: bool = False,
    image_path: Optional[str] = None
):
    """Create a dramatic keynote title slide with metadata chips and decorative ambient accents."""
    theme = slide.theme

    # Decorative ambient corner glow/accent shape
    accent_circ = slide.slide.shapes.add_shape(
        MSO_SHAPE.OVAL,
        Inches(11.0),
        Inches(-1.0),
        Inches(4.5),
        Inches(4.5)
    )
    accent_circ.fill.solid()
    accent_circ.fill.fore_color.rgb = hex_to_rgb(theme.palette.card_bg)
    accent_circ.line.color.rgb = hex_to_rgb(theme.palette.accent)
    accent_circ.line.width = Pt(1.0)
    apply_soft_shadow(accent_circ, blur_pt=24, distance_pt=0, opacity=0.2)

    has_image = bool(image_path and os.path.exists(image_path))
    left = DEFAULT_MARGIN_LEFT if not center_aligned else Inches(1.5)
    width = Inches(6.5) if has_image else (Inches(10.5) if not center_aligned else Inches(10.33))
    align = PP_ALIGN.LEFT if (has_image or not center_aligned) else PP_ALIGN.CENTER

    if has_image:
        slide.add_image(
            image_path=image_path,
            left=Inches(7.8),
            top=Inches(1.5),
            width=Inches(4.7),
            height=Inches(4.5),
            border_color=theme.palette.card_border,
            border_width=1.0,
            shadow=True,
            morph_name="!!hero_image"
        )

    current_y = Inches(1.8)

    # 1. Eyebrow
    if eyebrow:
        slide.add_eyebrow_badge(
            text=eyebrow,
            left=left,
            top=current_y,
            color_hex=theme.palette.accent,
            bg_hex=theme.palette.card_bg
        )
        current_y += Inches(0.6)

    # 2. Hero Title
    title_box = slide.add_text_box(
        text=title,
        left=left,
        top=current_y,
        width=width,
        height=Inches(1.6),
        font_size=theme.scale.hero_title,
        font_name=theme.fonts.heading_font,
        color_hex=theme.palette.text_primary,
        bold=True,
        align=align,
        morph_name="!!hero_title"
    )
    current_y += Inches(1.7)

    # 3. Subtitle
    if subtitle:
        slide.add_text_box(
            text=subtitle,
            left=left,
            top=current_y,
            width=width,
            height=Inches(0.9),
            font_size=theme.scale.subtitle,
            font_name=theme.fonts.body_font,
            color_hex=theme.palette.text_muted,
            bold=False,
            align=align,
            line_spacing=1.3,
            morph_name="!!hero_subtitle"
        )
        current_y += Inches(1.1)

    # 4. Metadata footer (Presenter / Date / Org)
    meta_parts = []
    if presenter:
        meta_parts.append(presenter)
    if date:
        meta_parts.append(date)
    if accent_badge:
        meta_parts.append(accent_badge)

    if meta_parts:
        footer_text = "   •   ".join(meta_parts)
        slide.add_text_box(
            text=footer_text,
            left=left,
            top=Inches(6.2),
            width=width,
            height=Inches(0.4),
            font_size=theme.scale.body_small,
            font_name=theme.fonts.body_font,
            color_hex=theme.palette.text_muted,
            align=align
        )
