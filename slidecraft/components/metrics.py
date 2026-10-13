"""Metric and KPI callout components for high-impact presentations."""

from typing import Optional, List, Dict
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, CONTENT_WIDTH_16_9, hex_to_rgb
from slidecraft.components.base import calculate_columns

def add_metric_card(
    slide: SlideWrapper,
    left,
    top,
    width,
    height,
    value: str,
    label: str,
    delta: Optional[str] = None,
    delta_positive: bool = True,
    sub_caption: Optional[str] = None,
    icon: Optional[str] = None,
    morph_name: Optional[str] = None,
    highlight: bool = False
):
    """Add an elevated stat/KPI card with giant number, trend pill, and contextual label."""
    theme = slide.theme
    card_bg = theme.palette.card_bg
    border_color = theme.palette.accent if highlight else theme.palette.card_border

    card = slide.add_card(
        left=left,
        top=top,
        width=width,
        height=height,
        bg_color=card_bg,
        border_color=border_color,
        border_width=1.5 if highlight else 1.0,
        morph_name=morph_name
    )

    pad_x = Inches(0.35)
    inner_y = top + Inches(0.3)

    # 1. Top row: Icon and optional delta pill
    if icon or delta:
        if icon:
            slide.add_icon(
                icon_name=icon,
                left=left + pad_x,
                top=inner_y,
                size=Inches(0.35),
                color_hex=theme.palette.accent,
                bg_circle=True,
                bg_color_hex=theme.palette.bg
            )
        if delta:
            delta_color = theme.palette.success if delta_positive else theme.palette.danger
            delta_left = (left + width - pad_x - Inches(1.8)) if icon else (left + pad_x)
            slide.add_eyebrow_badge(
                text=delta,
                left=delta_left,
                top=inner_y + Inches(0.05),
                color_hex=delta_color,
                bg_hex=theme.palette.bg
            )
        inner_y += Inches(0.55)

    # 2. Giant Metric Number
    slide.add_text_box(
        text=value,
        left=left + pad_x,
        top=inner_y,
        width=width - (pad_x * 2),
        height=Inches(1.0),
        font_size=theme.scale.stat_giant,
        font_name=theme.fonts.heading_font,
        color_hex=theme.palette.accent if highlight else theme.palette.text_primary,
        bold=True
    )
    inner_y += Inches(0.95)

    # 3. Primary Label
    slide.add_text_box(
        text=label.upper(),
        left=left + pad_x,
        top=inner_y,
        width=width - (pad_x * 2),
        height=Inches(0.35),
        font_size=theme.scale.eyebrow,
        font_name=theme.fonts.heading_font,
        color_hex=theme.palette.text_primary if highlight else theme.palette.text_muted,
        bold=True
    )
    inner_y += Inches(0.35)

    # 4. Optional Sub-caption
    if sub_caption:
        slide.add_text_box(
            text=sub_caption,
            left=left + pad_x,
            top=inner_y,
            width=width - (pad_x * 2),
            height=Inches(0.6),
            font_size=theme.scale.body_small,
            font_name=theme.fonts.body_font,
            color_hex=theme.palette.text_muted,
            bold=False,
            line_spacing=1.15
        )

    return card

def add_metric_row(
    slide: SlideWrapper,
    metrics: List[Dict],
    top=Inches(2.4),
    height=Inches(3.8),
    left=DEFAULT_MARGIN_LEFT,
    total_width=CONTENT_WIDTH_16_9,
    gap=Inches(0.3)
):
    """Render a row of 2 to 4 metric KPI cards."""
    cols = calculate_columns(total_width, len(metrics), gap=gap)
    cards = []
    for idx, (col_offset, col_w) in enumerate(cols):
        m = metrics[idx]
        morph_id = m.get("morph_name", f"!!metric_col_{idx}")
        card = add_metric_card(
            slide=slide,
            left=left + col_offset,
            top=top,
            width=col_w,
            height=height,
            value=m.get("value", ""),
            label=m.get("label", ""),
            delta=m.get("delta"),
            delta_positive=m.get("delta_positive", True),
            sub_caption=m.get("sub_caption"),
            icon=m.get("icon"),
            highlight=m.get("highlight", False),
            morph_name=morph_id
        )
        cards.append(card)

    slide.stagger_shapes(cards, effect="zoom", base_delay_ms=200, interval_ms=120)
    return cards
