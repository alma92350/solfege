/*
 * shared/audio.js — a tiny Web Audio synth shared by every trainer (UMD, like
 * shared/music.js). It turns MIDI numbers into short, soft tones so players hear
 * the pitch they just read, plus a low "wrong" buzz for misses.
 *
 * No samples, no assets: everything is synthesized with oscillators so it works
 * offline. The AudioContext is created lazily on the first sound (which always
 * follows a click/keypress, satisfying the browser autoplay gesture rule), and
 * `unlock()` can be called from a Start handler to resume it on mobile.
 */
(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.Solfege = root.Solfege || {};
        root.Solfege.audio = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    let ctx = null;
    let master = null;
    let enabled = true;

    function ensure() {
        if (typeof window === "undefined") return null;   // Node / tests: no-op
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.22;
            master.connect(ctx.destination);
        }
        if (ctx.state === "suspended" && ctx.resume) ctx.resume();
        return ctx;
    }

    function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

    // One enveloped oscillator voice (a soft plucked tone by default).
    function voice(midi, opts) {
        const c = ensure();
        if (!c) return;
        opts = opts || {};
        const t0 = c.currentTime + (opts.delay || 0);
        const dur = opts.dur || 0.55;
        const peak = opts.gain == null ? 0.9 : opts.gain;

        const osc = c.createOscillator();
        osc.type = opts.type || "triangle";
        osc.frequency.value = midiToFreq(midi);

        // A gentle low-pass keeps the triangle from sounding harsh up high.
        const lp = c.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = Math.min(8000, midiToFreq(midi) * 6);

        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);   // quick attack
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);   // soft decay

        osc.connect(lp); lp.connect(g); g.connect(master);
        osc.start(t0);
        osc.stop(t0 + dur + 0.03);
    }

    function setEnabled(on) { enabled = !!on; }
    function isEnabled() { return enabled; }
    function unlock() { if (enabled) ensure(); }

    // Play a single pitch.
    function playNote(midi, opts) {
        if (!enabled || !Number.isFinite(midi)) return;
        voice(midi, opts);
    }

    // Play several pitches together (a chord), slightly rolled and quieter.
    function playChord(midis, opts) {
        if (!enabled || !midis || !midis.length) return;
        const base = opts || {};
        const start = base.delay || 0;
        midis.forEach(function (m, i) {
            voice(m, { dur: base.dur || 0.8, gain: base.gain == null ? 0.55 : base.gain, delay: start + i * 0.018, type: base.type });
        });
    }

    // A short, low, slightly detuned buzz for a wrong / expired answer.
    function playError() {
        if (!enabled) return;
        voice(47, { dur: 0.22, gain: 0.5, type: "sawtooth" });
        voice(48, { dur: 0.22, gain: 0.4, type: "sawtooth", delay: 0.005 });
    }

    return {
        playNote: playNote, playChord: playChord, playError: playError,
        setEnabled: setEnabled, isEnabled: isEnabled, unlock: unlock, midiToFreq: midiToFreq,
    };
}));
