# Glimpses of India — Goa & Sikkim · Class X Sigma

**Open `Glimpses_of_India_X_Sigma.html` in Chrome or Edge** (double-click it). Press **F** for full screen.

## Presenting
| Key / gesture | Action |
|---|---|
| → ← · Space · PageDown/PageUp · swipe | next / previous plate (the camera walks through the diorama) |
| Home / End | first / last plate |
| N | night / day (plates XVI–XVIII turn to night by themselves) |
| F | full screen |
| click the red panda (or P) | it hops |
| click anywhere | a burst of paper leaves |
| `#7` in the address bar | jump straight to plate 7 |

## Adding the poster (the only image in the deck)
1. Export the Photoshop poster as **`poster.jpg`** (or `.png`) and keep it **in the same folder** as the HTML file — it appears on plate XIV automatically.
2. For e-mailing a *single* file: open the deck, go to plate XIV, **click the empty frame**, choose the image, then press **“Save copy with poster”** (bottom right). The downloaded `…_with_poster.html` has the poster embedded and can be sent on its own.

## Filling in roll numbers / group number / roles
Open the HTML in any text editor (Notepad, VS Code) and search for `const DATA`. Everything editable is there:

```js
const DATA = {
  klass: 'X', division: 'Sigma', group: '__', year: '2026–27',
  members: [
    {name:'Dhairya Shah', roll:'__', task:'…', lead:true},
    …
```
Change `group`, each `roll`, the `task` text and the `outcomes` text, save, reload. The same block exists in `src/content.js` if you rebuild with `python3 build.py`.

## Running on a slow laptop, projector PC or old tablet

The deck is built for exactly that. Nothing is visibly different on a fast
machine, but on a weak one you should still get a smooth pan:

- **Only what is on screen is in the document.** The nine sheets of paper are
  100-ish tiles wide in total; a plate shows four or five of them. Tiles are
  drawn the first time they are needed (and quietly pre-drawn while the deck is
  idle), so a plate costs ~4 tiles of markup instead of all 100. Walking to a
  plate whose neighbour is already drawn costs nothing.
- **The artwork itself is ~55% smaller.** Outlines are stored as relative path
  data and sampled at a density matched to their size on screen — pixel for
  pixel the same picture as before, just far fewer numbers.
- **A "lite" tier switches itself on** when the device looks weak (≤2 cores,
  ≤2 GB RAM, or Data Saver) or when the opening seconds of the deck really do
  run under ~30 fps. It drops the expensive per-sheet gaussian shadows, the
  blur on falling leaves and swinging labels, half the particles and the idle
  camera drift — the drawing is the same, only the expensive pixels go.
  Force it with `…X_Sigma.html?lite` (or `#lite`) to judge it on a fast
  machine; force the full tier on a quirky device with `?full`.
- Night, the red panda, the poster upload and the leaves all still work in
  both tiers.

## Files
- `Glimpses_of_India_X_Sigma.html` — the finished, self-contained presentation (no internet needed).
- `src/` — the readable sources: `style.css` (the Foxglove Hollow design system), `paper.js` (hand-coded paper-cut shapes, figures, buildings), `content.js` (all text + where figures stand), `world.js` (the continuous nine-sheet diorama, drawn one tile at a time), `deck.js` (camera, parallax, night, controls, the tile window and the lite tier).
- `build.py` — stitches `src/` into the single HTML file.
