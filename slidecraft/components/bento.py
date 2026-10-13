"""Bento Grid layout generator for modern asymmetric presentation slides."""

from typing import List, Dict, Optional, Literal
from pptx.util import Inches
from slidecraft.engine.slide import SlideWrapper
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, CONTENT_WIDTH_16_9
from slidecraft.components.cards import add_feature_card
from slidecraft.components.metrics import add_metric_card

BentoLayout = Literal["hero_left", "hero_right", "quad_asymmetric", "hero_top"]

def create_bento_grid(
    slide: SlideWrapper,
    items: List[Dict],
    layout: BentoLayout = "hero_left",
    top=Inches(2.4),
    height=Inches(4.4),
    left=DEFAULT_MARGIN_LEFT,
    total_width=CONTENT_WIDTH_16_9,
    gap=Inches(0.3)
):
    """Generate a sleek, asymmetric Bento Grid layout."""
    created_cards = []

    if layout == "hero_left":
        # Left card (hero): 45% width, full height
        # Right side: 2 stacked cards, 55% width
        w_left = (total_width - gap) * 0.44
        w_right = (total_width - gap) * 0.56
        h_half = (height - gap) / 2

        # 1. Hero Left Card
        if len(items) > 0:
            c0 = items[0]
            if c0.get("type") == "metric":
                card0 = add_metric_card(
                    slide=slide,
                    left=left,
                    top=top,
                    width=w_left,
                    height=height,
                    value=c0.get("value", ""),
                    label=c0.get("label", ""),
                    delta=c0.get("delta"),
                    sub_caption=c0.get("body") or c0.get("sub_caption"),
                    icon=c0.get("icon"),
                    highlight=True,
                    morph_name=c0.get("morph_name", "!!bento_hero")
                )
            else:
                card0 = add_feature_card(
                    slide=slide,
                    left=left,
                    top=top,
                    width=w_left,
                    height=height,
                    title=c0.get("title", ""),
                    body=c0.get("body", ""),
                    icon=c0.get("icon"),
                    tag=c0.get("tag"),
                    highlight=True,
                    morph_name=c0.get("morph_name", "!!bento_hero")
                )
            created_cards.append(card0)

        # 2. Right Top Card
        if len(items) > 1:
            c1 = items[1]
            card1 = add_feature_card(
                slide=slide,
                left=left + w_left + gap,
                top=top,
                width=w_right,
                height=h_half,
                title=c1.get("title", ""),
                body=c1.get("body", ""),
                icon=c1.get("icon"),
                tag=c1.get("tag"),
                morph_name=c1.get("morph_name", "!!bento_card_top")
            )
            created_cards.append(card1)

        # 3. Right Bottom Card
        if len(items) > 2:
            c2 = items[2]
            card2 = add_feature_card(
                slide=slide,
                left=left + w_left + gap,
                top=top + h_half + gap,
                width=w_right,
                height=h_half,
                title=c2.get("title", ""),
                body=c2.get("body", ""),
                icon=c2.get("icon"),
                tag=c2.get("tag"),
                morph_name=c2.get("morph_name", "!!bento_card_bot")
            )
            created_cards.append(card2)

    elif layout == "hero_right":
        w_left = (total_width - gap) * 0.56
        w_right = (total_width - gap) * 0.44
        h_half = (height - gap) / 2

        # 2 stacked on left, 1 hero on right
        if len(items) > 0:
            c0 = items[0]
            card0 = add_feature_card(
                slide=slide,
                left=left,
                top=top,
                width=w_left,
                height=h_half,
                title=c0.get("title", ""),
                body=c0.get("body", ""),
                icon=c0.get("icon"),
                tag=c0.get("tag"),
                morph_name=c0.get("morph_name", "!!bento_card_top")
            )
            created_cards.append(card0)

        if len(items) > 1:
            c1 = items[1]
            card1 = add_feature_card(
                slide=slide,
                left=left,
                top=top + h_half + gap,
                width=w_left,
                height=h_half,
                title=c1.get("title", ""),
                body=c1.get("body", ""),
                icon=c1.get("icon"),
                tag=c1.get("tag"),
                morph_name=c1.get("morph_name", "!!bento_card_bot")
            )
            created_cards.append(card1)

        if len(items) > 2:
            c2 = items[2]
            card2 = add_feature_card(
                slide=slide,
                left=left + w_left + gap,
                top=top,
                width=w_right,
                height=height,
                title=c2.get("title", ""),
                body=c2.get("body", ""),
                icon=c2.get("icon"),
                tag=c2.get("tag"),
                highlight=True,
                morph_name=c2.get("morph_name", "!!bento_hero")
            )
            created_cards.append(card2)

    elif layout == "quad_asymmetric":
        h_half = (height - gap) / 2
        w_wide = (total_width - gap) * 0.58
        w_narrow = (total_width - gap) * 0.42

        # Row 1: Wide left, Narrow right
        if len(items) > 0:
            c0 = items[0]
            card0 = add_feature_card(slide, left, top, w_wide, h_half, c0.get("title", ""), c0.get("body", ""), icon=c0.get("icon"), tag=c0.get("tag"))
            created_cards.append(card0)
        if len(items) > 1:
            c1 = items[1]
            card1 = add_feature_card(slide, left + w_wide + gap, top, w_narrow, h_half, c1.get("title", ""), c1.get("body", ""), icon=c1.get("icon"), tag=c1.get("tag"))
            created_cards.append(card1)

        # Row 2: Narrow left, Wide right
        if len(items) > 2:
            c2 = items[2]
            card2 = add_feature_card(slide, left, top + h_half + gap, w_narrow, h_half, c2.get("title", ""), c2.get("body", ""), icon=c2.get("icon"), tag=c2.get("tag"))
            created_cards.append(card2)
        if len(items) > 3:
            c3 = items[3]
            card3 = add_feature_card(slide, left + w_narrow + gap, top + h_half + gap, w_wide, h_half, c3.get("title", ""), c3.get("body", ""), icon=c3.get("icon"), tag=c3.get("tag"))
            created_cards.append(card3)

    # Animate
    slide.stagger_shapes(created_cards, effect="fly_in", direction="bottom", base_delay_ms=200, interval_ms=150)
    return created_cards
