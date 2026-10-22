/* ============================================================
   VÉSPERA — Áudio procedural (Web Audio API)
   A trilha cresce quando o jogador lembra.
   A trilha se apaga quando o mundo é apagado.
   ============================================================ */
(function () {
  const Audio = {};
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let started = false;
  let muted = false;

  // Camadas de música (cada uma pode ser ligada/desligada)
  const layers = {};
  const scale = [0, 2, 3, 5, 7, 8, 10]; // menor natural, melancólica
  const baseFreq = 146.83; // D3

  function freq(semi) { return baseFreq * Math.pow(2, semi / 12); }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.0;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(master);
  }

  function ensure() {
    init();
    if (ctx.state === "suspended") ctx.resume();
  }

  // --- Um oscilador simples com envelope ---
  function tone(opt) {
    if (!ctx) return;
    const t0 = ctx.currentTime + (opt.delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opt.type || "sine";
    osc.frequency.setValueAtTime(opt.freq, t0);
    if (opt.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opt.to), t0 + opt.dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opt.vol || 0.2, t0 + (opt.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.dur);
    const dest = opt.dest || musicGain;
    osc.connect(g); g.connect(dest);
    osc.start(t0); osc.stop(t0 + opt.dur + 0.05);
  }

  function noise(dur, vol, filterHz) {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filterHz || 1200;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t0); src.stop(t0 + dur);
  }

  /* ---------- LOOP MUSICAL ---------- */
  let loopTimer = null;
  let step = 0;
  function scheduleLoop() {
    if (!ctx) return;
    const bar = [0, 4, 2, 5, 0, 3, 2, 1];
    const root = freq(scale[step % scale.length]);
    // Pad sempre presente (ambiente)
    if (layers.pad) {
      tone({ freq: root / 2, dur: 2.6, type: "sine", vol: 0.10, attack: 0.6, delay: 0 });
    }
    // Arpejo entra quando há memórias
    if (layers.harp && step % 2 === 0) {
      tone({ freq: root * 2, dur: 1.2, type: "triangle", vol: 0.07, attack: 0.05, dest: musicGain });
    }
    // Baixo caminha quando o mundo está mais consciente
    if (layers.bass && step % 4 === 0) {
      tone({ freq: root / 4, dur: 2.0, type: "sawtooth", vol: 0.05, attack: 0.2, dest: musicGain });
    }
    // Sino / cristal quando as dúvidas crescem
    if (layers.bell && step % 8 === 5) {
      tone({ freq: freq(scale[bar[step % bar.length]] + 12) * 2, dur: 2.4, type: "sine", vol: 0.06, attack: 0.01, dest: musicGain });
    }
    step++;
  }

  Audio.start = function () {
    ensure();
    if (started) return;
    started = true;
    musicGain.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 1.2);
    loopTimer = setInterval(scheduleLoop, 900);
  };

  Audio.setLayer = function (name, on) {
    layers[name] = !!on;
  };
  Audio.hasLayer = function (name) { return !!layers[name]; };

  Audio.setMuted = function (m) {
    muted = m;
    if (!ctx) return;
    master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.1);
  };
  Audio.isMuted = function () { return muted; };

  /* ---------- EFEITOS ---------- */
  Audio.sfx = {
    step: function () { noise(0.06, 0.10, 500); },
    interact: function () { ensure(); tone({ freq: 520, dur: 0.18, type: "triangle", vol: 0.22, dest: sfxGain }); },
    memory: function () {
      ensure();
      [0, 4, 7, 12].forEach((s, i) =>
        tone({ freq: freq(s + 12), dur: 1.6, type: "sine", vol: 0.18, attack: 0.02, delay: i * 0.12, dest: sfxGain }));
    },
    fragment: function () {
      ensure();
      [0, 7, 12, 19].forEach((s, i) =>
        tone({ freq: freq(s), dur: 2.2, type: "triangle", vol: 0.18, attack: 0.01, delay: i * 0.10, dest: sfxGain }));
    },
    erase: function () { noise(0.6, 0.35, 900); ensure(); tone({ freq: 300, to: 40, dur: 0.6, type: "sawtooth", vol: 0.2, dest: sfxGain }); },
    door: function () { ensure(); tone({ freq: 180, to: 320, dur: 0.25, type: "square", vol: 0.14, dest: sfxGain }); },
    hurt: function () { ensure(); tone({ freq: 220, to: 90, dur: 0.35, type: "square", vol: 0.25, dest: sfxGain }); },
    win: function () {
      ensure();
      [0, 4, 7, 12, 16, 19].forEach((s, i) =>
        tone({ freq: freq(s + 12), dur: 1.2, type: "triangle", vol: 0.2, delay: i * 0.09, dest: sfxGain }));
    },
    bad: function () {
      ensure();
      [0, -1, -3, -6].forEach((s, i) =>
        tone({ freq: freq(s), dur: 0.9, type: "sawtooth", vol: 0.18, delay: i * 0.14, dest: sfxGain }));
    },
    cat: function () { ensure(); tone({ freq: 700, to: 900, dur: 0.3, type: "sine", vol: 0.2, dest: sfxGain }); },
    glitch: function () { noise(0.12, 0.3, 3000); },
  };

  window.VesperaAudio = Audio;
})();
