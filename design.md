# Design System Specification (`design.md`)
**Project:** Glimpses of India — English Collaborative Project (Art-Integrated Learning - MAT)  
**Theme:** Cultural Synergy: Goa (A Baker from Goa) & Sikkim  
**Standard:** Paper-Cut Forest & Mountain Diorama (Foxglove Hollow Adaptation)  
**Version:** 6.0.0  

---

## 1. Visual Identity & Design Philosophy

Inspired by the **Foxglove Hollow** paper-cut diorama aesthetic — nine sheets of hand-cut paper stacked into a living landscape with parallax depth, day/night transitions, and procedural scissor-cut edges.

### Core Architectural Features:
1. **Custom Papercut Backgrounds for Each Slide:**
   - Every one of the 16 slides features an authentic, custom-generated papercut landscape tailored to its specific subject matter (e.g., Goan coconut groves and bakehouses for Slide 2, high Kanchenjunga jagged snow peaks and Rumtek Gompas for Slide 5, acoustic sound stages for Slide 10, etc.).
   - No direct raster photos or standalone image boxes are used — the layered papercut diorama itself serves as the living background art.

2. **Continuous 3D Multiplane Camera Dolly:**
   - Navigating between slides (`←` / `→`) advances the camera smoothly to the next section across an expansive diorama world (`targetCameraX = (slideIdx - 1) * SECTION_WIDTH`).
   - The camera **stays at the new section** without rubberbanding back.
   - Foreground layers (`L7`, `L8`, `L9`) sweep past faster than midground (`L4`, `L5`, `L6`) and background (`L1`, `L2`), giving true multiplane camera depth.

3. **Top-Left 3D Rotary Wheel of 16 Cards:**
   - Replaces static header tags with a **rotary cylindrical wheel / drum** holding all 16 slide plates arranged radially in a circle (`360° / 16 = 22.5°` step).
   - As you navigate, the wheel physically rotates in 3D (`rotateX`), rolling the previous card away and revealing the active card in the front spotlight with pendulum damping wobble (`tagV` inertia).
   - Adjacent cards curve away along the cylindrical drum at 35% opacity, creating a mechanical automaton feel.

4. **Vertical Card Shuffling Transitions (Top Exit & Top Entry):**
   - When a slide changes, the current description folio card moves swiftly **upwards to the top** (`translateY(-115vh)`).
   - The new description card enters **downwards from the top**, gliding gracefully into position with its deckle-edge paper drop shadow.

5. **Day / Night Mode Toggle:**
   - Full palette transition from warm earth tones (`--cream`, `--sage`, `--moss`, `--ochre`, `--orange`) to deep indigo-purple (`#161a45`, `#252a69`, `#4a508f`).
   - Stars twinkle, cottage and monastery windows glow with `#winGlowGrad`, and canvas fireflies float over the meadow and river.

6. **Interactive Features:**
   - Clickable hopping guardian creature (fox) on the diorama floor with squash-and-stretch physics.
   - Interactive 5-question Cultural Quiz with instant grading and explanations.
   - 4-tab Comparative Matrix (Dance & Music, Food Lore, Attire & Craft, Geography).
   - Presenter Notes with built-in 60-second Assessment of Speaking Skills (ALS) stopwatch timer.
   - Fullscreen mode, overview directory grid, and clean print styles.
