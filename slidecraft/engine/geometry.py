"""SVG Path to PowerPoint DrawingML Custom Geometry (<a:custGeom>) Compiler.

Parses SVG path data (M, L, H, V, C, S, Q, T, Z) and compiles it into native
vector DrawingML custom geometry for PowerPoint shapes.
"""

import re
import math
from typing import Tuple, List, Optional
from pptx.oxml import parse_xml
from pptx.shapes.autoshape import Shape

def _arc_to_cubic_beziers(x1: float, y1: float, rx: float, ry: float, phi_deg: float, fa: int, fs: int, x2: float, y2: float):
    """Convert an SVG elliptical arc segment into one or more cubic Bezier curve segments."""
    if x1 == x2 and y1 == y2:
        return []
    rx, ry = abs(rx), abs(ry)
    if rx == 0 or ry == 0:
        return [((x2, y2), (x2, y2), (x2, y2))]
    phi = math.radians(phi_deg % 360)
    cos_phi = math.cos(phi)
    sin_phi = math.sin(phi)

    dx = (x1 - x2) / 2.0
    dy = (y1 - y2) / 2.0
    x1_p = cos_phi * dx + sin_phi * dy
    y1_p = -sin_phi * dx + cos_phi * dy

    lam = (x1_p**2) / (rx**2) + (y1_p**2) / (ry**2)
    if lam > 1:
        s = math.sqrt(lam)
        rx *= s
        ry *= s

    num = max(0.0, (rx**2 * ry**2) - (rx**2 * y1_p**2) - (ry**2 * x1_p**2))
    den = (rx**2 * y1_p**2) + (ry**2 * x1_p**2)
    sq = math.sqrt(num / den) if den > 0 else 0
    if fa == fs:
        sq = -sq
    cx_p = sq * (rx * y1_p) / ry
    cy_p = sq * (-ry * x1_p) / rx

    cx = cos_phi * cx_p - sin_phi * cy_p + (x1 + x2) / 2.0
    cy = sin_phi * cx_p + cos_phi * cy_p + (y1 + y2) / 2.0

    def vec_angle(ux, uy, vx, vy):
        dot = ux * vx + uy * vy
        u_len = math.sqrt(ux*ux + uy*uy)
        v_len = math.sqrt(vx*vx + vy*vy)
        val = max(-1.0, min(1.0, dot / (u_len * v_len))) if u_len * v_len > 0 else 0
        ang = math.acos(val)
        return -ang if (ux * vy - uy * vx) < 0 else ang

    th1 = vec_angle(1, 0, (x1_p - cx_p) / rx, (y1_p - cy_p) / ry)
    dth = vec_angle((x1_p - cx_p) / rx, (y1_p - cy_p) / ry, (-x1_p - cx_p) / rx, (-y1_p - cy_p) / ry) % (2 * math.pi)
    if not fs and dth > 0:
        dth -= 2 * math.pi
    elif fs and dth < 0:
        dth += 2 * math.pi

    num_segs = max(1, math.ceil(abs(dth) / (math.pi / 2)))
    seg_dth = dth / num_segs
    curves = []
    th = th1
    for _ in range(num_segs):
        th_next = th + seg_dth
        alpha = seg_dth
        k = (4.0 / 3.0) * math.tan(alpha / 4.0)

        cos_th = math.cos(th)
        sin_th = math.sin(th)
        cos_th_next = math.cos(th_next)
        sin_th_next = math.sin(th_next)

        e_p0_x = rx * cos_th
        e_p0_y = ry * sin_th
        e_p3_x = rx * cos_th_next
        e_p3_y = ry * sin_th_next

        e_p1_x = e_p0_x - k * rx * sin_th
        e_p1_y = e_p0_y + k * ry * cos_th
        e_p2_x = e_p3_x + k * rx * sin_th_next
        e_p2_y = e_p3_y - k * ry * cos_th_next

        def transform(px, py):
            return (cos_phi * px - sin_phi * py + cx, sin_phi * px + cos_phi * py + cy)

        p1 = transform(e_p1_x, e_p1_y)
        p2 = transform(e_p2_x, e_p2_y)
        p3 = transform(e_p3_x, e_p3_y)
        curves.append((p1, p2, p3))
        th = th_next
    return curves

def _tokenize_path(d: str) -> List[str]:
    """Tokenize SVG path string into commands and coordinate numbers."""
    tokens = []
    # Match commands or floats/integers (including negative numbers and scientific notation)
    pattern = re.compile(r'([MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)')
    for match in pattern.finditer(d):
        token = match.group(0).strip()
        if token:
            tokens.append(token)
    return tokens

