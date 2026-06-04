"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generate, ALIAS } = require("../build.js");

const ROOT = path.join(__dirname, "..");
const APP_PAGES = ["app.html", "chords.html", "song.html", "solfege.html"];

function read(name) {
    return fs.readFileSync(path.join(ROOT, name), "utf8");
}

test("solfege.html is in sync with app.html (run `node build.js`)", () => {
    const actual = fs.readFileSync(ALIAS, "utf8");
    assert.equal(actual, generate());
});

test("every trainer page loads the shared music module", () => {
    for (const page of APP_PAGES) {
        assert.match(read(page), /<script src="shared\/music\.js">/,
            `${page} should include shared/music.js`);
    }
});

test("no trainer page re-inlines the shared pitch helpers", () => {
    // Guards against a future edit copy-pasting the logic back in and letting it
    // drift from shared/music.js (the tested source of truth).
    for (const page of APP_PAGES) {
        const src = read(page);
        assert.doesNotMatch(src, /function midiToStaffStep\s*\(/,
            `${page} should delegate midiToStaffStep to shared/music.js`);
        assert.doesNotMatch(src, /function midiToSolfege\s*\(/,
            `${page} should delegate midiToSolfege to shared/music.js`);
    }
});
