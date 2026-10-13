"""Command-line interface for SlideCraft."""

import argparse
import sys
import os
from slidecraft.schema.compiler import compile_presentation_from_json
from slidecraft.design_system.palettes import PALETTES
from slidecraft.design_system.typography import FONT_PAIRINGS
from slidecraft.engine.icons import ICON_PATHS

def main():
    parser = argparse.ArgumentParser(
        description="SlideCraft: AI-Powered Frontier PowerPoint Generator Harness"
    )
    parser.add_argument("spec", nargs="?", help="Path to declarative JSON presentation file")
    parser.add_argument("-o", "--output", default="output.pptx", help="Output .pptx file path")
    parser.add_argument("--list-palettes", action="store_true", help="List available color palettes")
    parser.add_argument("--list-fonts", action="store_true", help="List available font pairings")
    parser.add_argument("--list-icons", action="store_true", help="List available vector icons")

    args = parser.parse_args()

    if args.list_palettes:
        print("=== AVAILABLE SLIDECRAFT PALETTES ===")
        for name, pal in PALETTES.items():
            mode = "Dark" if pal.is_dark else "Light"
            print(f"- {name.ljust(20)} [{mode}] bg=#{pal.bg} accent=#{pal.accent}")
        return

    if args.list_fonts:
        print("=== AVAILABLE FONT PAIRINGS ===")
        for name, pair in FONT_PAIRINGS.items():
            print(f"- {name.ljust(20)} Title: {pair.heading_font} | Body: {pair.body_font}")
        return

    if args.list_icons:
        print("=== AVAILABLE VECTOR ICONS ===")
        for icon in sorted(ICON_PATHS.keys()):
            print(f"- {icon}")
        return

    if not args.spec:
        parser.print_help()
        sys.exit(1)

    if not os.path.exists(args.spec):
        print(f"Error: Spec file '{args.spec}' not found.")
        sys.exit(1)

    print(f"Compiling presentation '{args.spec}' -> '{args.output}'...")
    deck = compile_presentation_from_json(args.spec, args.output)
    print(f"Successfully generated '{args.output}' with {len(deck.slides)} slides!")

if __name__ == "__main__":
    main()
