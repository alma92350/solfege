"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const music = require("../shared/music.js");

test("keyFromName parses tonic, accidental, and mode", () => {
    const eb = music.keyFromName("Eb major");
    assert.equal(eb.accidentalType, "b");
    assert.equal(eb.tonicPc, 3);
    const c = music.keyFromName("C");
    assert.equal(c.accidentalType, "");
    assert.equal(c.sharpness, 0);
    assert.equal(music.keyFromName("F# minor").mode, "minor");
});

test("Eb major has exactly the Bb/Eb/Ab key signature, in order", () => {
    const key = music.keyFromName("Eb major");
    const sig = music.keySignature(key, "treble");
    assert.equal(sig.length, 3);
    assert.deepEqual(sig.map(a => a.type), ["b", "b", "b"]);
    // Conventional order Bb, Eb, Ab at their standard treble steps.
    assert.deepEqual(sig.map(a => music.LETTER_NAMES[a.letter]), ["B", "E", "A"]);
    assert.deepEqual(sig.map(a => a.step), [0, 3, -1]);
});

test("C major has an empty key signature", () => {
    assert.deepEqual(music.keySignature(music.keyFromName("C major"), "treble"), []);
});

test("Vapor Trail notes spell diatonically in Eb major (no drawn accidentals)", () => {
    const key = music.keyFromName("Eb major");
    // MIDI -> expected solfège (fixed-Do, by letter) for the intro figure.
    const cases = [
        [63, "MI", "E"],   // Eb -> E line, MI
        [67, "SOL", "G"],  // G
        [70, "SI", "B"],   // Bb -> B line, SI
        [68, "LA", "A"],   // Ab -> A line, LA
        [72, "DO", "C"],   // C
        [75, "MI", "E"],   // Eb (octave up)
        [74, "RE", "D"],   // D
        [77, "FA", "F"],   // F
    ];
    for (const [midi, sol, letter] of cases) {
        const s = music.spellNote(midi, key, "treble");
        assert.equal(s.solfege, sol, `MIDI ${midi} solfège`);
        assert.equal(s.letterName, letter, `MIDI ${midi} letter`);
        assert.equal(s.accidental, "", `MIDI ${midi} should carry no drawn accidental (key sig covers it)`);
        assert.equal(s.inKey, true, `MIDI ${midi} is diatonic`);
    }
});

test("Eb sits on the E line, not the D line, in Eb major", () => {
    const key = music.keyFromName("Eb major");
    // Treble bottom line E4 = step -4. The old chromatic spelling put Eb at -5.
    assert.equal(music.spellNote(63, key, "treble").staffStep, -4);
    // E natural in Eb major must be cancelled with a natural sign.
    const eNat = music.spellNote(64, key, "treble");
    assert.equal(eNat.letterName, "E");
    assert.equal(eNat.accidental, "natural");
});

test("C major spells the natural scale unchanged", () => {
    const key = music.keyFromName("C major");
    const cases = [[60, "DO", "C"], [62, "RE", "D"], [64, "MI", "E"], [65, "FA", "F"],
                   [67, "SOL", "G"], [69, "LA", "A"], [71, "SI", "B"]];
    for (const [midi, sol, letter] of cases) {
        const s = music.spellNote(midi, key, "treble");
        assert.equal(s.solfege, sol);
        assert.equal(s.letterName, letter);
        assert.equal(s.accidental, "");
        // Matches the legacy chromatic staff-step for naturals.
        assert.equal(s.staffStep, music.midiToStaffStep(midi, "treble"));
    }
});

test("chromatic notes spell with the key's flavour", () => {
    // Sharp key prefers sharps; flat key prefers flats.
    const g = music.keyFromName("G major"); // F# key (sharp side)
    const cSharp = music.spellNote(61, g, "treble");
    assert.equal(cSharp.letterName, "C");
    assert.equal(cSharp.accidental, "#");
    const f = music.keyFromName("F major"); // Bb key (flat side)
    const dFlat = music.spellNote(61, f, "treble");
    assert.equal(dFlat.letterName, "D");
    assert.equal(dFlat.accidental, "b");
});

test("bass-clef key signature uses the lower staff positions", () => {
    const key = music.keyFromName("Eb major");
    const sig = music.keySignature(key, "bass");
    assert.deepEqual(sig.map(a => music.LETTER_NAMES[a.letter]), ["B", "E", "A"]);
    assert.deepEqual(sig.map(a => a.step), [-2, 1, -3]);
});
