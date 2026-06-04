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

    // ------------------------------------------------------------------
    // Key-aware ("musically correct") spelling.
    //
    // The helpers above are fixed-Do and chromatic: every black key is a
    // sharp (except Bb), regardless of context. That mis-spells flat keys —
    // in Eb major an Eb should sit on the E line under the key signature and
    // be named MI, not drawn as a D#. The functions below spell a note
    // diatonically within a given key and produce a real key signature.
    // ------------------------------------------------------------------

    const LETTER_PCS = [0, 2, 4, 5, 7, 9, 11];          // C D E F G A B
    const LETTER_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
    const LETTER_TO_SOLFEGE = ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"];
    const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
    const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];
    const ACC_TO_VAL = { "bb": -2, "b": -1, "": 0, "#": 1, "x": 2 };
    const VAL_TO_ACC = { "-2": "bb", "-1": "b", "0": "", "1": "#", "2": "x" };

    // Conventional staff-step of each key-signature accidental, by letter index,
    // for each clef. (Treble: B4 = step 0. Bass: D3 = step 0.)
    const KEYSIG_STEPS = {
        treble: {
            "#": { 3: 4, 0: 1, 4: 5, 1: 2, 5: -1, 2: 3, 6: 0 },   // F C G D A E B
            "b": { 6: 0, 2: 3, 5: -1, 1: 2, 4: -2, 0: 1, 3: -3 }, // B E A D G C F
        },
        bass: {
            "#": { 3: 2, 0: -1, 4: 3, 1: 0, 5: -3, 2: 1, 6: -2 },
            "b": { 6: -2, 2: 1, 5: -3, 1: 0, 4: -4, 0: -1, 3: -5 },
        },
    };
    const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B
    const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3];  // B E A D G C F

    function letterIndexOf(name) {
        return LETTER_NAMES.indexOf(String(name).toUpperCase());
    }

    function norm(accVal) {
        return ((accVal + 6) % 12) - 6; // fold into [-6, 5]; normal keys land in [-2, 2]
    }

    // Build a key descriptor from a tonic letter (C..B), tonic accidental
    // ("", "#", "b"), and mode ("major" | "minor").
    function makeKey(tonicLetter, tonicAcc, mode) {
        mode = mode === "minor" ? "minor" : "major";
        const steps = mode === "minor" ? NATURAL_MINOR_STEPS : MAJOR_STEPS;
        const tLet = letterIndexOf(tonicLetter);
        if (tLet < 0) throw new Error("makeKey: bad tonic letter " + tonicLetter);
        const tonicPc = (((LETTER_PCS[tLet] + (ACC_TO_VAL[tonicAcc] || 0)) % 12) + 12) % 12;
        const letterAcc = {};
        const degreePc = [];
        const degreeLetter = [];
        let sharps = 0, flats = 0;
        for (let i = 0; i < 7; i++) {
            const li = (tLet + i) % 7;
            const expectedPc = (tonicPc + steps[i]) % 12;
            const accVal = norm(expectedPc - LETTER_PCS[li]);
            letterAcc[li] = accVal;
            degreePc[i] = expectedPc;
            degreeLetter[i] = li;
            if (accVal > 0) sharps += accVal; else if (accVal < 0) flats += -accVal;
        }
        return {
            tonicLetter: tLet, tonicPc, mode, steps,
            letterAcc, degreePc, degreeLetter,
            accidentalType: flats > sharps ? "b" : (sharps > 0 ? "#" : ""),
            sharpness: sharps - flats,
        };
    }

    // Parse names like "Eb major", "F# minor", "C", "Bb Major".
    function keyFromName(name) {
        const m = String(name).trim().match(/^([A-Ga-g])([#b]?)\s*(maj(or)?|min(or)?)?$/);
        if (!m) return makeKey("C", "", "major");
        const mode = /min/i.test(m[3] || "") ? "minor" : "major";
        return makeKey(m[1], m[2], mode);
    }

    // Spell a MIDI note within a key: which letter/line it sits on, what
    // accidental (if any) to draw on the note, and its solfège (fixed-Do).
    function spellNote(midi, key, clef) {
        clef = clef === "bass" ? "bass" : "treble";
        const pc = ((midi % 12) + 12) % 12;
        let li = -1, accVal = 0, inKey = false, degree = -1;
        for (let i = 0; i < 7; i++) {
            if (key.degreePc[i] === pc) {
                li = key.degreeLetter[i];
                accVal = key.letterAcc[li];
                inKey = true; degree = i; break;
            }
        }
        let displayAcc;
        if (inKey) {
            displayAcc = ""; // covered by the key signature
        } else if (LETTER_PCS.indexOf(pc) !== -1) {
            // A "white key" that isn't diatonic — i.e. the key alters this very
            // letter (E natural in Eb major). Keep the letter; cancel with a
            // natural sign.
            li = LETTER_PCS.indexOf(pc);
            accVal = 0;
            displayAcc = (key.letterAcc[li] || 0) === 0 ? "" : "natural";
        } else {
            // A "black key": spell as a neighbouring letter a semitone away,
            // preferring flats in flat/neutral keys and sharps in sharp keys.
            const preferFlat = key.sharpness <= 0;
            const ones = [];
            for (let L = 0; L < 7; L++) {
                const a = norm(pc - LETTER_PCS[L]);
                if (Math.abs(a) === 1) ones.push({ L: L, a: a });
            }
            const chosen = ones.find(c => (preferFlat ? c.a === -1 : c.a === 1)) || ones[0];
            li = chosen.L; accVal = chosen.a;
            const keyAcc = key.letterAcc[li] || 0;
            displayAcc = accVal === keyAcc ? "" : (accVal === 0 ? "natural" : VAL_TO_ACC[String(accVal)]);
        }
        const octave = Math.round((midi - LETTER_PCS[li] - accVal) / 12) - 1;
        const middle = clef === "bass" ? 22 : 34;
        return {
            midi: midi, pc: pc,
            letter: li, letterName: LETTER_NAMES[li],
            accidentalValue: accVal, accidental: displayAcc,
            solfege: LETTER_TO_SOLFEGE[li],
            inKey: inKey, degree: degree,
            staffStep: octave * 7 + li - middle,
        };
    }

    // The accidentals that make up a key signature, in conventional drawing
    // order, each with the staff step at which it should be rendered.
    function keySignature(key, clef) {
        clef = clef === "bass" ? "bass" : "treble";
        if (!key.accidentalType) return [];
        const order = key.accidentalType === "b" ? FLAT_ORDER : SHARP_ORDER;
        const table = KEYSIG_STEPS[clef][key.accidentalType];
        const out = [];
        for (let i = 0; i < order.length; i++) {
            const li = order[i];
            const a = key.letterAcc[li] || 0;
            if (a === 0) continue;
            out.push({ letter: li, type: a < 0 ? "b" : "#", step: table[li] });
        }
        return out;
    }

    return {
        SOLFEGE_ORDER, PC_TO_SOLFEGE, NATURAL_PCS, FLAT_PCS, C_MAJOR_PCS,
        midiToSolfege, midiToAccidental, midiToStaffStep, isInCMajor,
        LETTER_NAMES, LETTER_TO_SOLFEGE,
        makeKey, keyFromName, spellNote, keySignature,
    };
}));
