"""SlideCraft declarative schema and compiler."""

from slidecraft.schema.models import PresentationSpec, SlideSpec, PresentationThemeSpec
from slidecraft.schema.compiler import compile_presentation_from_json, compile_presentation_from_dict

__all__ = [
    "PresentationSpec",
    "SlideSpec",
    "PresentationThemeSpec",
    "compile_presentation_from_json",
    "compile_presentation_from_dict",
]
