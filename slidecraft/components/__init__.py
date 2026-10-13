"""SlideCraft component suite."""

from slidecraft.components.base import calculate_columns, calculate_rows
from slidecraft.components.header import add_slide_header
from slidecraft.components.hero import create_hero_title_slide
from slidecraft.components.cards import add_feature_card, add_card_grid
from slidecraft.components.bento import create_bento_grid
from slidecraft.components.metrics import add_metric_card, add_metric_row
from slidecraft.components.timeline import add_horizontal_timeline
from slidecraft.components.comparison import add_comparison_split
from slidecraft.components.quote import add_quote_callout

__all__ = [
    "calculate_columns",
    "calculate_rows",
    "add_slide_header",
    "create_hero_title_slide",
    "add_feature_card",
    "add_card_grid",
    "create_bento_grid",
    "add_metric_card",
    "add_metric_row",
    "add_horizontal_timeline",
    "add_comparison_split",
    "add_quote_callout",
]
