# PowerPoint Design Breakdown & Harness Architecture

## 1. Analysis of User's Presentation Corpus (27 Decks)

We performed a deep OpenXML inspection of all 27 `.pptx` decks provided in `C:\Users\Dhairya Shah\Dhairya\2) Documents\PowerPoints`. Below are the core findings, patterns, strengths, and failure points discovered across the collection:

### Corpus Structural Breakdown
| Deck Name | Aspect | Slides | Shapes | Media/Pics | Morph | SMIL Timing | Vector SVG | Primary Font Scheme |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Adolscence.pptx** | 16:9 | 78 | 264 | 50 | Yes | Yes | No | Calibri Light / Calibri |
| **Cybersecurity-in-2025.pptx** | 16:9 | 7 | 66 | 14 | No | No | No | Calibri Light / Calibri |
| **Dance-and-Movement-Sikkim-Maha.pptx** | 16:9 | 11 | 67 | 26 | Yes | No | Yes (2) | Calibri Light / Calibri |
| **Light PPT.pptx** | 16:9 | 82 | 434 | 95 | Yes | Yes | No | Calibri Light / Calibri |
| **Lightning.pptx** | 16:9 | 28 | 803 | 67 | No | Yes | No | Calibri Light / Calibri |
| **Milkshakes template.pptx** | 1:1 | 12 | 15 | 155 | Yes | No | No | Calibri Light / Calibri |
| **Reproduction in Animals Quiz.pptx** | 16:9 | 78 | 262 | 50 | Yes | Yes | No | Calibri Light / Calibri |
| **Retort-Processing-Flavoured-Milk.pptx**| 16:9 | 8 | 65 | 10 | Yes | No | No | Calibri Light / Calibri |
| **SSA 2.pptx** | 16:9 | 19 | 325 | 96 | Yes | Yes | Yes (1) | Calibri Light / Calibri |
| **SSC Dance & Movements.pptx** | 16:9 | 11 | 768 | 6 | No | No | No | Arial / Arial |
| **Shikshapatri Quiz.pptx** | 16:9 | 53 | 326 | 64 | Yes | Yes | No | Calibri Light / Calibri |
| **Social Studies 8th Grade.pptx** | 16:9 | 90 | 11,014| 61 | Yes | Yes | No | Arial / Arial |
| **Sound.pptx** | 16:9 | 83 | 506 | 92 | Yes | Yes | Yes (1) | Calibri Light / Calibri |
| **Special assembly VIII Delta.pptx** | 16:9 | 46 | 316 | 171 | Yes | Yes | Yes (1) | Arial Black / Sabon Next LT |
| **Understanding Marginalization Anim** | 16:9 | 18 | 223 | 38 | Yes | Yes | No | Calibri Light / Calibri |
| **Understanding Marginalization Print**| 16:9 | 9 | 76 | 13 | Yes | No | No | Calibri Light / Calibri |
| **Car engine PPT Project.pptx** | 1.88:1| 25 | 59 | 61 | No | Yes | No | Sabon Next LT / Avenir Next LT |

---

### Critical Deconstructions: What Worked vs. What Failed

#### 1. Why Elite Decks Look Great
1. **Container Cards & Visual Grouping (Observed in `Understanding Marginalization` & `Cybersecurity`):**
   - High-performing slides do *not* leave raw text floating on empty white backgrounds.
   - They use rounded-corner rectangle cards (`roundRect`) with subtle solid fills or glass-like fills to group related information (e.g., stats, distinct pillars, categories).
2. **Dynamic Morph Sequences (Observed in `Understanding Marginalization Animation` & `Adolscence`):**
   - Morph transitions (`<p159:morph option="byObject"/>`) transform what would be a jarring slide jump into a continuous cinematic movement.
   - PowerPoint Morph tracks shapes across consecutive slides. When shape names start with `!!` (e.g., `!!HeroCard`), PowerPoint morphs position, scale, and color smoothly.
3. **Bento / Asymmetrical Grid Layouts:**
   - Instead of 3 identical columns with identical bullet lists, modern designs feature a dominant hero anchor (e.g. key metric, large illustration, or headline) paired with smaller contextual cards.
