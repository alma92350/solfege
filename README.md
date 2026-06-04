# Solfège Trainer

A fast, browser-based sight-reading trainer. Notes scroll across a staff and you
name each one (solfège or letter names) before it reaches the line. No build
step is required to run it, no sign-up, no install — just open the HTML.

## Trainers

| Page           | Mode   | What it drills                                              |
| -------------- | ------ | ---------------------------------------------------------- |
| `app.html`     | Notes  | Single notes with adaptive difficulty and a study set      |
| `chords.html`  | Chords | Diatonic triad identification                               |
| `song.html`    | Songs  | Reading the melody of a real song, note by note, on a loop |
| `index.html`   | —      | Landing page                                               |
| `solfege.html` | Notes  | Alias of `app.html` (generated — see Build)                 |

The trainers share preferences (clef, answer layout, note-name system) via
`localStorage`, so settings carry across modes.

## Running locally

Open any of the HTML files directly in a browser (`file://` works) or serve the
folder with any static server, e.g.:

```sh
python3 -m http.server
```

## Project layout

```
app.html / chords.html / song.html   trainer pages (HTML + inlined CSS/JS)
index.html                           landing page
solfege.html                         generated alias of app.html
shared/music.js                      pitch / music-theory helpers, incl. key
                                     signatures + diatonic spelling (single
                                     source of truth, loaded by every page)
shared/songs.js                      Song-mode melody library
build.js                             regenerates solfege.html from app.html
test/                                node --test suites
```

Song mode is **key-aware**: each song declares its key, so the melody is spelled
diatonically (e.g. Vapor Trail in E♭ major reads on the E/A/B lines under a
three-flat key signature and is named MI/LA/SI — not respelled as sharps) and the
key signature is drawn on the staff. The spelling logic lives in `shared/music.js`
(`makeKey`, `keyFromName`, `spellNote`, `keySignature`) and is covered by tests.

Each trainer page is otherwise self-contained (its CSS and game/engine code are
inlined so it runs without a server). The pure music-theory logic — pitch to
solfège, accidentals, staff position — lives once in `shared/music.js`, loaded by
every page via `<script src>` and exercised directly by the tests.

## Build

`solfege.html` is an alias of `app.html` and is **generated**, not edited by
hand. After changing `app.html`, regenerate it:

```sh
node build.js          # rewrite solfege.html from app.html
node build.js --check  # verify it is in sync (used by CI)
```

## Tests

```sh
npm test        # node --test
npm run check   # build --check + tests (what CI runs)
```

CI (`.github/workflows/ci.yml`) runs the tests and the sync check on every push
and pull request. Deployment to OVH over FTP is handled separately by
`.github/workflows/deploy-ovh.yml` on pushes to `main`.
