"""Curated color palettes for SlideCraft presentation design system."""

from dataclasses import dataclass
from typing import Dict

@dataclass
class ColorPalette:
    name: str
    bg: str
    card_bg: str
    card_border: str
    text_primary: str
    text_muted: str
    accent: str
    accent_secondary: str
    success: str = "10B981"
    warning: str = "F59E0B"
    danger: str = "EF4444"
    is_dark: bool = True

    @property
    def text_secondary(self) -> str:
        return self.text_muted

PALETTES: Dict[str, ColorPalette] = {
    # 1. High-Tech Obsidian / Cyberpunk / AI
    "obsidian_cyber": ColorPalette(
        name="Obsidian Cyber",
        bg="090D16",
        card_bg="121826",
        card_border="1F293D",
        text_primary="F9FAFB",
        text_muted="94A3B8",
        accent="00F0FF",
        accent_secondary="8B5CF6",
        success="10B981",
        warning="F59E0B",
        danger="EF4444",
        is_dark=True
    ),

    # 2. Warm Editorial Museum (Cultural / Humanities / Luxury)
    "warm_editorial": ColorPalette(
        name="Warm Editorial",
        bg="FAF8F5",
        card_bg="FFFFFF",
        card_border="E5E0D8",
        text_primary="18181B",
        text_muted="57534E",
        accent="C25E38",
        accent_secondary="B89758",
        success="2E7D32",
        warning="D97706",
        danger="B91C1C",
        is_dark=False
    ),

    # 3. Modern Enterprise / Linear / Stripe Dark
    "linear_enterprise": ColorPalette(
        name="Linear Enterprise",
        bg="0F172A",
        card_bg="1E293B",
        card_border="334155",
        text_primary="F8FAFC",
        text_muted="94A3B8",
        accent="6366F1",
        accent_secondary="38BDF8",
        success="10B981",
        warning="F59E0B",
        danger="F43F5E",
        is_dark=True
    ),

    # 4. Silicon Bento / Pitch Deck (Dark Titanium & Emerald)
    "silicon_bento": ColorPalette(
        name="Silicon Bento",
        bg="121316",
        card_bg="1C1D22",
        card_border="2C2D35",
        text_primary="FFFFFF",
        text_muted="9CA3AF",
        accent="10B981",
        accent_secondary="F59E0B",
        success="10B981",
        warning="F59E0B",
        danger="EF4444",
        is_dark=True
    ),

    # 5. Nordic Minimalist (Light Clean Corporate / Science)
    "nordic_minimalist": ColorPalette(
        name="Nordic Minimalist",
        bg="F8FAFC",
        card_bg="FFFFFF",
        card_border="E2E8F0",
        text_primary="0F172A",
        text_muted="64748B",
        accent="0284C7",
        accent_secondary="10B981",
        success="16A34A",
        warning="D97706",
        danger="DC2626",
        is_dark=False
    ),

    # 6. Sunset Horizon (Vibrant Consumer / Creative Storytelling)
    "sunset_horizon": ColorPalette(
        name="Sunset Horizon",
        bg="0A1128",
        card_bg="141C38",
        card_border="253158",
        text_primary="FFFFFF",
        text_muted="A5B4FC",
        accent="FF6B6B",
        accent_secondary="FFD166",
        success="06D6A0",
        warning="FFD166",
        danger="EF476F",
        is_dark=True
    )
}

def get_palette(name: str) -> ColorPalette:
    """Retrieve color palette by name (falls back to obsidian_cyber)."""
    return PALETTES.get(name.lower(), PALETTES["obsidian_cyber"])
