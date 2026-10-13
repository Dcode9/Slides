"""Unit tests for declarative presentation schema and JSON compiler."""

import os
import unittest
import json
import zipfile

from slidecraft.schema.compiler import compile_presentation_from_dict, compile_presentation_from_json

class TestSchemaCompiler(unittest.TestCase):

    def setUp(self):
        self.output_dir = "test_output"
        os.makedirs(self.output_dir, exist_ok=True)

    def test_compile_from_dict(self):
        spec = {
            "theme": {
                "palette": "obsidian_cyber",
                "fonts": "modern_tech"
            },
            "aspect_ratio": "16:9",
            "slides": [
                {
                    "type": "hero",
                    "title": "Frontier AI Deck",
                    "subtitle": "Generated via declarative SlideCraft JSON schema",
                    "eyebrow": "DEMO PRESENTATION",
                    "presenter": "Antigravity Agent",
                    "date": "2026",
                    "transition": "fade"
                },
                {
                    "type": "metrics",
                    "category": "BENCHMARKS",
                    "title": "Throughput & Efficiency",
                    "subtitle": "Production benchmark statistics.",
                    "transition": "morph",
                    "items": [
                        {"value": "100%", "label": "Vector Quality", "delta": "+15%", "icon": "shield", "highlight": True},
                        {"value": "12ms", "label": "Compile Latency", "delta": "Instant", "icon": "zap"}
                    ]
                },
                {
                    "type": "bento",
                    "layout": "hero_left",
                    "category": "ARCHITECTURE",
                    "title": "Bento Grid Capabilities",
                    "transition": "morph",
                    "items": [
                        {"type": "metric", "value": "4.8x", "label": "Faster Rhythms", "body": "Asymmetric Bento layout.", "icon": "rocket"},
                        {"title": "Component A", "body": "Clean typography.", "icon": "brain"},
                        {"title": "Component B", "body": "Soft shadows & borders.", "icon": "sparkles"}
                    ]
                },
                {
                    "type": "cards",
                    "category": "PILLARS",
                    "title": "Core Technical Pillars",
                    "transition": "morph",
                    "items": [
                        {"title": "Pillar 1", "body": "Custom geometry.", "icon": "code"},
                        {"title": "Pillar 2", "body": "OpenXML Morph.", "icon": "refresh"},
                        {"title": "Pillar 3", "body": "SMIL Timing.", "icon": "clock"}
                    ]
                },
                {
                    "type": "timeline",
                    "category": "ROADMAP",
                    "title": "Release Milestones",
                    "transition": "morph",
                    "items": [
                        {"date": "Q1", "title": "Foundation", "body": "Core OpenXML engine.", "icon": "lock"},
                        {"date": "Q2", "title": "Bento & Morph", "body": "Visual components.", "icon": "globe"}
                    ]
                },
                {
                    "type": "comparison",
                    "category": "COMPARISON",
                    "title": "Legacy PPT vs SlideCraft",
                    "transition": "morph",
                    "left": {
                        "title": "Legacy PPT",
                        "tag": "LEGACY",
                        "points": ["Unformatted bullet points", "Default templates"]
                    },
                    "right": {
                        "title": "SlideCraft",
                        "tag": "FRONTIER",
                        "points": ["Bento grid layouts", "Native Morph transitions"]
                    }
                },
                {
                    "type": "quote",
                    "category": "VALIDATION",
                    "title": "Executive Quote",
                    "transition": "morph",
                    "quote": "The presentation harness allows any frontier LLM to build world-class slides.",
                    "author": "Chief Architect",
                    "author_title": "AI Labs"
                }
            ]
        }

        output_path = os.path.join(self.output_dir, "test_schema_output.pptx")
        deck = compile_presentation_from_dict(spec, output_path)
        self.assertEqual(len(deck.slides), 7)
        self.assertTrue(os.path.exists(output_path))

        # Check zip archive validity and slide count
        with zipfile.ZipFile(output_path) as z:
            slides = [n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
            self.assertEqual(len(slides), 7)

    def test_compile_from_json_file(self):
        json_path = os.path.join(self.output_dir, "sample_spec.json")
        sample_data = {
            "theme": {"palette": "warm_editorial", "fonts": "editorial_luxury"},
            "slides": [
                {"type": "hero", "title": "Editorial Presentation", "subtitle": "Curated museum aesthetic."}
            ]
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_data, f)

        output_path = os.path.join(self.output_dir, "test_json_file_output.pptx")
        deck = compile_presentation_from_json(json_path, output_path)
        self.assertEqual(len(deck.slides), 1)
        self.assertTrue(os.path.exists(output_path))

    def test_compile_image_slide(self):
        img_path = os.path.abspath("images/sikkim_landscape.jpg")
        spec = {
            "theme": {"palette": "warm_editorial", "fonts": "editorial_luxury"},
            "slides": [
                {
                    "type": "image",
                    "category": "VISUAL SHOWCASE",
                    "title": "Himalayan Vistas",
                    "subtitle": "Natural landscape and biodiversity of Sikkim.",
                    "image_path": img_path,
                    "caption": "Kanchenjunga and surrounding glacial ranges captured at sunrise."
                }
            ]
        }
        output_path = os.path.join(self.output_dir, "test_schema_image_output.pptx")
        deck = compile_presentation_from_dict(spec, output_path)
        self.assertEqual(len(deck.slides), 1)
        self.assertTrue(os.path.exists(output_path))

if __name__ == "__main__":
    unittest.main()