class SVGPathToCustGeom:
    """Compiles SVG path string into DrawingML <a:custGeom> XML element."""

    def __init__(self, scale_factor: int = 1000):
        self.scale_factor = scale_factor

    def compile(self, d: str, view_box: Tuple[float, float, float, float] = (0, 0, 24, 24)) -> str:
        vx, vy, vw, vh = view_box
        tokens = _tokenize_path(d)
        if not tokens:
            return ""

        path_elements = []
        idx = 0
        cur_x = 0.0
        cur_y = 0.0
        start_x = 0.0
        start_y = 0.0
        last_ctrl_x = 0.0
        last_ctrl_y = 0.0
        last_cmd = ""

        def to_i(val: float) -> int:
            return int(round(val * self.scale_factor))

        pw = int(round(vw * self.scale_factor))
        ph = int(round(vh * self.scale_factor))

        while idx < len(tokens):
            cmd = tokens[idx]
            if cmd in "MmLlHhVvCcSsQqTtAaZz":
                idx += 1
            else:
                # Implicit repetition of previous command
                if last_cmd in ("M", "m"):
                    cmd = "L" if last_cmd == "M" else "l"
                else:
                    cmd = last_cmd

            if cmd == "M":
                x = float(tokens[idx]) - vx
                y = float(tokens[idx+1]) - vy
                idx += 2
                cur_x, cur_y = x, y
                start_x, start_y = x, y
                last_ctrl_x, last_ctrl_y = x, y
                path_elements.append(f'<a:moveTo><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:moveTo>')
                last_cmd = "M"

            elif cmd == "m":
                x = cur_x + float(tokens[idx])
                y = cur_y + float(tokens[idx+1])
                idx += 2
                cur_x, cur_y = x, y
                start_x, start_y = x, y
                last_ctrl_x, last_ctrl_y = x, y
                path_elements.append(f'<a:moveTo><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:moveTo>')
                last_cmd = "m"

            elif cmd == "L":
                x = float(tokens[idx]) - vx
                y = float(tokens[idx+1]) - vy
                idx += 2
                cur_x, cur_y = x, y
                last_ctrl_x, last_ctrl_y = x, y
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:lnTo>')
                last_cmd = "L"

            elif cmd == "l":
                x = cur_x + float(tokens[idx])
                y = cur_y + float(tokens[idx+1])
                idx += 2
                cur_x, cur_y = x, y
                last_ctrl_x, last_ctrl_y = x, y
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:lnTo>')
                last_cmd = "l"

            elif cmd == "H":
                x = float(tokens[idx]) - vx
                idx += 1
                cur_x = x
                last_ctrl_x = x
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(cur_x)}" y="{to_i(cur_y)}"/></a:lnTo>')
                last_cmd = "H"

            elif cmd == "h":
                x = cur_x + float(tokens[idx])
                idx += 1
                cur_x = x
                last_ctrl_x = x
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(cur_x)}" y="{to_i(cur_y)}"/></a:lnTo>')
                last_cmd = "h"

            elif cmd == "V":
                y = float(tokens[idx]) - vy
                idx += 1
                cur_y = y
                last_ctrl_y = y
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(cur_x)}" y="{to_i(cur_y)}"/></a:lnTo>')
                last_cmd = "V"

            elif cmd == "v":
                y = cur_y + float(tokens[idx])
                idx += 1
                cur_y = y
                last_ctrl_y = y
                path_elements.append(f'<a:lnTo><a:pt x="{to_i(cur_x)}" y="{to_i(cur_y)}"/></a:lnTo>')
                last_cmd = "v"

            elif cmd == "C":
                x1 = float(tokens[idx]) - vx
                y1 = float(tokens[idx+1]) - vy
                x2 = float(tokens[idx+2]) - vx
                y2 = float(tokens[idx+3]) - vy
                x = float(tokens[idx+4]) - vx
                y = float(tokens[idx+5]) - vy
                idx += 6
                path_elements.append(
                    f'<a:cubicBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x2)}" y="{to_i(y2)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:cubicBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x2, y2
                cur_x, cur_y = x, y
                last_cmd = "C"

            elif cmd == "c":
                x1 = cur_x + float(tokens[idx])
                y1 = cur_y + float(tokens[idx+1])
                x2 = cur_x + float(tokens[idx+2])
                y2 = cur_y + float(tokens[idx+3])
                x = cur_x + float(tokens[idx+4])
                y = cur_y + float(tokens[idx+5])
                idx += 6
                path_elements.append(
                    f'<a:cubicBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x2)}" y="{to_i(y2)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:cubicBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x2, y2
                cur_x, cur_y = x, y
                last_cmd = "c"

            elif cmd == "S":
                # Smooth cubic bezier: reflect previous control point
                if last_cmd in ("C", "c", "S", "s"):
                    x1 = 2 * cur_x - last_ctrl_x
                    y1 = 2 * cur_y - last_ctrl_y
                else:
                    x1, y1 = cur_x, cur_y
                x2 = float(tokens[idx]) - vx
                y2 = float(tokens[idx+1]) - vy
                x = float(tokens[idx+2]) - vx
                y = float(tokens[idx+3]) - vy
                idx += 4
                path_elements.append(
                    f'<a:cubicBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x2)}" y="{to_i(y2)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:cubicBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x2, y2
                cur_x, cur_y = x, y
                last_cmd = "S"

            elif cmd == "s":
                if last_cmd in ("C", "c", "S", "s"):
                    x1 = 2 * cur_x - last_ctrl_x
                    y1 = 2 * cur_y - last_ctrl_y
                else:
                    x1, y1 = cur_x, cur_y
                x2 = cur_x + float(tokens[idx])
                y2 = cur_y + float(tokens[idx+1])
                x = cur_x + float(tokens[idx+2])
                y = cur_y + float(tokens[idx+3])
                idx += 4
                path_elements.append(
                    f'<a:cubicBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x2)}" y="{to_i(y2)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:cubicBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x2, y2
                cur_x, cur_y = x, y
                last_cmd = "s"

            elif cmd == "Q":
                x1 = float(tokens[idx]) - vx
                y1 = float(tokens[idx+1]) - vy
                x = float(tokens[idx+2]) - vx
                y = float(tokens[idx+3]) - vy
                idx += 4
                path_elements.append(
                    f'<a:quadBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:quadBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x1, y1
                cur_x, cur_y = x, y
                last_cmd = "Q"

            elif cmd == "q":
                x1 = cur_x + float(tokens[idx])
                y1 = cur_y + float(tokens[idx+1])
                x = cur_x + float(tokens[idx+2])
                y = cur_y + float(tokens[idx+3])
                idx += 4
                path_elements.append(
                    f'<a:quadBezTo><a:pt x="{to_i(x1)}" y="{to_i(y1)}"/><a:pt x="{to_i(x)}" y="{to_i(y)}"/></a:quadBezTo>'
                )
                last_ctrl_x, last_ctrl_y = x1, y1
                cur_x, cur_y = x, y
                last_cmd = "q"

            elif cmd in ("Z", "z"):
                path_elements.append("<a:close/>")
                cur_x, cur_y = start_x, start_y
                last_cmd = "Z"
            elif cmd in ("A", "a"):
                # Convert elliptical arc to smooth cubic Bezier curves
                # A rx ry x-axis-rotation large-arc-flag sweep-flag x y
                rx = float(tokens[idx])
                ry = float(tokens[idx+1])
                rot = float(tokens[idx+2])
                large = int(float(tokens[idx+3]))
                sweep = int(float(tokens[idx+4]))
                end_x = (float(tokens[idx+5]) - vx) if cmd == "A" else (cur_x + float(tokens[idx+5]))
                end_y = (float(tokens[idx+6]) - vy) if cmd == "A" else (cur_y + float(tokens[idx+6]))
                idx += 7
                bezier_segs = _arc_to_cubic_beziers(cur_x, cur_y, rx, ry, rot, large, sweep, end_x, end_y)
                if bezier_segs:
                    for p1, p2, p3 in bezier_segs:
                        path_elements.append(
                            f'<a:cubicBezTo><a:pt x="{to_i(p1[0])}" y="{to_i(p1[1])}"/><a:pt x="{to_i(p2[0])}" y="{to_i(p2[1])}"/><a:pt x="{to_i(p3[0])}" y="{to_i(p3[1])}"/></a:cubicBezTo>'
                        )
                else:
                    path_elements.append(f'<a:lnTo><a:pt x="{to_i(end_x)}" y="{to_i(end_y)}"/></a:lnTo>')
                cur_x, cur_y = end_x, end_y
                last_cmd = cmd
            else:
                idx += 1

        body = "\n".join(path_elements)
        xml = f"""
        <a:custGeom xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:avLst/>
          <a:gdLst/>
          <a:ahLst/>
          <a:cxnLst/>
          <a:rect l="l" t="t" r="r" b="b"/>
          <a:pathLst>
            <a:path w="{pw}" h="{ph}">
              {body}
            </a:path>
          </a:pathLst>
        </a:custGeom>
        """
        return xml.strip()

def apply_svg_path_to_shape(shape: Shape, svg_path_d: str, view_box: Tuple[float, float, float, float] = (0, 0, 24, 24)):
    """Replace shape geometry with custom vector geometry compiled from SVG path."""
    compiler = SVGPathToCustGeom()
    cust_geom_xml = compiler.compile(svg_path_d, view_box=view_box)
    if not cust_geom_xml:
        return

    cust_geom_elem = parse_xml(cust_geom_xml)
    spPr = shape._element.spPr

    # Remove existing prstGeom or custGeom
    for child in list(spPr):
        if child.tag.endswith("prstGeom") or child.tag.endswith("custGeom"):
            spPr.remove(child)

    # Insert custGeom right after xfrm if present
    xfrm_idx = None
    for idx, child in enumerate(spPr):
        if child.tag.endswith("xfrm"):
            xfrm_idx = idx
            break

    if xfrm_idx is not None:
        spPr.insert(xfrm_idx + 1, cust_geom_elem)
    else:
        spPr.insert(0, cust_geom_elem)
