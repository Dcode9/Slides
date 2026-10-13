"""Data models for SlideCraft declarative presentation specification."""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any

@dataclass
class PresentationThemeSpec:
    palette: str = "obsidian_cyber"
    fonts: str = "modern_tech"

@dataclass
class SlideSpec:
    type: str # 'hero', 'cards', 'bento', 'metrics', 'timeline', 'comparison', 'quote'
    title: str
    subtitle: Optional[str] = None
    category: Optional[str] = None
    transition: str = "morph"
    transition_duration_ms: int = 1250
    items: List[Dict[str, Any]] = field(default_factory=list)
    bento_layout: str = "hero_left"
    left: Optional[Dict[str, Any]] = None
    right: Optional[Dict[str, Any]] = None
    quote: Optional[str] = None
    author: Optional[str] = None
    author_title: Optional[str] = None
    presenter: Optional[str] = None
    date: Optional[str] = None
    accent_badge: Optional[str] = None
    image_path: Optional[str] = None
    caption: Optional[str] = None

@dataclass
class PresentationSpec:
    theme: PresentationThemeSpec = field(default_factory=PresentationThemeSpec)
    aspect_ratio: str = "16:9"
    slides: List[SlideSpec] = field(default_factory=list)
