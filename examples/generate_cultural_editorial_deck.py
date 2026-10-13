"""Generate a museum-grade editorial presentation using the warm_editorial theme."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from pptx.util import Inches, Pt
from slidecraft.engine.presentation import SlideDeck
from slidecraft.engine.units import DEFAULT_MARGIN_LEFT, CONTENT_WIDTH_16_9
from slidecraft.design_system.theme import get_theme
from slidecraft.components.hero import create_hero_title_slide
from slidecraft.components.header import add_slide_header
from slidecraft.components.bento import create_bento_grid
from slidecraft.components.cards import add_card_grid
from slidecraft.components.comparison import add_comparison_split
from slidecraft.components.quote import add_quote_callout

def build_cultural_editorial():
    output_dir = "output_presentations"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "Sikkim_Goa_Cultural_Editorial.pptx")

    theme = get_theme("warm_editorial", "editorial_luxury")
    deck = SlideDeck(theme=theme, aspect_ratio="16:9")

    # ==========================================
    # SLIDE 1: Title Slide (Museum Editorial)
    # ==========================================
    s1 = deck.add_slide(transition="fade", transition_duration_ms=800)
    img_hero = os.path.abspath("images/sikkim_landscape.jpg")
    create_hero_title_slide(
        slide=s1,
        eyebrow="ART-INTEGRATED COMPARATIVE STUDY",
        title="Glimpses of India: Goa & Sikkim",
        subtitle="A comparative exploration of Portuguese-influenced Konkan coastal traditions and sacred Himalayan Buddhist monastic arts.",
        presenter="Collaborative Research Faculty",
        date="Autumn Exhibition",
        accent_badge="EK BHARAT SHRESHTHA BHARAT",
        image_path=img_hero if os.path.exists(img_hero) else None
    )

    # ==========================================
    # SLIDE 2: Bento Grid of Sikkimese Traditions
    # ==========================================
    s2 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s2,
        category="HIMALAYAN HERITAGE",
        title="Sacred Traditions of Sikkim",
        subtitle="Where ancient Lepcha folklore, Bhutia monastic rituals, and Nepalese rhythms converge."
    )
    create_bento_grid(
        slide=s2,
        layout="hero_left",
        items=[
            {
                "type": "metric",
                "value": "8th C.",
                "label": "GURU PADMASAMBHAVA ORIGINS",
                "body": "Masked Cham dances originated in the 8th century as sacred spiritual choreographies designed to purify negative energies and bestow communal blessings.",
                "icon": "sparkles"
            },
            {
                "title": "Singhi Chham & Snow Lion",
                "body": "The mythological white snow lion dance honors Mount Kanchenjunga as the guardian deity of Sikkim.",
                "icon": "star",
                "tag": "FOLKLORE"
            },
            {
                "title": "Acoustic Percussion: The Damphu",
                "body": "Traditional round single-sided frame drum accompanying Tamang Selo pastoral melodies.",
                "icon": "zap",
                "tag": "MUSIC"
            }
        ]
    )

    # ==========================================
    # SLIDE 3: Visual Arts & Choreography (Photo Editorial)
    # ==========================================
    s3 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s3,
        category="VISUAL ARTS & SACRED DANCE",
        title="Living Traditions: Cham Rituals & Folk Dances",
        subtitle="Photographic documentation of sacred masked choreography and coastal festival expressions."
    )
    img_cham = os.path.abspath("images/singhi_chaam.jpg")
    img_dance = os.path.abspath("images/coorg_dance.jpg")
    card_w = Inches(5.6)

    if os.path.exists(img_cham):
        s3.add_image(
            img_cham,
            left=DEFAULT_MARGIN_LEFT,
            top=Inches(2.45),
            width=card_w,
            height=Inches(3.1),
            border_color=theme.palette.card_border,
            shadow=True,
            morph_name="!!photo_sikkim"
        )
        s3.add_text_box(
            "SIKKIM: Cham Sacred Mask Ritual",
            left=DEFAULT_MARGIN_LEFT,
            top=Inches(5.7),
            width=card_w,
            height=Inches(0.35),
            font_size=Pt(13),
            bold=True,
            color_hex=theme.palette.text_primary
        )
        s3.add_text_box(
            "Monastic lamas enact spiritual protector deities during sacred annual festivals.",
            left=DEFAULT_MARGIN_LEFT,
            top=Inches(6.05),
            width=card_w,
            height=Inches(0.4),
            font_size=Pt(11),
            color_hex=theme.palette.text_muted
        )

    if os.path.exists(img_dance):
        s3.add_image(
            img_dance,
            left=DEFAULT_MARGIN_LEFT + card_w + Inches(0.4),
            top=Inches(2.45),
            width=card_w,
            height=Inches(3.1),
            border_color=theme.palette.card_border,
            shadow=True,
            morph_name="!!photo_goa"
        )
        s3.add_text_box(
            "WESTERN GHATS & KONKAN: Folk Expressions",
            left=DEFAULT_MARGIN_LEFT + card_w + Inches(0.4),
            top=Inches(5.7),
            width=card_w,
            height=Inches(0.35),
            font_size=Pt(13),
            bold=True,
            color_hex=theme.palette.text_primary
        )
        s3.add_text_box(
            "Communal agrarian harvests celebrated with rhythmic percussion and martial choreography.",
            left=DEFAULT_MARGIN_LEFT + card_w + Inches(0.4),
            top=Inches(6.05),
            width=card_w,
            height=Inches(0.4),
            font_size=Pt(11),
            color_hex=theme.palette.text_muted
        )

    # ==========================================
    # SLIDE 4: Architectural Comparison Split
    # ==========================================
    s4 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s4,
        category="ARCHITECTURAL COMPARISON",
        title="Baroque Churches vs. Timber Gompas",
        subtitle="Two distinct architectural solutions shaped by geography, geology, and spiritual devotion."
    )
    add_comparison_split(
        slide=s4,
        left_side={
            "tag": "GOA • LATIN COLONIAL",
            "title": "Basilica of Bom Jesus",
            "points": [
                "Constructed in 1605 from volcanic red laterite stone",
                "Soaring Baroque façade with Corinthian and Doric capitals",
                "Houses the sacred relics of St. Francis Xavier in silver casket"
            ]
        },
        right_side={
            "tag": "SIKKIM • HIMALAYAN TIBETAN",
            "title": "Pemayangtse Gompa",
            "points": [
                "Centuries-old timber joinery resilient to Himalayan seismic shifts",
                "Multi-tiered wooden mandalas hand-carved over five years",
                "Vibrant mineral pigment murals depicting Buddhist cosmologies"
            ]
        }
    )

    # ==========================================
    # SLIDE 5: Cultural Synthesis Quote
    # ==========================================
    s5 = deck.add_slide(transition="morph", transition_duration_ms=1250)
    add_slide_header(
        slide=s5,
        category="SYNTHESIS & REFLECTION",
        title="The Fabric of Cultural Synergy",
        subtitle="Understanding how diverse geographies shape human expression and collective memory."
    )
    add_quote_callout(
        slide=s5,
        quote_text="Despite thousands of miles of geographical separation—from the salt breezes of the Arabian Sea to the snow-crested peaks of Kanchenjunga—both cultures preserve their history through rhythmic movement, communal feast lore, and sacred architecture.",
        author="Art-Integrated Learning Project",
        author_title="CBSE National Curriculum Integration"
    )

    deck.save(output_path)
    print(f"Cultural Editorial Deck saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    build_cultural_editorial()
