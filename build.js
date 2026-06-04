#!/usr/bin/env node
/*
 * build.js — generates the `solfege.html` alias from `app.html`.
 *
 * `solfege.html` exists so the Notes trainer is reachable at /solfege.html, but
 * it is otherwise identical to `app.html`. Rather than hand-maintaining two
 * copies of an ~1700-line file (which silently drift), `app.html` is the single
 * source and this script derives the alias by swapping the self-referential nav
 * link to point at itself.
 *
 *   node build.js          # (re)write solfege.html from app.html
 *   node build.js --check  # exit non-zero if solfege.html is stale (for CI)
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "app.html");
const ALIAS = path.join(ROOT, "solfege.html");

// The Notes tab is "active" and self-referential. In app.html it points to
// app.html; in the alias it must point to solfege.html.
const FROM = '<a class="mode-tab is-active" href="app.html" aria-current="page">Notes</a>';
const TO = '<a class="mode-tab is-active" href="solfege.html" aria-current="page">Notes</a>';

function generate() {
    const src = fs.readFileSync(SOURCE, "utf8");
    if (src.indexOf(FROM) === -1) {
        throw new Error("build: expected active Notes nav link not found in app.html");
    }
    return src.split(FROM).join(TO);
}

function main() {
    const check = process.argv.includes("--check");
    const expected = generate();
    if (check) {
        const actual = fs.existsSync(ALIAS) ? fs.readFileSync(ALIAS, "utf8") : "";
        if (actual !== expected) {
            console.error("solfege.html is out of sync with app.html. Run `node build.js`.");
            process.exit(1);
        }
        console.log("solfege.html is in sync with app.html.");
        return;
    }
    fs.writeFileSync(ALIAS, expected);
    console.log("Wrote solfege.html from app.html.");
}

if (require.main === module) main();

module.exports = { generate, SOURCE, ALIAS };
