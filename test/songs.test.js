"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const music = require("../shared/music.js");
const songs = require("../shared/songs.js");

test("song library is structurally valid", () => {
    const ids = new Set();
    for (const s of songs.LIBRARY) {
        assert.ok(s.id, "song needs an id");
        assert.ok(!ids.has(s.id), `duplicate song id ${s.id}`);
        ids.add(s.id);
        assert.ok(Array.isArray(s.notes) && s.notes.length > 0, `${s.id} needs notes`);
        for (const n of s.notes) {
            assert.ok(Number.isInteger(n) && n >= 0 && n <= 127, `${s.id} bad MIDI ${n}`);
        }
        assert.ok(s.clef === "treble" || s.clef === "bass", `${s.id} clef`);
        if (s.lyrics) {
            assert.equal(s.lyrics.length, s.notes.length, `${s.id} lyrics/notes length`);
        }
        // The declared key must parse.
        assert.doesNotThrow(() => music.keyFromName(s.key), `${s.id} key parses`);
    }
});

test("byId returns the right song and falls back to the first", () => {
    assert.equal(songs.byId("twinkle").id, "twinkle");
    assert.equal(songs.byId("does-not-exist").id, songs.LIBRARY[0].id);
});

test("every song's notes spell diatonically in its key (no stray accidentals)", () => {
    // This is the musical-correctness guarantee: in the right key the melody
    // reads cleanly, the key signature carrying any flats/sharps. If a future
    // song includes a chromatic note, give it a key where that note is diatonic
    // or accept the explicit accidental by relaxing this test for that song.
    for (const s of songs.LIBRARY) {
        const key = music.keyFromName(s.key);
        for (const midi of s.notes) {
            const spelled = music.spellNote(midi, key, s.clef);
            assert.equal(spelled.accidental, "",
                `${s.id}: MIDI ${midi} (${spelled.letterName}) drew a "${spelled.accidental}" — not diatonic in ${s.key}`);
        }
    }
});

test("Vapor Trail reads as MI/SOL/SI/LA/DO… not RE#/SOL#", () => {
    const vt = songs.byId("vapor-trail");
    const key = music.keyFromName(vt.key);
    const sols = vt.notes.map(m => music.spellNote(m, key, vt.clef).solfege);
    // First bar: Eb G Bb G Eb G Bb G -> MI SOL SI SOL MI SOL SI SOL
    assert.deepEqual(sols.slice(0, 8), ["MI", "SOL", "SI", "SOL", "MI", "SOL", "SI", "SOL"]);
    assert.ok(!sols.includes(undefined));
});
