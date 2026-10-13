# Frontier AI System Prompt & Guide: PowerPoint Presentation Design

This guide equips frontier AI models (Claude 3.7 Sonnet, GPT-4.5 / o1 / o3, Gemini 2.0 Flash / Pro) to generate presentation decks using the **SlideCraft** harness.

---

## 1. Core Visual Design Laws for AI Presentation Generation

When producing presentation designs, adhere strictly to these principles:

### A. The Container Rule (Never Free-Floating Bullets)
- **Forbidden:** Never output 5 plain bullet points on a bare background.
- **Mandatory:** Group all related concepts inside visual **Cards** (`type: "cards"`) or **Bento Grids** (`type: "bento"`). Containers provide visual grounding, hierarchy, and scanability.

### B. Typography Discipline (The 2-Font Law)
- Limit each presentation to exactly **two typefaces**:
  - Heading font for Titles, Eyebrows, and Metrics.
  - Body font for Descriptions and Sub-captions.
- Maintain strict scale contrast:
  - Hero Title: `44–48pt Bold`
  - Slide Title: `28–32pt Bold`
  - Stat Numbers: `54–64pt Bold`
  - Subtitles: `15–18pt Regular`
  - Body Copy: `13–15pt Regular`
  - Labels & Eyebrows: `10–12pt Bold Uppercase`

### C. The 60-30-10 Color Discipline
- **60% Dominant Canvas:** Deep Obsidian (`#090D16`), Dark Slate (`#0F172A`), or Warm Parchment (`#FAF8F5`).
- **30% Structural Surfaces:** Elevated Card Backgrounds (`#121826` / `#FFFFFF`) with crisp borders.
- **10% High-Contrast Accent:** Vibrant Neon Cyan (`#00F0FF`), Electric Indigo (`#6366F1`), or Emerald (`#10B981`). Used exclusively for focal points, stat numbers, active badges, and highlight borders.

### D. The Morph Motion Rhythm
- Set `"transition": "morph"` on subsequent slides.
- SlideCraft automatically links shapes using OpenXML Morph matching (`!!name`), turning slide changes into fluid, cinematic spatial transitions.

---

## 2. Available Archetypes & Component Layouts

| Component `type` | Best Used For | Key Attributes |
| :--- | :--- | :--- |
| **`"hero"`** | Title slide, keynote opening, big announcement | `title`, `subtitle`, `eyebrow`, `presenter`, `date`, `accent_badge` |
| **`"bento"`** | Modular capabilities, asymmetric features, core overview | `layout` (`"hero_left"`, `"hero_right"`, `"quad_asymmetric"`), `items` |
| **`"metrics"`** | Financial results, KPIs, performance benchmarks, speedup | `items`: `value`, `label`, `delta`, `delta_positive`, `icon`, `highlight` |
| **`"cards"`** | 3 or 4 parallel features, pillars, technical capabilities | `items`: `title`, `body`, `icon`, `tag`, `highlight` |
| **`"timeline"`** | Roadmap, multi-phase execution, historical evolution | `items`: `date` / `phase`, `title`, `body`, `icon` |
| **`"comparison"`**| Before vs. After, Legacy vs. Next-Gen, Competitor vs. Us | `left`: `title`, `tag`, `points`; `right`: `title`, `tag`, `points` |
| **`"quote"`** | Customer testimonial, leadership vision, industry benchmark | `quote`, `author`, `author_title` |
| **`"image"`** | High-impact photography, photo editorial, side-by-side photo + narrative | `title`, `subtitle`, `category`, `image_path`, `caption` |

---

## 3. Palettes & Typography Pairings

### Palettes
- **`"obsidian_cyber"`** (Dark): Obsidian black (`#090D16`), Neon Cyan (`#00F0FF`), Purple (`#8B5CF6`). Best for AI, cybersecurity, devtools, cloud infrastructure.
- **`"warm_editorial"`** (Light): Warm cream (`#FAF8F5`), Obsidian (`#18181B`), Ochre Gold (`#B89758`), Terracotta (`#C25E38`). Best for culture, arts, humanities, luxury, architecture.
- **`"linear_enterprise"`** (Dark): Deep Slate (`#0F172A`), Electric Indigo (`#6366F1`), Sky Blue (`#38BDF8`). Best for B2B SaaS, modern software, investor pitch decks.
- **`"silicon_bento"`** (Dark): Gunmetal Titanium (`#121316`), Emerald (`#10B981`), Amber (`#F59E0B`). Best for high-growth startups, product launches.
- **`"nordic_minimalist"`** (Light): Crisp Snow (`#F8FAFC`), Forest Green (`#166534`), Slate (`#334155`). Best for sustainability, clean reports, healthcare, science.
- **`"sunset_horizon"`** (Dark): Midnight Navy (`#0A1128`), Sunset Coral (`#FF6B6B`), Gold (`#FFD166`). Best for consumer apps, entertainment, bold storytelling.

### Font Pairings
- **`"modern_tech"`**: Segoe UI / Segoe UI (Universal, ultra-clean)
- **`"editorial_luxury"`**: Georgia / Calibri (Refined, editorial authority)
- **`"executive"`**: Arial / Calibri (Sharp, corporate, high-contrast)
- **`"geometric"`**: Century Gothic / Segoe UI (Modern Scandinavian geometric)

### Built-in Vector Icons
`shield`, `lock`, `cpu`, `brain`, `sparkles`, `star`, `chart`, `trending_up`, `server`, `database`, `globe`, `zap`, `rocket`, `check_circle`, `cross_circle`, `alert_triangle`, `users`, `layers`, `target`, `compass`, `code`, `terminal`, `arrow_right`, `box`, `award`, `clock`, `lightbulb`, `book_open`, `file_text`.

