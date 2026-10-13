"""Layout and grid calculation primitives for presentation components."""

from typing import List, Tuple
from pptx.util import Inches

def calculate_columns(total_width, count: int, gap=Inches(0.3)) -> List[Tuple]:
    """Calculate (left_offset, col_width) for N evenly spaced columns."""
    total_gap = gap * (count - 1)
    col_width = (total_width - total_gap) / count
    cols = []
    for i in range(count):
        left = i * (col_width + gap)
        cols.append((left, col_width))
    return cols

def calculate_rows(total_height, count: int, gap=Inches(0.3)) -> List[Tuple]:
    """Calculate (top_offset, row_height) for N evenly spaced rows."""
    total_gap = gap * (count - 1)
    row_height = (total_height - total_gap) / count
    rows = []
    for i in range(count):
        top = i * (row_height + gap)
        rows.append((top, row_height))
    return rows
