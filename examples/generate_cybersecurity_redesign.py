"""Redesigning the uploaded Cybersecurity-in-2025 presentation using SlideCraft."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from slidecraft.engine.presentation import SlideDeck
from slidecraft.design_system.theme import get_theme
from slidecraft.components.hero import create_hero_title_slide
from slidecraft.components.header import add_slide_header
from slidecraft.components.metrics import add_metric_row
from slidecraft.components.bento import create_bento_grid
from slidecraft.components.cards import add_card_grid
from slidecraft.components.comparison import add_comparison_split
from slidecraft.components.quote import add_quote_callout

def build_cybersecurity_redesign():
    output_dir = "output_presentations"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "Cybersecurity_2025_Redesigned_SlideCraft.pptx")

    theme = get_theme("obsidian_cyber", "modern_tech")
    deck = SlideDeck(theme=theme, aspect_ratio="16:9")

    # ==========================================
    # SLIDE 1: Hero Title
    # ==========================================
    s1 = deck.add_slide(transition="fade", transition_duration_ms=800)
    create_hero_title_slide(
        slide=s1,
        eyebrow="EXECUTIVE THREAT INTELLIGENCE",
        title="Cybersecurity in 2026: Navigating Complexity",
        subtitle="Autonomous threat vectors, zero-trust imperatives, and resilience architectures in an era of unprecedented AI-driven risk.",
        presenter="Global Cyber Threat Intelligence",
        date="2026 Briefing",
        accent_badge="CRITICAL INFRASTRUCTURE"
    )

    # ==========================================
    # SLIDE 2: Stat & KPI Showcase (79% Malware-Free)
    # ==========================================
    s2 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s2,
        category="THREAT LANDSCAPE",
        title="79% of Cyber Attacks Are Now Malware-Free",
        subtitle="The paradigm has shifted from malicious binary payloads to stolen credentials and living-off-the-land techniques."
    )
    add_metric_row(
        slide=s2,
        metrics=[
            {
                "value": "79%",
                "label": "MALWARE-FREE INTRUSIONS",
                "delta": "+23% YoY",
                "delta_positive": False,
                "sub_caption": "Attackers exploit legitimate sysadmin tools, evading legacy antivirus signatures.",
                "icon": "shield",
                "highlight": True
            },
            {
                "value": "40%+",
                "label": "AI PHISHING SURGE",
                "delta": "Spike",
                "delta_positive": False,
                "sub_caption": "Generative synthetic phishing emails achieve 3.8x higher clickthrough rates.",
                "icon": "brain"
            },
            {
                "value": "2.4m",
                "label": "AVERAGE DWELL TIME",
                "delta": "Critical",
                "delta_positive": False,
                "sub_caption": "Median duration before an undetected adversary is evicted from the network.",
                "icon": "clock"
            }
        ]
    )

    # ==========================================
    # SLIDE 3: Supply Chain Achilles Heel (Bento Grid)
    # ==========================================
    s3 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s3,
        category="VULNERABILITY VECTOR",
        title="Supply Chain Attacks: The Hidden Achilles' Heel",
        subtitle="Adversaries systematically bypass hardened perimeters by compromising trusted third-party vendors and dependencies."
    )
    create_bento_grid(
        slide=s3,
        layout="hero_left",
        items=[
            {
                "type": "metric",
                "value": "54%",
                "label": "CISO CHIEF RESILIENCE RISK",
                "body": "Over half of Fortune 500 enterprises identify third-party supplier vulnerabilities as their single greatest threat.",
                "icon": "alert_triangle"
            },
            {
                "title": "Software Dependency Poisoning",
                "body": "Compromised open-source packages and build pipeline injection infect downstream applications at compile time.",
                "icon": "code",
                "tag": "DEPENDENCIES"
            },
            {
                "title": "Vendor Credential Pivoting",
                "body": "Attackers harvest contractor credentials to establish legitimate VPN sessions straight into internal core databases.",
                "icon": "lock",
                "tag": "LATERAL MOVEMENT"
            }
        ]
    )

    # ==========================================
    # SLIDE 4: Paradigm Comparison (Perimeter vs Zero-Trust)
    # ==========================================
    s4 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s4,
        category="ARCHITECTURE COMPARISON",
        title="Castle-and-Moat vs. Modern Zero-Trust",
        subtitle="Traditional static perimeters crumble against insider threats and credential compromise."
    )
    add_comparison_split(
        slide=s4,
        left_side={
            "tag": "LEGACY DEFENSE",
            "title": "Perimeter Firewalls",
            "points": [
                "Implicit trust granted once inside corporate VPN",
                "Broad subnet access facilitates unrestrained lateral movement",
                "Static rule bases require manual updates and decay over time"
            ]
        },
        right_side={
            "tag": "ZERO-TRUST MANDATE",
            "title": "Continuous Attestation",
            "points": [
                "Every request cryptographically authenticated and authorized",
                "Granular micro-segmentation contains compromise to single pod",
                "Behavioral anomaly detection revokes tokens in real time"
            ]
        }
    )

    # ==========================================
    # SLIDE 5: Workforce Shortage & Strategic Quote
    # ==========================================
    s5 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s5,
        category="TALENT CRISIS & STRATEGY",
        title="The Cybersecurity Workforce Deficit",
        subtitle="Human defense teams cannot keep pace with automated threats without AI-driven orchestration."
    )
    add_quote_callout(
        slide=s5,
        quote_text="With 66% of organizations reporting severe talent shortages, security is no longer a headcount problem—it is an automation imperative. Teams that fail to adopt autonomous AI defenses will face catastrophic operational asymmetry.",
        author="CrowdStrike Global Threat Report",
        author_title="Executive Insights & Foresight 2026"
    )

    deck.save(output_path)
    print(f"Cybersecurity Redesign saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    build_cybersecurity_redesign()
