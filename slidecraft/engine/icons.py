"""Curated SVG vector icon library for PowerPoint presentations.

Provides clean 24x24 vector paths compiled into native PowerPoint DrawingML shapes.
"""

from typing import Optional, Tuple
from pptx.slide import Slide
from pptx.enum.shapes import MSO_SHAPE
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from slidecraft.engine.units import hex_to_rgb, parse_color_hex
from slidecraft.engine.geometry import apply_svg_path_to_shape
from slidecraft.engine.effects import apply_soft_shadow

# Curated 24x24 vector paths (Lucide / Feather inspired)
ICON_PATHS = {
    "shield": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "lock": "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-12 0V7a5 5 0 0 1 10 0v4",
    "cpu": "M4 4h16v16H4z M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M20 9h3 M20 14h3 M1 9h3 M1 14h3",
    "brain": "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z",
    "sparkles": "M12 3l1.912 5.885L20 10.8l-4.854 3.73 1.854 6.07L12 16.854l-5 3.746 1.854-6.07L4 10.8l6.088-1.915L12 3z",
    "star": "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    "chart": "M18 20V10 M12 20V4 M6 20v-6",
    "trending_up": "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    "server": "M2 4h20v6H2z M2 14h20v6H2z M6 7h.01 M6 17h.01",
    "database": "M12 3c4.97 0 9 1.34 9 3v12c0 1.66-4.03 3-9 3s-9-1.34-9-3V6c0-1.66 4.03-3 9-3z M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3 M3 7c0 1.66 4.03 3 9 3s9-1.34 9-3",
    "globe": "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 0c-3 0-5 4.5-5 10s2 10 5 10 5-4.5 5-10-2-10-5-10z M2 12h20",
    "zap": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    "rocket": "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.77 22.77 0 0 1-3.95 2z M9 18l3 3 M5 9l3 3",
    "check_circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
    "cross_circle": "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 13.5l-7-7 M15.5 8.5l-7 7",
    "alert_triangle": "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    "users": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 14v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    "layers": "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    "target": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "compass": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm4.24-14.24l-2.83 7.07-7.07 2.83 2.83-7.07 7.07-2.83z",
    "code": "M16 18l6-6-6-6 M8 6l-6 6 6 6",
    "terminal": "M4 17l6-6-6-6 M12 19h8",
    "arrow_right": "M5 12h14 M12 5l7 7-7 7",
    "box": "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
    "award": "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm-3.8 3.5L12 22l3.8-3.5",
    "clock": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v5l3.5 2",
    "lightbulb": "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4.5 12.36V16a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1.64A7 7 0 0 0 12 2z",
    "book_open": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    "file_text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"
}

def add_vector_icon(
    slide: Slide,
    icon_name: str,
    left,
    top,
    size=Inches(0.4),
    color_hex: str = "00F0FF",
    bg_circle: bool = False,
    bg_color_hex: str = "1E293B",
    bg_padding_factor: float = 1.6
):
    """Add a native vector icon to a slide with optional pill/circle background container."""
    icon_d = ICON_PATHS.get(icon_name.lower(), ICON_PATHS["sparkles"])

    if bg_circle:
        bg_size = size * bg_padding_factor
        offset = (bg_size - size) / 2
        bg_shape = slide.shapes.add_shape(
            MSO_SHAPE.OVAL,
            left - offset,
            top - offset,
            bg_size,
            bg_size
        )
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = hex_to_rgb(bg_color_hex)
        bg_shape.line.fill.background()

    icon_shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        left,
        top,
        size,
        size
    )
    icon_shape.fill.solid()
    icon_shape.fill.fore_color.rgb = hex_to_rgb(color_hex)
    icon_shape.line.fill.background()

    # Compile SVG path to DrawingML custGeom
    apply_svg_path_to_shape(icon_shape, icon_d, view_box=(0, 0, 24, 24))
    return icon_shape
