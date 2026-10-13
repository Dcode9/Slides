"""PowerPoint Transition Engine with native Morph and OpenXML transition support."""

from typing import Literal, Optional
from pptx.oxml import parse_xml
from pptx.slide import Slide

MorphOption = Literal["byObject", "byWord", "byChar"]
TransitionType = Literal["morph", "fade", "push", "wipe", "zoom", "reveal", "cut"]

def remove_existing_transition(slide: Slide):
    """Remove existing transition or AlternateContent transition from slide."""
    sld_elem = slide.element
    for child in list(sld_elem):
        tag = child.tag.split('}')[-1]
        if tag == "transition":
            sld_elem.remove(child)
        elif tag == "AlternateContent":
            # Check if this AlternateContent contains transition
            if "transition" in child.tag.lower() or any("transition" in c.tag.lower() for c in child.iter()):
                sld_elem.remove(child)

def _insert_in_slide_order(slide: Slide, new_element):
    """Insert element in schema-compliant order: after cSld/clrMapOvr, before timing/extLst."""
    sld_elem = slide.element
    # Find insertion index
    timing_idx = None
    ext_idx = None
    for idx, child in enumerate(sld_elem):
        tag = child.tag.split('}')[-1]
        if tag == "timing" and timing_idx is None:
            timing_idx = idx
        elif tag == "extLst" and ext_idx is None:
            ext_idx = idx

    target_idx = timing_idx if timing_idx is not None else ext_idx
    if target_idx is not None:
        sld_elem.insert(target_idx, new_element)
    else:
        sld_elem.append(new_element)

def apply_morph_transition(slide: Slide, duration_ms: int = 1250, option: MorphOption = "byObject"):
    """Apply native PowerPoint Morph transition to slide using Microsoft 365 OpenXML.

    When moving from Slide A to Slide B, shapes that exist in both slides will
    smoothly interpolate position, scale, color, and rotation.
    If shapes share a name prefixed with '!!' (e.g. '!!HeroCard'), PowerPoint
    forces them to morph even if they are different shape types.

    Args:
        slide: Target slide receiving the morph transition
        duration_ms: Duration in milliseconds (default: 1250ms = 1.25s)
        option: 'byObject', 'byWord', or 'byChar'
    """
    remove_existing_transition(slide)
    
    xml_str = f"""
    <mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
        <mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">
            <p:transition spd="slow" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="{duration_ms}">
                <p159:morph option="{option}"/>
            </p:transition>
        </mc:Choice>
        <mc:Fallback>
            <p:transition spd="slow" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
                <p:fade/>
            </p:transition>
        </mc:Fallback>
    </mc:AlternateContent>
    """
    elem = parse_xml(xml_str.strip())
    _insert_in_slide_order(slide, elem)

def apply_fade_transition(slide: Slide, duration_ms: int = 800):
    """Apply smooth Fade transition to slide."""
    remove_existing_transition(slide)
    xml_str = f"""
    <p:transition spd="slow" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="{duration_ms}">
        <p:fade/>
    </p:transition>
    """
    elem = parse_xml(xml_str.strip())
    _insert_in_slide_order(slide, elem)

def apply_push_transition(slide: Slide, direction: Literal["d", "l", "r", "u"] = "l", duration_ms: int = 800):
    """Apply Push slide transition in specified direction ('l'=from right/pushes left, etc.)."""
    remove_existing_transition(slide)
    xml_str = f"""
    <p:transition spd="slow" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="{duration_ms}">
        <p:push dir="{direction}"/>
    </p:transition>
    """
    elem = parse_xml(xml_str.strip())
    _insert_in_slide_order(slide, elem)

def apply_wipe_transition(slide: Slide, direction: Literal["d", "l", "r", "u"] = "r", duration_ms: int = 800):
    """Apply Wipe slide transition."""
    remove_existing_transition(slide)
    xml_str = f"""
    <p:transition spd="slow" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="{duration_ms}">
        <p:wipe dir="{direction}"/>
    </p:transition>
    """
    elem = parse_xml(xml_str.strip())
    _insert_in_slide_order(slide, elem)

def apply_transition(slide: Slide, transition_type: TransitionType = "morph", duration_ms: int = 1000, **kwargs):
    """Apply specified transition type to slide."""
    if transition_type == "morph":
        option = kwargs.get("option", "byObject")
        apply_morph_transition(slide, duration_ms=duration_ms, option=option)
    elif transition_type == "fade":
        apply_fade_transition(slide, duration_ms=duration_ms)
    elif transition_type == "push":
        direction = kwargs.get("direction", "l")
        apply_push_transition(slide, direction=direction, duration_ms=duration_ms)
    elif transition_type == "wipe":
        direction = kwargs.get("direction", "r")
        apply_wipe_transition(slide, direction=direction, duration_ms=duration_ms)
    elif transition_type == "cut":
        remove_existing_transition(slide)
        elem = parse_xml('<p:transition spd="fast" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cut/></p:transition>')
        _insert_in_slide_order(slide, elem)
    else:
        apply_fade_transition(slide, duration_ms=duration_ms)
