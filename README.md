# solfege

Standalone, single-file music-reading trainers. No build step or server — just
open the HTML files (or visit the GitHub Pages site).

- **`index.html` / `solfege.html`** — Solfege Trainer. Notes scroll across the
  staff toward a judgment line; name each one before it crosses. Adaptive
  difficulty and a hidden per-note training memory focus practice on weak spots.
- **`chords.html`** — Chord Trainer. Same philosophy, but you identify whole
  chords (root + quality: Major / Minor / Diminished / Augmented).

Both apps support treble/bass clef and a **note-name switch** between
Do-Re-Mi (solfège) and A-B-C (letter) notation, found in Settings. The two
apps cross-link to each other in the header.

Shared features (Settings):

- **Study Set** — choose exactly what to practise. The difficulty tier sets a
  sensible default; add or remove items to match your goal. Notes app: which
  note names, plus an accidentals toggle. Chord app: which qualities and which
  inversions. ("Use default" restores the baseline set.)
- **Expertise badge** — the HUD shows a live level (Novice → Beginner →
  Skilled → Advanced → Expert) based on your average mastery across the active
  study set, so the rating reflects *your* learning objective.
- **Speed** — a spinner sets the scroll speed (it still auto-adapts as you go).

There is no timing window: you can name a note/chord any time before it crosses
the line — a guess always resolves the leading (frontmost) one.
