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

## Files
- `Glimpses_of_India_X_Sigma.html` — the finished, self-contained presentation (no internet needed).
- `src/` — the readable sources: `style.css` (the Foxglove Hollow design system), `paper.js` (hand-coded paper-cut shapes, figures, buildings), `content.js` (all text + where figures stand), `world.js` (the continuous nine-sheet diorama), `deck.js` (camera, parallax, night, controls).
- `build.py` — stitches `src/` into the single HTML file.