---

## 4. The Complete Declarative JSON Specification

When generating a deck, output pure JSON in this structure:

```json
{
  "theme": {
    "palette": "obsidian_cyber",
    "fonts": "modern_tech"
  },
  "aspect_ratio": "16:9",
  "slides": [
    {
      "type": "hero",
      "eyebrow": "EXECUTIVE KEYNOTE",
      "title": "Autonomous Infrastructure 2026",
      "subtitle": "Next-generation distributed computing powered by self-healing neural agents.",
      "presenter": "Engineering Leadership Team",
      "date": "Q4 2026",
      "accent_badge": "CONFIDENTIAL",
      "transition": "fade"
    },
    {
      "type": "metrics",
      "category": "PERFORMANCE BENCHMARKS",
      "title": "Order-of-Magnitude Improvements",
      "subtitle": "Measured across 10,000 production workloads over 90 days.",
      "transition": "morph",
      "items": [
        {
          "value": "99.99%",
          "label": "UPTIME SLA",
          "delta": "+0.4% YoY",
          "delta_positive": true,
          "sub_caption": "Zero unscheduled outages recorded across 14 global regions.",
          "icon": "shield",
          "highlight": true
        },
        {
          "value": "8.4ms",
          "label": "MEDIAN LATENCY",
          "delta": "12x Faster",
          "delta_positive": true,
          "sub_caption": "Sub-millisecond routing at the global intelligent edge.",
          "icon": "zap"
        },
        {
          "value": "78%",
          "label": "COST REDUCTION",
          "delta": "-$4.2M TCO",
          "delta_positive": true,
          "sub_caption": "Automated resource packing and spot instance arbitration.",
          "icon": "trending_up"
        }
      ]
    },
    {
      "type": "bento",
      "layout": "hero_left",
      "category": "SYSTEM ARCHITECTURE",
      "title": "A Modular, Resilient Foundation",
      "subtitle": "Designed from first principles to isolate faults and scale infinitely.",
      "transition": "morph",
      "items": [
        {
          "type": "metric",
          "value": "0-Trust",
          "label": "CONTINUOUS VERIFICATION",
          "body": "Every service request is cryptographically attested with ephemeral keys and mTLS authentication.",
          "icon": "lock"
        },
        {
          "title": "Self-Optimizing Mesh",
          "body": "Dynamic traffic balancing adjusts route weights based on latency telemetry and node health.",
          "icon": "globe",
          "tag": "NETWORKING"
        },
        {
          "title": "Deterministic Replay",
          "body": "Every state mutation is journaled to an append-only verifiable event stream.",
          "icon": "database",
          "tag": "STORAGE"
        }
      ]
    },
    {
      "type": "cards",
      "category": "CAPABILITIES",
      "title": "Enterprise Feature Matrix",
      "subtitle": "Purpose-built for zero-touch cloud operations.",
      "transition": "morph",
      "items": [
        {
          "title": "Intelligent Autoscaling",
          "body": "Predictive scaling anticipates traffic surges 15 minutes before they occur.",
          "icon": "trending_up",
          "tag": "COMPUTE"
        },
        {
          "title": "Automated Rollbacks",
          "body": "Instant reversion on error rate anomalies without manual intervention.",
          "icon": "refresh",
          "tag": "DEPLOYMENTS"
        },
        {
          "title": "Fleet Observability",
          "body": "Unified distributed tracing across millions of ephemeral serverless containers.",
          "icon": "chart",
          "tag": "MONITORING"
        }
      ]
    },
    {
      "type": "timeline",
      "category": "EXECUTION TIMELINE",
      "title": "Phased Global Rollout",
      "subtitle": "Four structured delivery phases to ensure zero disruption.",
      "transition": "morph",
      "items": [
        {"phase": "PHASE 1", "title": "Foundation", "body": "Core identity attestation and control plane hardening.", "icon": "lock"},
        {"phase": "PHASE 2", "title": "Pilot Mesh", "body": "Internal dogfooding across Tier-1 microservices.", "icon": "server"},
        {"phase": "PHASE 3", "title": "Global Edge", "body": "Multi-region deployment across 24 edge zones.", "icon": "globe"},
        {"phase": "PHASE 4", "title": "Full GA", "body": "Enterprise general availability and SLA guarantee.", "icon": "rocket"}
      ]
    },
    {
      "type": "comparison",
      "category": "PARADIGM COMPARISON",
      "title": "Traditional Infrastructure vs. SlideCraft",
      "subtitle": "The fundamental architectural differences that unlock exponential productivity.",
      "transition": "morph",
      "left": {
        "tag": "LEGACY CLOUD",
        "title": "Static Infrastructure",
        "points": [
          "Manual provisioning with brittle configuration scripts",
          "Reactive alert fatigue during production outages",
          "Static over-provisioned nodes wasting millions annually"
        ]
      },
      "right": {
        "tag": "SLIDECRAFT AUTONOMOUS",
        "title": "Self-Healing Mesh",
        "points": [
          "Declarative state enforced by continuous reconciliation loops",
          "Proactive remediation resolving issues before alerts fire",
          "Dynamic micro-allocation optimizing hardware utilization"
        ]
      }
    },
    {
      "type": "quote",
      "category": "TESTIMONIAL",
      "title": "What Engineering Leaders Say",
      "transition": "morph",
      "quote": "This platform allowed our team of 12 engineers to operate infrastructure that previously required a dedicated team of 80.",
      "author": "Dr. Marcus Chen",
      "author_title": "VP of Engineering, Horizon Systems"
    }
  ]
}
```
