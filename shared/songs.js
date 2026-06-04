/*
 * shared/songs.js — the Song-mode melody library, shared between the page and
 * the test suite (UMD, like shared/music.js).
 *
 * Each song is a list of melody notes as MIDI numbers, in order (middle C = 60).
 * `key` is an ASCII key name ("Eb major", "C major", ...) used to spell the notes
 * diatonically and draw the key signature; `keyName` is the pretty label shown in
 * the UI. `lyrics` (optional) lines up one syllable per note.
 */
(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.Solfege = root.Solfege || {};
        root.Solfege.songs = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const LIBRARY = [
        {
            id: "vapor-trail",
            key: "Eb major",
            title: "Vapor Trail — ひこうき雲 (Hikōki-gumo)",
            composer: "Yumi Arai / Matsutoya · The Wind Rises",
            keyName: "E♭ major",
            clef: "treble",
            // The E♭-major intro: a rolling eighth-note arpeggio figure that
            // climbs and falls through each bar's chord (E♭ · A♭ · Gm7 · A♭).
            // E♭4=63 G4=67 B♭4=70 A♭4=68 C5=72 E♭5=75 G5=79 B♭5=82 D5=74 F5=77
            notes: [
                // Bar 1 — E♭ chord
                63, 67, 70, 67, 63, 67, 70, 67,
                // Bar 2 — A♭ chord
                68, 72, 75, 72, 68, 72, 75, 72,
                // Bar 3 — Gm7 (reaches up to the high F)
                67, 70, 74, 77, 74, 70, 74, 70,
                // Bar 4 — A♭ rising to the top, then settle
                68, 72, 75, 79, 82, 79, 75, 72,
            ],
        },
        {
            id: "twinkle",
            key: "C major",
            title: "Twinkle, Twinkle, Little Star",
            composer: "Trad. (Ah! vous dirai-je, maman)",
            keyName: "C major",
            clef: "treble",
            // C C G G A A G | F F E E D D C
            notes: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60],
            lyrics: ["Twin", "kle", "twin", "kle", "lit", "tle", "star",
                     "how", "I", "won", "der", "what", "you", "are"],
        },
        {
            id: "ode-to-joy",
            key: "C major",
            title: "Ode to Joy",
            composer: "Beethoven · Symphony No. 9",
            keyName: "C major",
            clef: "treble",
            // E E F G G F E D C C D E E D D
            notes: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62],
        },
        {
            id: "frere-jacques",
            key: "C major",
            title: "Frère Jacques",
            composer: "Trad. French round",
            keyName: "C major",
            clef: "treble",
            // C D E C | C D E C | E F G | E F G | G A G F E C | G A G F E C | C G C | C G C
            notes: [
                60, 62, 64, 60, 60, 62, 64, 60,
                64, 65, 67, 64, 65, 67,
                67, 69, 67, 65, 64, 60, 67, 69, 67, 65, 64, 60,
                60, 55, 60, 60, 55, 60,
            ],
        },
        {
            id: "ode-bass",
            key: "C major",
            title: "Ode to Joy (Bass clef)",
            composer: "Beethoven · for Clef de Fa practice",
            keyName: "C major",
            clef: "bass",
            notes: [52, 52, 53, 55, 55, 53, 52, 50, 48, 48, 50, 52, 52, 50, 50],
        },
    ];

    function byId(id) {
        for (let i = 0; i < LIBRARY.length; i++) {
            if (LIBRARY[i].id === id) return LIBRARY[i];
        }
        return LIBRARY[0];
    }

    return { LIBRARY, byId };
}));