4. **Native SVG Vectors & Custom Geometry (`<a:custGeom>` and `<asvg:svgBlip>`):**
   - Vector graphics retain razor-sharp edges at any zoom level, whereas low-res bitmap icons look pixelated and amateurish.
   - Custom geometry paths enable curved cards, chevron badges, smooth timeline nodes, and custom SVG path rendering.

#### 2. Why Average / Poor Decks Fail
1. **The "Default Bullet Syndrome":**
   - Slides containing 5 to 7 bullet points of raw text with no visual containers or hierarchy cause immediate audience fatigue.
2. **Zero Margins & Overcrowding:**
   - When text boxes touch the slide edge or run past 14 lines, readability drops to near zero.
3. **Mismatched Font Typographies:**
   - Default Calibri without size scaling or weight contrast makes everything blend into a monotonous grey block.
4. **Static Transitions or Jarring Cuts:**
   - Default cuts or random "dissolve/wheel" transitions look like 1990s templates. Clean Morph or subtle Fade transitions are required.

---

## 2. World-Class Presentation Design Rules (Synthesized from Web & Top Studios)

1. **Strict 2-Font Hierarchy:**
   - Heading: Bold Sans-Serif or Editorial Serif (32–44pt).
   - Body: High-legibility Sans-Serif (14–16pt, minimum 13pt).
2. **The 60-30-10 Color Rule:**
   - 60% Dominant Canvas (Deep Obsidian `#0B0F19` or Warm Cream `#FAF8F5`).
   - 30% Structural Surface (Elevated Cards `#161F30` / `#FFFFFF`, crisp borders).
   - 10% High-Contrast Accent (Electric Cyan `#00F0FF`, Crimson `#E11D48`, Sunset `#F59E0B`). Accent is reserved for hero numbers, active chips, and focal points.
3. **Modular Bento Grids & Cards:**
   - Every piece of information belongs inside a visual container with consistent padding and corner radiuses.
4. **Scale Contrast:**
   - Pair an 80pt bold metric with an 11pt muted label to create an instant focal anchor.
5. **Generous Whitespace:**
   - At least 8–12% margins around the slide edges. Content never bleeds to the screen border unless intentional full-bleed hero photography.

---

## 3. The SlideCraft Harness Specification

To allow frontier LLMs to produce world-class presentations reliably, the harness provides:
1. **`slidecraft.engine`**:
   - Native 16:9 widescreen layout engine with pixel-perfect EMU math.
   - Seamless OpenXML Morph transition injector (`morph`, `fade`, `push`, `wipe`).
   - SMIL animation timing engine (`<p:timing>`) with entrance effects (`fade`, `fly_in`, `zoom`, `wipe`) and stagger delays.
   - SVG compiler: Compiles SVG path strings directly into native PowerPoint `<a:custGeom>` shapes and modern `<asvg:svgBlip>` vector images.
   - Visual effects: Drop shadows (`outerShdw`), linear gradients (`gradFill`), corner radius control, and opacity fills.
   - Built-in vector icon registry (50+ sharp UI icons ready for instant insertion).
2. **`slidecraft.design_system`**:
   - 6 curated aesthetic palettes (Obsidian Cyberpunk, Warm Editorial Museum, Modern Enterprise, Silicon Valley Bento, Nordic Minimalist, Sunset Gradient).
   - 4 curated typography pairings.
3. **`slidecraft.components`**:
   - Bento Grid layout generator.
   - Hero Title slides with pill tags and metadata.
   - Metric callout cards with delta badges and micro-captions.
   - Multi-card feature grids (trio, quad, 2-column).
   - Horizontal and vertical process timelines with connected nodes.
   - Split before/after comparisons and feature tables.
   - Quote and testimonial callouts.
4. **`slidecraft.morph`**:
   - Morph sequence builder linking slides with matched `!!` shape names for fluid animations.
5. **`slidecraft.schema`**:
   - Declarative JSON/YAML presentation schema that any frontier AI model can output in a single completion.
   - Compiler that turns the JSON specification into a pristine, production-ready `.pptx` file.
6. **Prompt Harness**:
   - `FRONTIER_AI_GUIDE.md`: A comprehensive prompt template that gives frontier LLMs the exact layout rules, component tokens, and schema to produce breathtaking designs on any topic.
