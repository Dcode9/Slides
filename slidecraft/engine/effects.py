"""Visual effects engine for shapes: soft drop shadows, gradients, glassmorphism, and border styling."""

from typing import Optional, Tuple
from pptx.oxml import parse_xml
from pptx.shapes.base import BaseShape

_SPPR_TAG_ORDER = [
    "xfrm",
    "custGeom",
    "prstGeom",
    "noFill",
    "solidFill",
    "gradFill",
    "blipFill",
    "pattFill",
    "grpFill",
    "ln",
    "effectLst",
    "effectDag",
    "scene3d",
    "sp3d",
    "extLst",
]

def _tag_order_index(tag: str) -> int:
    clean_tag = tag.split('}')[-1]
    try:
        return _SPPR_TAG_ORDER.index(clean_tag)
    except ValueError:
        return 99

def _insert_in_sppr_order(spPr, new_elem):
    """Insert new element into spPr maintaining strict OpenXML DrawingML schema order."""
    new_order = _tag_order_index(new_elem.tag)
    insert_idx = None
    for idx, child in enumerate(spPr):
        if _tag_order_index(child.tag) > new_order:
            insert_idx = idx
            break
    if insert_idx is not None:
        spPr.insert(insert_idx, new_elem)
    else:
        spPr.append(new_elem)

def apply_soft_shadow(
    shape: BaseShape,
    blur_pt: float = 12.0,
    distance_pt: float = 4.0,
    angle_deg: float = 90.0,
    opacity: float = 0.15,
    color_hex: str = "000000"
):
    """Apply a modern, subtle drop shadow to a shape (card, container, button)."""
    spPr = shape._element.spPr
    clean_hex = color_hex.lstrip('#')

    # Convert units to DrawingML integers
    # 1 pt = 12,700 EMUs
    blur_emu = int(blur_pt * 12700)
    dist_emu = int(distance_pt * 12700)
    # DrawingML angle: 60,000 per degree
    ang_val = int(angle_deg * 60000)
    alpha_val = int(opacity * 100000)

    # Remove existing effectLst
    for child in list(spPr):
        if child.tag.endswith("effectLst"):
            spPr.remove(child)

    xml_str = f"""
    <a:effectLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
      <a:outerShdw blurRad="{blur_emu}" dist="{dist_emu}" dir="{ang_val}" algn="ctr" rotWithShape="0">
        <a:srgbClr val="{clean_hex}">
          <a:alpha val="{alpha_val}"/>
        </a:srgbClr>
      </a:outerShdw>
    </a:effectLst>
    """
    effect_elem = parse_xml(xml_str.strip())
    _insert_in_sppr_order(spPr, effect_elem)

def apply_gradient_fill(
    shape: BaseShape,
    color_start_hex: str,
    color_end_hex: str,
    angle_deg: float = 90.0,
    start_alpha: float = 1.0,
    end_alpha: float = 1.0
):
    """Apply linear two-stop gradient fill to shape."""
    spPr = shape._element.spPr
    c1 = color_start_hex.lstrip('#')
    c2 = color_end_hex.lstrip('#')
    ang_val = int(angle_deg * 60000)
    a1_val = int(start_alpha * 100000)
    a2_val = int(end_alpha * 100000)

    # Remove existing fill elements (solidFill, gradFill, noFill, blipFill)
    for child in list(spPr):
        tag = child.tag.split('}')[-1]
        if tag in ("solidFill", "gradFill", "noFill", "blipFill"):
            spPr.remove(child)

    xml_str = f"""
    <a:gradFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" flip="none" rotWithShape="1">
      <a:gsLst>
        <a:gs pos="0">
          <a:srgbClr val="{c1}">
            <a:alpha val="{a1_val}"/>
          </a:srgbClr>
        </a:gs>
        <a:gs pos="100000">
          <a:srgbClr val="{c2}">
            <a:alpha val="{a2_val}"/>
          </a:srgbClr>
        </a:gs>
      </a:gsLst>
      <a:lin ang="{ang_val}" scaled="1"/>
    </a:gradFill>
    """
    grad_elem = parse_xml(xml_str.strip())
    _insert_in_sppr_order(spPr, grad_elem)

def apply_solid_fill_with_opacity(
    shape: BaseShape,
    color_hex: str,
    opacity: float = 1.0
):
    """Apply solid fill with customizable alpha transparency (for glassmorphism)."""
    spPr = shape._element.spPr
    c = color_hex.lstrip('#')
    alpha_val = int(opacity * 100000)

    for child in list(spPr):
        tag = child.tag.split('}')[-1]
        if tag in ("solidFill", "gradFill", "noFill", "blipFill"):
            spPr.remove(child)

    xml_str = f"""
    <a:solidFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
      <a:srgbClr val="{c}">
        <a:alpha val="{alpha_val}"/>
      </a:srgbClr>
    </a:solidFill>
    """
    fill_elem = parse_xml(xml_str.strip())
    _insert_in_sppr_order(spPr, fill_elem)

def apply_subtle_border(
    shape: BaseShape,
    color_hex: str = "334155",
    width_pt: float = 1.0,
    opacity: float = 0.5
):
    """Apply a crisp, modern subtle outline border to shape."""
    spPr = shape._element.spPr
    c = color_hex.lstrip('#')
    width_emu = int(width_pt * 12700)
    alpha_val = int(opacity * 100000)

    # Remove existing line
    for child in list(spPr):
        if child.tag.endswith("ln"):
            spPr.remove(child)

    xml_str = f"""
    <a:ln xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" w="{width_emu}">
      <a:solidFill>
        <a:srgbClr val="{c}">
          <a:alpha val="{alpha_val}"/>
        </a:srgbClr>
      </a:solidFill>
    </a:ln>
    """
    ln_elem = parse_xml(xml_str.strip())
    _insert_in_sppr_order(spPr, ln_elem)

def set_corner_radius(shape: BaseShape, radius_factor: int = 5000):
    """Set subtle modern corner radius for roundRect shapes (default PowerPoint is 16667 which is too round).
    
    A value of 5000 - 8000 produces sleek Linear/Apple-style rounded corners.
    """
    spPr = shape._element.spPr
    geom = None
    for child in spPr:
        if child.tag.endswith("prstGeom"):
            geom = child
            break

    if geom is not None:
        avLst = geom.find("{http://schemas.openxmlformats.org/drawingml/2006/main}avLst")
        if avLst is None:
            avLst = parse_xml('<a:avLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>')
            geom.append(avLst)
        
        # Clear existing adjustments
        for gd in list(avLst):
            avLst.remove(gd)

        gd_xml = f'<a:gd xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="adj" fmla="val {radius_factor}"/>'
        avLst.append(parse_xml(gd_xml))
