"""SVG compiler and vector embedder for PowerPoint presentations."""

import io
from typing import Optional
from PIL import Image
from pptx.slide import Slide
from pptx.oxml import parse_xml
from pptx.util import Inches

def _create_transparent_png_bytes(width: int = 256, height: int = 256) -> bytes:
    """Create a minimal transparent PNG in memory to serve as raster fallback for SVG."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def embed_svg_graphic(
    slide: Slide,
    svg_content_or_path: str,
    left,
    top,
    width=Inches(2.0),
    height=Inches(2.0),
    name: str = "Vector Graphic"
):
    """Embed an SVG graphic natively into PowerPoint using the Office 2016+ asvg:svgBlip extension.

    This ensures crisp, lossless rendering on high-DPI displays while retaining
    OpenXML standard compatibility with a raster PNG fallback.
    """
    import os
    if os.path.exists(svg_content_or_path):
        with open(svg_content_or_path, "rb") as f:
            svg_bytes = f.read()
    else:
        svg_bytes = svg_content_or_path.encode("utf-8")

    # 1. Add fallback image to slide (returns a picture shape)
    fallback_bytes = _create_transparent_png_bytes(512, 512)
    png_stream = io.BytesIO(fallback_bytes)
    pic = slide.shapes.add_picture(png_stream, left, top, width, height)

    # 2. Add SVG file part to presentation package and create relationship
    part = slide.part
    # Add SVG as a related part to slide
    svg_partname = part.package.next_partname('/ppt/media/image%d.svg')
    from pptx.opc.package import Part
    from pptx.opc.constants import CONTENT_TYPE
    
    # Custom part for SVG
    svg_part = Part(
        svg_partname,
        'image/svg+xml',
        part.package,
        blob=svg_bytes
    )
    
    # Create relationship from slide to SVG part
    r_id_svg = part.relate_to(
        svg_part,
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'
    )

    # 3. Inject asvg:svgBlip into pic's blip element
    blip = pic._element.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
    if blip is not None:
        ext_lst_xml = f"""
        <a:extLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:ext uri="{{28A0092B-C50C-407E-A947-70E740481C1C}}">
            <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
          </a:ext>
          <a:ext uri="{{96DAC541-7B7A-43D3-8B79-37D633B846F1}}">
            <asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="{r_id_svg}"/>
          </a:ext>
        </a:extLst>
        """
        # Remove any existing extLst on blip
        for child in list(blip):
            if child.tag.endswith('extLst'):
                blip.remove(child)
        blip.append(parse_xml(ext_lst_xml.strip()))

    return pic
