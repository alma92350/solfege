/*
 * shared/music.js — single source of truth for the trainer's pitch / music-theory
 * helpers, shared by every page (Notes, Chords, Songs).
 *
 * UMD wrapper: in the browser it attaches to `window.Solfege.music` (loaded via a
 * plain <script src> tag, which works from file:// without a server); under Node
 * it exports the same object so the test suite can exercise it directly.
 *
 * Convention: fixed-Do, chromatic. MIDI 60 = middle C = DO. There are no key
 * signatures — every accidental is spelled as a sharp, except pitch-class 10
 * (A#/Bb) which is spelled Bb / "SI" + flat. Keep this behaviour stable: the
 * three page bundles depend on it byte-for-byte.
 */
(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.Solfege = root.Solfege || {};
        root.Solfege.music = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const SOLFEGE_ORDER = ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"];
    const PC_TO_SOLFEGE = [
        "DO", "DO", "RE", "RE", "MI", "FA", "FA", "SOL", "SOL", "LA", "LA", "SI",
    ];
    const NATURAL_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);
    const FLAT_PCS = new Set([10]);
    const C_MAJOR_PCS = [0, 2, 4, 5, 7, 9, 11];

    function midiToSolfege(midi) {
        const pc = ((midi % 12) + 12) % 12;
        if (pc === 10) return "SI";
        return PC_TO_SOLFEGE[pc];
    }

    function midiToAccidental(midi) {
        const pc = ((midi % 12) + 12) % 12;
        if (NATURAL_PCS.has(pc)) return "";
        if (FLAT_PCS.has(pc)) return "b";
        return "#";
    }

    function midiToStaffStep(midi, clef) {
        const LETTER_IDX = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6];
        const pc = ((midi % 12) + 12) % 12;
        const octave = Math.floor(midi / 12) - 1;
        const letterIdx = LETTER_IDX[pc];
        const diatonic = octave * 7 + letterIdx;
        const middle = clef === "bass" ? 22 : 34;
        return diatonic - middle;
    }

    function isInCMajor(midi) {
        const pc = ((midi % 12) + 12) % 12;
        return C_MAJOR_PCS.includes(pc);
    }

    return {
        SOLFEGE_ORDER, PC_TO_SOLFEGE, NATURAL_PCS, FLAT_PCS, C_MAJOR_PCS,
        midiToSolfege, midiToAccidental, midiToStaffStep, isInCMajor,
    };
}));
