"""Morph sequence coordinator: manages shape name matching (!!name) and transitions across slides."""

from typing import List, Dict, Tuple
from slidecraft.engine.slide import SlideWrapper, set_shape_name
from slidecraft.engine.transitions import apply_morph_transition

class MorphSequenceManager:
    """Coordinates Morph transitions across consecutive slides by linking shapes with matching '!!' names."""

    def __init__(self):
        self._tracked_links: List[Tuple[SlideWrapper, SlideWrapper, str]] = []

    def link_shapes_for_morph(
        self,
        slide_a: SlideWrapper,
        shape_a,
        slide_b: SlideWrapper,
        shape_b,
        morph_id: str,
        duration_ms: int = 1250,
        option: str = "byObject"
    ):
        """Link shape on Slide A with shape on Slide B so they seamlessly morph."""
        tag = f"!!{morph_id.lstrip('!')}"
        set_shape_name(shape_a, tag)
        set_shape_name(shape_b, tag)
        
        # Ensure slide B has morph transition enabled
        slide_b.set_morph(duration_ms=duration_ms, option=option)
        self._tracked_links.append((slide_a, slide_b, tag))
