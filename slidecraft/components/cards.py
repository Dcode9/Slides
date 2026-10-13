"""Card components and multi-column card grids for presentation slides."""

from typing import Optional, List, Dict
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, CONTENT_WIDTH_16_9, hex_to_rgb
from slidecraft.components.base import calculate_columns

def add_feature_card(
    slide: SlideWrapper,
    left,
    top,
    width,
    height,
    title: str,
    body: str,
    icon: Optional[str] = None,
    tag: Optional[str] = None,
    accent_bar: bool = False,
    morph_name: Optional[str] = None,
    opacity: float = 1.0,
    highlight: bool = False
):
    """Add a polished feature card container with icon, title, body, and optional accent bar."""
    theme = slide.theme
    card_bg = theme.palette.card_bg
    border_color = theme.palette.accent if highlight else theme.palette.card_border

    # 1. Base card surface
    card = slide.add_card(
        left=left,
        top=top,
        width=width,
        height=height,
        bg_color=card_bg,
        border_color=border_color,
        border_width=1.5 if highlight else 1.0,
        morph_name=morph_name,
        opacity=opacity
    )

    padding_x = Inches(0.35)
    padding_y = Inches(0.35)
    inner_y = top + padding_y

    # Accent top strip if requested
    if accent_bar or highlight:
        bar = slide.slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            left + Inches(0.3),
            top,
            width - Inches(0.6),
            Inches(0.04)
        )
        bar.fill.solid()
        bar.fill.fore_color.rgb = hex_to_rgb(theme.palette.accent)
        bar.line.fill.background()

    # 2. Icon Badge
    if icon:
        slide.add_icon(
            icon_name=icon,
            left=left + padding_x,
            top=inner_y,
            size=Inches(0.4),
            color_hex=theme.palette.accent,
            bg_circle=True,
            bg_color_hex=theme.palette.bg
        )
        inner_y += Inches(0.65)

    # 3. Optional tag pill
    if tag:
        slide.add_eyebrow_badge(
            text=tag,
            left=left + padding_x,
            top=inner_y,
            color_hex=theme.palette.accent_secondary,
            bg_hex=theme.palette.bg
        )
        inner_y += Inches(0.4)

    # 4. Card Title
    avail_w = width - (padding_x * 2)
    chars_per_line = max(8, int((avail_w / Inches(1)) * 7.5))
    is_multi_line = len(title) > chars_per_line or "\n" in title or (len(title.split()) > 1 and len(title) > 12)
    title_height = Inches(0.65) if is_multi_line else Inches(0.38)

    slide.add_text_box(
        text=title,
        left=left + padding_x,
        top=inner_y,
        width=avail_w,
        height=title_height,
        font_size=theme.scale.card_title if width >= Inches(3.2) else Pt(16),
        font_name=theme.fonts.heading_font,
        color_hex=theme.palette.text_primary,
        bold=True
    )
    inner_y += title_height + Inches(0.1)

    # 5. Card Body text
    body_height = (top + height) - inner_y - padding_y
    if body_height > Inches(0.3):
        slide.add_text_box(
            text=body,
            left=left + padding_x,
            top=inner_y,
            width=avail_w,
            height=body_height,
            font_size=theme.scale.body if width >= Inches(3.2) else theme.scale.body_small,
            font_name=theme.fonts.body_font,
            color_hex=theme.palette.text_muted,
            bold=False,
            line_spacing=1.2
        )

    return card

def add_card_grid(
    slide: SlideWrapper,
    items: List[Dict],
    top=Inches(2.45),
    height=Inches(4.35),
    left=DEFAULT_MARGIN_LEFT,
    total_width=CONTENT_WIDTH_16_9,
    gap=Inches(0.3),
    animate: bool = True
):
    """Add a multi-column row of feature cards with automatic layout and staggered animation."""
    cols = calculate_columns(total_width, len(items), gap=gap)
    card_shapes = []

    for idx, (col_offset, col_width) in enumerate(cols):
        item = items[idx]
        morph_id = item.get("morph_name", f"!!card_col_{idx}")
        card = add_feature_card(
            slide=slide,
            left=left + col_offset,
            top=top,
            width=col_width,
            height=height,
            title=item.get("title", ""),
            body=item.get("body", ""),
            icon=item.get("icon"),
            tag=item.get("tag"),
            accent_bar=item.get("accent_bar", False),
            highlight=item.get("highlight", False),
            morph_name=morph_id
        )
        card_shapes.append(card)

    if animate:
        slide.stagger_shapes(card_shapes, effect="fly_in", direction="bottom", base_delay_ms=200, interval_ms=150)

    return card_shapes
