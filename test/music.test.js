"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const music = require("../shared/music.js");

// Reference octave anchored at middle C (MIDI 60 = DO).
test("midiToSolfege maps the C-major scale (fixed Do)", () => {
    const pairs = [
        [60, "DO"], [62, "RE"], [64, "MI"], [65, "FA"],
        [67, "SOL"], [69, "LA"], [71, "SI"], [72, "DO"],
    ];
    for (const [midi, name] of pairs) {
        assert.equal(music.midiToSolfege(midi), name, `MIDI ${midi}`);
    }
});

test("midiToSolfege is octave-invariant and handles negatives", () => {
    assert.equal(music.midiToSolfege(48), "DO");
    assert.equal(music.midiToSolfege(0), "DO");
    assert.equal(music.midiToSolfege(-12), "DO");
    assert.equal(music.midiToSolfege(-1), "SI"); // pc 11
});

test("midiToAccidental: naturals blank, Bb flat, everything else sharp", () => {
    assert.equal(music.midiToAccidental(60), "");   // C
    assert.equal(music.midiToAccidental(62), "");   // D
    assert.equal(music.midiToAccidental(61), "#");  // C#
    assert.equal(music.midiToAccidental(63), "#");  // D#/Eb
    assert.equal(music.midiToAccidental(70), "b");  // A#/Bb -> flat-spelled
    assert.equal(music.midiToAccidental(66), "#");  // F#
});

test("accidental spelling is consistent across octaves", () => {
    for (let oct = 0; oct < 8; oct++) {
        assert.equal(music.midiToAccidental(60 + 12 * (oct - 4)), "");  // C natural
        assert.equal(music.midiToAccidental(70 + 12 * (oct - 4)), "b"); // Bb flat
    }
});

test("midiToStaffStep: middle C / treble & bass anchors", () => {
    // Treble: middle line is B4 (step 0); middle C sits one step below the
    // bottom line at step -2. Bass: middle line is D3 (step 0).
    assert.equal(music.midiToStaffStep(71, "treble"), 0);  // B4 middle line
    assert.equal(music.midiToStaffStep(60, "treble"), -6); // C4 below staff
    assert.equal(music.midiToStaffStep(50, "bass"), 0);    // D3 middle line
});

test("midiToStaffStep climbs by one per diatonic letter", () => {
    // C -> D is one staff step; an octave is seven steps.
    assert.equal(
        music.midiToStaffStep(62, "treble") - music.midiToStaffStep(60, "treble"), 1);
    assert.equal(
        music.midiToStaffStep(72, "treble") - music.midiToStaffStep(60, "treble"), 7);
    // Enharmonic D#/Eb shares the D line (same step, distinguished by accidental).
    assert.equal(
        music.midiToStaffStep(63, "treble"), music.midiToStaffStep(62, "treble"));
});

test("isInCMajor identifies the natural pitch classes", () => {
    const inC = [60, 62, 64, 65, 67, 69, 71];
    const outC = [61, 63, 66, 68, 70];
    for (const m of inC) assert.equal(music.isInCMajor(m), true, `MIDI ${m}`);
    for (const m of outC) assert.equal(music.isInCMajor(m), false, `MIDI ${m}`);
});

test("exported constants are well-formed", () => {
    assert.deepEqual(music.SOLFEGE_ORDER, ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"]);
    assert.equal(music.PC_TO_SOLFEGE.length, 12);
    assert.ok(music.NATURAL_PCS instanceof Set);
    assert.equal(music.NATURAL_PCS.size, 7);
});
