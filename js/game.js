/* ============================================================
   VÉSPERA — engine e jogo
   ============================================================ */
(function () {
  const D = window.VesperaData;
  const A = window.VesperaAudio;

  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const el = (id) => document.getElementById(id);

  /* ---------------------------------------------------------
     CONFIG
     --------------------------------------------------------- */
  const C = { tile: 52, playerSpeed: 200, interactReach: 1.55 };
  let cw = 0, ch = 0;

  function resize() {
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = cw; canvas.height = ch;
    C.tile = Math.max(38, Math.min(64, Math.floor(Math.min(cw, ch) / 11)));
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---------------------------------------------------------
     ESTADO
     --------------------------------------------------------- */
  const SAVE_KEY = "vespera_save_v1";
  const META_KEY = "vespera_meta_v1";

  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || { cycles: 0, endings: {} }; }
    catch (e) { return { cycles: 0, endings: {} }; }
  }
  function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {} }

  let meta = loadMeta();
  let S = null;            // estado da partida
  let mode = "menu";       // menu|play|dialogue|inventory|puzzle|battle|cutscene|ending|howto|credits
  let area = null;
  let mapW = 0, mapH = 0, mapPxW = 0, mapPxH = 0;
  let last = performance.now();
  let toastQueue = [];
  let camX = 0, camY = 0;
  let particles = [];
  let idleTimer = 0;
  let defeatShown = false;

  function newState() {
    return {
      stats: { mem: 0, cou: 0, dou: 0 },
      inv: {},
      flags: {},
      fragments: [false, false, false, false, false],
      area: "rua",
      px: 0, py: 0, dir: "down",
      catfollow: 0,
      visited: {},
      corrupt: 0,
      dlg: null,
    };
  }

  function saveGame() {
    if (!S) return;
    try {
      const copy = JSON.parse(JSON.stringify({ stats: S.stats, inv: S.inv, flags: S.flags, fragments: S.fragments, area: S.area, px: S.px, py: S.py, dir: S.dir, catfollow: S.catfollow, visited: S.visited, corrupt: S.corrupt }));
      localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
      el("btn-continue").disabled = false;
    } catch (e) {}
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  function loadGame() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY));
      const base = newState();
      Object.assign(base, d);
      return base;
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------
     HELPERS DE MAPA
     --------------------------------------------------------- */
  function tileChar(tx, ty) {
    if (!area) return "#";
    const row = area.map[ty];
    if (!row) return "#";
    const c = row[tx];
    return c === undefined ? "#" : c;
  }
  function isSolid(c) { return c === "#" || c === "T" || c === "~" || c === "w"; }

  function computeMapSize() {
    mapH = area.map.length;
    mapW = 0;
    for (const r of area.map) if (r.length > mapW) mapW = r.length;
    mapPxW = mapW * C.tile; mapPxH = mapH * C.tile;
  }

  /* ---------------------------------------------------------
     UTIL
     --------------------------------------------------------- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex2rgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2css(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }
  function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }
  function cold(rgb, t) { return mix(rgb, [70, 90, 130], t); } // lavado/azulado
  function noise1(x, y) { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }

  // pseudo-random determinístico por tile
  function tileNoise(tx, ty, seed) { return noise1(tx + seed * 7.3, ty + seed * 3.1); }

  /* ---------------------------------------------------------
     PARTÍCULAS DE FUNDO
     --------------------------------------------------------- */
  function initParticles() {
    particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * cw, y: Math.random() * ch, s: Math.random() * 2 + 0.4, v: Math.random() * 0.25 + 0.05, o: Math.random() * 0.5 + 0.2 });
    }
  }
  initParticles();

  /* ---------------------------------------------------------
     ENTRAR EM ÁREA / TRANSIÇÃO
     --------------------------------------------------------- */
  function enterArea(id, tx, ty) {
    area = D.AREAS[id];
    S.area = id;
    computeMapSize();
    if (tx != null) { S.px = tx * C.tile + C.tile / 2; S.py = ty * C.tile + C.tile / 2; }
    else { S.px = area.spawn.x * C.tile + C.tile / 2; S.py = area.spawn.y * C.tile + C.tile / 2; }
    S.px = Math.max(1, Math.min(mapPxW - 1, S.px));
    S.py = Math.max(1, Math.min(mapPxH - 1, S.py));
    S.visited[id] = true;
    if (area.onEnter) {
      if (area.onEnter.corrupt != null) S.corrupt = area.onEnter.corrupt;
      if (area.onEnter.music) setMusic(area.onEnter.music);
      if (area.onEnter.toast) toast(area.onEnter.toast);
    }
    updateHud();
    updateCorruptVisual();
    saveGame();
    A.sfx.door();
  }

  function setMusic(kind) {
    // liga camadas conforme memórias e tom da área
    A.setLayer("pad", true);
    A.setLayer("harp", S.stats.mem >= 2);
    A.setLayer("bass", kind !== "void" && S.stats.mem >= 4);
    A.setLayer("bell", S.stats.dou >= 5);
  }

  function checkPortal() {
    const pcx = S.px / C.tile, pcy = S.py / C.tile;
    for (const p of area.portals) {
      if (Math.abs(pcx - (p.x + 0.5)) < 0.55 && Math.abs(pcy - (p.y + 0.5)) < 0.55) {
        enterArea(p.to, p.tx, p.ty);
        return true;
      }
    }
    return false;
  }

  /* ---------------------------------------------------------
     HUD / TOAST / CORRUPÇÃO
     --------------------------------------------------------- */
  function updateHud() {
    el("hud-area").textContent = area ? area.name : "—";
    el("stat-mem").textContent = S.stats.mem;
    el("stat-cou").textContent = S.stats.cou;
    el("stat-dou").textContent = S.stats.dou;
  }
  function toast(text, kind) {
    const box = el("toast");
    const d = document.createElement("div");
    d.className = "toast-item " + (kind || "");
    d.textContent = text;
    box.appendChild(d);
    setTimeout(() => d.remove(), 3200);
  }
  function updateCorruptVisual() {
    document.documentElement.style.setProperty("--corrupt", S ? S.corrupt : 0);
    el("app").classList.toggle("corrupt", S && S.corrupt > 0.15);
  }

  /* ---------------------------------------------------------
     INPUT
     --------------------------------------------------------- */
  const keys = {};
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    keys[e.key.toLowerCase()] = true;
    handleKey(e);
  });
  window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

  function handleKey(e) {
    const k = e.key.toLowerCase();
    if (mode === "play") {
      if (k === "e" || k === " ") { interact(); }
      if (k === "i") openInventory();
      if (k === "m") { A.setMuted(!A.isMuted()); toast(A.isMuted() ? "Som desligado" : "Som ligado"); }
      if (k === "escape") openPause();
    } else if (mode === "dialogue") {
      if (k === "escape") closeDialogue();
    } else if (mode === "inventory") {
      if (k === "i" || k === "escape") closeInventory();
    } else if (mode === "cutscene") {
      if (k === " " || k === "enter" || k === "escape") advanceCut();
    } else if (mode === "puzzle") {
      if (k === "escape") closePuzzle(false);
    } else if (mode === "howto") { if (k === "escape") hide("howto"), (mode = "menu"); }
    else if (mode === "credits") { if (k === "escape") hide("credits"), (mode = "menu"); }
    else if (mode === "ending") { if (k === " " || k === "enter") restart(); }
  }

  // clique genérico em overlays de cutscene
  el("cutscene").addEventListener("click", advanceCut);

  /* ---------------------------------------------------------
     INTERAÇÃO
     --------------------------------------------------------- */
  function nearestInteractable() {
    const pcx = S.px / C.tile, pcy = S.py / C.tile;
    let best = null, bestD = Infinity;
    const consider = (item, type) => {
      const d = Math.hypot((item.x + 0.5) - pcx, (item.y + 0.5) - pcy);
      if (d < C.interactReach && d < bestD) { bestD = d; best = { item, type }; }
    };
    for (const o of area.objects) {
      if (o.hidden && !(o.requires && S.flags[o.requires])) continue;
      consider(o, "object");
    }
    for (const n of area.npcs) consider(n, "npc");
    return best;
  }

  function interact() {
    const t = nearestInteractable();
    if (!t) { A.sfx.step(); return; }
    const it = t.item;
    if (t.type === "npc") { openDialogue(it.dialog); return; }
    const k = it.kind;
    if (k === "look") returnInteractLook(it);
    else if (k === "memory") returnInteractMemory(it);
    else if (k === "fragment") returnInteractFragment(it);
    else if (k === "puzzle") returnInteractPuzzle(it);
    else if (k === "battle") returnInteractBattle(it);
    else if (k === "secret_cat") returnInteractSecret(it);
    else if (k === "finaldoor") returnInteractFinalDoor(it);
    else if (k === "error_exit") returnInteractError(it);
    else if (k === "talk") return openDialogue(it.dialog);
    else if (k === "lastpage") return openDialogue("last_1");
    else returnInteractLook(it);
  }

  function reqBlocked(it) {
    if (it.requires && !S.flags[it.requires]) {
      showText("", it.imbue || "Ainda não. Falta alguma coisa que você não tem — ou ainda não entendeu.", null);
      return true;
    }
    return false;
  }

  function returnInteractLook(it) {
    A.sfx.interact();
    if (it.requires && !S.flags[it.requires]) { showText(it.name || "", it.imbue || "Ainda não. Falta alguma coisa que você não tem — ou ainda não entendeu.", null); return; }
    if (it.give && !S.inv[it.give]) giveItem(it.give);
    showText(it.name, it.text, null);
    if (it.id === "placa") addStat("dou", 1);
  }
  function returnInteractMemory(it) {
    A.sfx.memory();
    if (it.flag && !S.flags[it.flag]) {
      S.flags[it.flag] = true;
      addStat("mem", it.mem || 1);
      if (it.imbue) toast("Anotado: " + it.imbue, "mem");
    }
    showText("🕯️ Memória", it.text, null);
    setMusic(area.onEnter && area.onEnter.music);
  }
  function returnInteractFragment(it) {
    if (reqBlocked(it)) return;
    if (it.id === "santuario" && S.dir !== "down") {
      showText("Santuário Trocado", "Ele está de costas para você. A voz repete: «caminhe na direção oposta ao que vê».\n(Chegue se movendo para BAIXO, afastando-se dele.)", null);
      return;
    }
    if (S.fragments[it.frag]) { showText("", "O vazio que restou aqui ainda tem o formato de uma palavra.", null); return; }
    collectFragment(it.frag);
  }
  function returnInteractPuzzle(it) {
    if (reqBlocked(it)) return;
    openPuzzle(it.puzzle, it);
  }
  function returnInteractBattle(it) {
    if (S.flags[it.enemy + "_done"]) { showText("", "Só resta um arranhão no ar. Você já venceu isto.", null); return; }
    startBattle(it.enemy);
  }
  function returnInteractSecret(it) {
    if (S.catfollow < 3) {
      showText("Armário", "O armário está travado por dentro, como se algo do outro lado segurasse a porta. Você sente cheiro de pelo. Talvez o gato precise mostrar o caminho três vezes.", null);
      return;
    }
    if (S.flags.armario_aberto) { showText("Armário", "O caminho continua aberto, para o Rascunho.", null); return; }
    S.flags.armario_aberto = true;
    toast("O gato empurrou a porta por dentro. Abriu.", "mem");
    showCutscene(["O gato passa por você e empurra a porta do armário por dentro.", "Atrás das roupas velhas, não há parede. Há uma passagem que desce, e desce, para dentro da história."], () => {
      enterArea("rascunho", 10, 9);
      mode = "play";
    });
  }
  function returnInteractFinalDoor(it) {
    if (!allFragments()) { showText("Porta sem Maçaneta", "Escrita na madeira: «Só abre para quem já reuniu as cinco palavras.» Você tem " + countFragments() + " de 5.", null); return; }
    showCutscene([D.CUT_FRAGMENTS, "A porta sem maçaneta se abre sozinha. Do outro lado, uma página branca, enorme, pisca como um farol."], () => {
      enterArea("pagina", 10, 9);
      mode = "play";
    });
  }
  function returnInteractError(it) {
    showText("🕯️ A Vela do Fim", "Se você apagar o mundo antes que ele te apague, talvez escape pela beirada da página.\nMas ninguém nunca voltou para dizer o que há do lado de fora.", [
      { text: "Apagar o mundo.", effects: [{ t: "ending", id: "erro" }] },
      { text: "Recuar.", effects: [] },
    ]);
  }

  /* ---------------------------------------------------------
     FRAGMENTOS / STATS / ITENS
     --------------------------------------------------------- */
  function allFragments() { return S.fragments.every(Boolean); }
  function countFragments() { return S.fragments.filter(Boolean).length; }
  function collectFragment(i) {
    if (S.fragments[i]) { showText("📄 Fragmento da Última Página", "Você já guardou esta palavra. Ela ainda queima um pouco.", null); return; }
    S.fragments[i] = true;
    A.sfx.fragment();
    addStat("mem", 1);
    toast("Fragmento " + countFragments() + "/5 — «" + D.FRAGMENTS[i] + "»", "mem");
    showText("📄 Fragmento da Última Página", "Você guarda o pedaço de papel. Uma palavra queima na sua mão:\n\n« " + D.FRAGMENTS[i] + " »", null);
    saveGame();
    if (allFragments()) {
      S.flags.frag5 = true;
      setTimeout(() => showCutscene([D.CUT_FRAGMENTS, "A frase inteira ecoa. Você precisa levá-la à Biblioteca Impossível — à porta sem maçaneta."], () => {}), 400);
    }
  }
  function addStat(k, v) { S.stats[k] = Math.max(0, S.stats[k] + v); updateHud(); setMusic(area.onEnter && area.onEnter.music); }
  function giveItem(id) {
    if (S.inv[id]) return;
    S.inv[id] = true;
    const it = D.ITEMS[id];
    toast("Objeto: " + (it ? it.nm : id), "mem");
    A.sfx.interact();
  }
  function removeRandomItem() {
    const ids = Object.keys(S.inv);
    if (!ids.length) return null;
    const id = ids[Math.floor(Math.random() * ids.length)];
    delete S.inv[id];
    return id;
  }
  function eraseSomething(what, target) {
    A.sfx.erase();
    S.corrupt = Math.min(1, S.corrupt + 0.1);
    updateCorruptVisual();
    if (what === "item") { const id = removeRandomItem(); if (id) toast("Apagado do inventário: " + D.ITEMS[id].nm, "bad"); }
    else if (what === "name") { S.flags["nome_apagado_" + (target || "alguem")] = true; toast("Um nome foi apagado do mundo: " + (target || "alguém"), "bad"); }
    else if (what === "memory") { addStat("mem", -1); toast("Uma memória sua se apagou.", "bad"); }
    else if (what === "dialogue") { S.flags["fala_apagada"] = true; toast("Você esquece uma conversa inteira.", "bad"); }
    saveGame();
  }

  /* ---------------------------------------------------------
     DIÁLOGO
     --------------------------------------------------------- */
  function openDialogue(key) {
    const node = D.DIALOGUES[key];
    if (!node) return;
    openNodeObj(node, key);
  }
  function openNodeObj(node, key) {
    A.sfx.interact();
    if (node.effects) applyEffects(node.effects);
    S.dlg = { node, key };
    const speaker = typeof node.speaker === "function" ? node.speaker(S) : node.speaker;
    const text = typeof node.text === "function" ? node.text(S) : node.text;
    el("dlg-speaker").textContent = speaker || "";
    el("dlg-text").textContent = text || "";
    const cbox = el("dlg-choices");
    cbox.innerHTML = "";
    const choices = (node.choices || []).filter((c) => !c.if || c.if(S));
    if (choices.length === 0) {
      const b = document.createElement("button");
      b.className = "dlg-choice";
      b.textContent = "▸ continuar";
      b.onclick = () => {
        if (node.next && node.next !== null) openNodeObj(D.DIALOGUES[node.next], node.next);
        else if (mode === "dialogue") closeDialogue();
      };
      cbox.appendChild(b);
    } else {
      choices.forEach((c) => {
        const b = document.createElement("button");
        b.className = "dlg-choice" + (c.q ? " q" : "");
        b.textContent = c.text;
        b.onclick = () => {
          if (c.effects) applyEffects(c.effects);
          if (c.next && c.next !== null) {
            const nx = typeof c.next === "function" ? c.next(S) : c.next;
            openNodeObj(D.DIALOGUES[nx], nx);
          } else if (mode === "dialogue") closeDialogue();
        };
        cbox.appendChild(b);
      });
    }
    show("dialogue");
    mode = "dialogue";
  }
  function closeDialogue() {
    hide("dialogue");
    S.dlg = null;
    mode = "play";
  }
  // texto simples (narração) reutilizando o overlay
  function showText(speaker, text, choices) {
    openNodeObj({ speaker: speaker || "", text: text, choices: choices || null }, "__text");
  }
  function showCutscene(lines, onDone) {
    cutLines = lines.slice(); cutIndex = 0; cutDone = onDone || null;
    renderCut();
    show("cutscene");
    mode = "cutscene";
  }

  /* ---------------------------------------------------------
     EFEITOS
     --------------------------------------------------------- */
  function applyEffects(effects) {
    for (const e of effects) {
      switch (e.t) {
        case "stat": addStat(e.k, e.v); break;
        case "flag": S.flags[e.k] = e.v; break;
        case "item": giveItem(e.id); break;
        case "take": delete S.inv[e.id]; break;
        case "frag": collectFragment(e.i); break;
        case "battle": startBattle(e.id); break;
        case "go": enterArea(e.area, e.x, e.y); break;
        case "ending": endGame(e.id); break;
        case "endpick": endGame(pickEnding(S, e.choice)); break;
        case "toast": toast(e.text, e.kind); break;
        case "corrupt": S.corrupt = Math.min(1, S.corrupt + e.v); updateCorruptVisual(); break;
        case "music": A.setLayer(e.layer, e.on); break;
        case "erase": eraseSomething(e.what, e.target); break;
        case "catfollow":
          S.catfollow++;
          A.sfx.cat();
          if (S.catfollow >= 2) S.flags.cat_followed = true;
          if (S.catfollow >= 3) S.flags.cat_secret = true;
          saveGame();
          break;
      }
    }
  }

  /* ---------------------------------------------------------
     CUTSCENE
     --------------------------------------------------------- */
  let cutLines = [], cutIndex = 0, cutDone = null;
  function renderCut() { el("cut-text").textContent = cutLines[cutIndex] || ""; }
  function advanceCut() {
    if (mode !== "cutscene") return;
    cutIndex++;
    if (cutIndex >= cutLines.length) {
      hide("cutscene");
      mode = "play";
      const d = cutDone; cutDone = null;
      if (d) d();
    } else renderCut();
  }

  /* ---------------------------------------------------------
     INVENTÁRIO
     --------------------------------------------------------- */
  function openInventory() {
    const grid = el("inv-grid"); grid.innerHTML = "";
    const ids = Object.keys(S.inv);
    if (!ids.length) grid.innerHTML = '<p class="dim" style="color:#8a7f9a">Sua mochila está vazia — por enquanto.</p>';
    ids.forEach((id) => {
      const it = D.ITEMS[id] || { ic: "❔", nm: id, desc: "" };
      const d = document.createElement("div");
      d.className = "inv-slot" + (it.strange ? " strange" : "");
      d.innerHTML = `<span class="ic">${it.ic}</span><span class="nm">${it.nm}</span>`;
      d.onclick = () => { el("inv-desc").textContent = "« " + it.desc + " »"; A.sfx.interact(); };
      grid.appendChild(d);
    });
    el("inv-desc").textContent = "Selecione um objeto estranho para examiná-lo.";
    show("inventory"); mode = "inventory";
  }
  function closeInventory() { hide("inventory"); mode = "play"; }

  /* ---------------------------------------------------------
     ENIGMAS
     --------------------------------------------------------- */
  let puzzle = null;
  function openPuzzle(id, srcObj) {
    const cfg = D.PUZZLES[id];
    puzzle = { id, cfg, obj: srcObj, state: {} };
    el("puzzle-title").textContent = cfg.title;
    el("puzzle-desc").textContent = cfg.desc;
    el("puzzle-msg").textContent = "";
    el("puzzle-close").onclick = () => closePuzzle(false);
    const body = el("puzzle-body"); body.innerHTML = "";
    if (id === "piano") buildPiano(body);
    else if (id === "clocks") buildClocks(body);
    else if (id === "lake") buildLake(body);
    show("puzzle"); mode = "puzzle";
  }
  function closePuzzle(solved) { hide("puzzle"); puzzle = null; mode = "play"; if (solved) A.sfx.win(); }
  function puzzleSolve(id) {
    S.flags[id] = true;
    A.sfx.win();
    toast("Enigma resolvido.", "mem");
    el("puzzle-msg").textContent = "✔ Você resolveu. Algo se abriu.";
    saveGame();
    setTimeout(() => closePuzzle(true), 900);
  }

  /* --- Piano (memória / Simon) --- */
  function buildPiano(body) {
    const notes = [0, 1, 2, 3];
    const colors = ["#e7b463", "#d98fb0", "#7fd6d1", "#9ad07a"];
    const seq = [];
    for (let i = 0; i < 4; i++) seq.push(notes[Math.floor(Math.random() * 4)]);
    puzzle.state = { seq, idx: 0, playing: true, input: 0 };
    const row = document.createElement("div");
    row.className = "clock-row";
    const pads = [];
    for (let i = 0; i < 4; i++) {
      const b = document.createElement("div");
      b.style.cssText = `width:70px;height:70px;border-radius:12px;background:${colors[i]};opacity:.35;cursor:pointer;transition:.15s`;
      b.onclick = () => pianoPress(i, pads);
      pads.push(b); row.appendChild(b);
    }
    body.appendChild(row);
    const disp = document.createElement("div");
    disp.className = "seq-display"; disp.id = "piano-disp"; disp.textContent = "ouvindo…";
    body.appendChild(disp);
    // toca a sequência
    let k = 0;
    const play = () => {
      if (k >= seq.length) { puzzle.state.playing = false; disp.textContent = "sua vez"; return; }
      const n = seq[k];
      pads[n].style.opacity = "1";
      pads[n].style.transform = "translateY(-8px)";
      if (A.sfx && A.sfx.interact) A.sfx.interact();
      setTimeout(() => { pads[n].style.opacity = ".35"; pads[n].style.transform = "none"; k++; setTimeout(play, 220); }, 320);
    };
    setTimeout(play, 400);
  }
  function pianoPress(i, pads) {
    if (!puzzle || puzzle.state.playing) return;
    pads[i].style.opacity = "1"; setTimeout(() => pads[i].style.opacity = ".35", 140);
    if (A.sfx) A.sfx.interact();
    const st = puzzle.state;
    if (puzzle.state.seq[st.idx] === i) {
      st.idx++;
      if (st.idx >= st.seq.length) { el("puzzle-msg").textContent = "A canção inteira. O piano suspira e algo trava dentro dele."; puzzleSolve("piano"); }
    } else {
      st.idx = 0;
      el("puzzle-msg").textContent = "Nota errada. O piano começa de novo. (dica: a cor importa, não a posição)";
    }
  }

  /* --- Relógios (ordem) --- */
  function buildClocks(body) {
    puzzle.state = { input: [] };
    const clue = S.flags[puzzle.cfg.clueFlag];
    const note = document.createElement("p");
    note.style.cssText = "color:#9b8bb0;font-style:italic;margin-bottom:8px";
    note.textContent = clue ? "Memória da floresta: SONO · TRABALHO · SOL · SAUDADE." : "(Você não tem a pista da floresta. Vai ter de adivinhar a ordem de uma vida.)";
    body.appendChild(note);
    const row = document.createElement("div"); row.className = "clock-row";
    const html = { 12: "hh", 3: "mh", 6: "hh", 9: "mh" };
    puzzle.cfg.times.forEach((t) => {
      const c = document.createElement("div"); c.className = "clock"; c.dataset.t = t;
      const ang = (t % 12) * 30;
      const h = document.createElement("div"); h.className = "hand hh";
      h.style.transform = `rotate(${ang}deg)`;
      const m = document.createElement("div"); m.className = "hand mh"; m.style.transform = `rotate(0deg)`;
      c.appendChild(h); c.appendChild(m);
      const lbl = document.createElement("div");
      lbl.style.cssText = "position:absolute;bottom:6px;width:100%;text-align:center;font-size:12px;color:#cbbf9a";
      lbl.textContent = String(t).padStart(2, "0") + ":00";
      c.appendChild(lbl);
      c.onclick = () => clockClick(t, c);
      row.appendChild(c);
    });
    body.appendChild(row);
    const d = document.createElement("div"); d.className = "seq-display"; d.id = "clock-seq"; body.appendChild(d);
  }
  function clockClick(t, node) {
    const st = puzzle.state;
    st.input.push(t);
    el("clock-seq").textContent = st.input.map((x) => String(x).padStart(2, "0")).join(" → ");
    const correct = puzzle.cfg.order;
    const i = st.input.length - 1;
    if (st.input[i] !== correct[i]) {
      st.input = [];
      el("puzzle-msg").textContent = "Os ponteiros se embaralham. Uma vida não acontece nessa ordem. (Erro. Tente de novo.)";
      A.sfx.bad();
      return;
    }
    if (st.input.length === correct.length) {
      el("puzzle-msg").textContent = "Os quatro relógios andam juntos. A vida começa e termina e recomeça.";
      puzzleSolve("clocks");
    }
  }

  /* --- Lago (espera / imobilidade) --- */
  function buildLake(body) {
    puzzle.state = { t: 0 };
    body.innerHTML = `<div class="silence-box"><div class="silence-ring">🌊</div><p style="color:#9fbccd;margin-top:10px">Não toque em nada. Não ande. Deixe a água lembrar de você.</p><div class="seq-display" id="lake-t">0.0s</div></div>`;
  }
  function lakeTick(dt) {
    if (!puzzle || puzzle.id !== "lake") return;
    // se o jogador apertou qualquer tecla de movimento, reinicia
    const moving = keys["w"] || keys["a"] || keys["s"] || keys["d"] || keys["arrowup"] || keys["arrowdown"] || keys["arrowleft"] || keys["arrowright"];
    if (moving) { puzzle.state.t = 0; el("lake-t").textContent = "0.0s"; el("puzzle-msg").textContent = "A água se assusta com o movimento. Fique imóvel."; return; }
    puzzle.state.t += dt;
    const p = Math.min(1, puzzle.state.t / puzzle.cfg.seconds);
    el("lake-t").textContent = (puzzle.state.t).toFixed(1) + "s";
    const ring = document.querySelector(".silence-ring");
    if (ring) ring.style.opacity = (0.3 + p * 0.7);
    if (puzzle.state.t >= puzzle.cfg.seconds) {
      A.sfx.memory();
      el("lake-t").textContent = "…";
      el("puzzle-msg").textContent = "A água devolve, por um instante, um rosto que não é o seu — e que te conhece.";
      puzzleSolve("lake");
    }
  }

  /* ---------------------------------------------------------
     BATALHA
     --------------------------------------------------------- */
  let battle = null;
  function startBattle(id) {
    const en = D.ENEMIES[id];
    battle = { id, en, step: 0, wrong: 0, log: [en.intro] };
    renderBattle();
    show("battle"); mode = "battle";
    A.sfx.glitch();
  }
  function renderBattle() {
    el("battle-foe").textContent = battle.en.icon + "  " + battle.en.name;
    el("battle-log").innerHTML = battle.log.map((l) => "<p>· " + l + "</p>").join("");
    const box = el("battle-actions"); box.innerHTML = "";
    const mk = (label, cls, fn, disabled) => {
      const b = document.createElement("button");
      b.className = "btn battle " + cls; b.textContent = label; b.disabled = !!disabled;
      b.onclick = fn; box.appendChild(b);
    };
    mk("👁 Observar", "observe", () => battleAction("observe"));
    mk("✊ Lembrar/Golpear", "", () => battleAction("fight"));
    mk("🗣 Perguntar", "talk", () => battleAction("talk"));
    const hp = Math.max(0, battle.en.hp - battle.step);
    el("battle-foe").textContent = battle.en.icon + "  " + battle.en.name + "   " + "▓".repeat(hp) + "░".repeat(Math.max(0, battle.en.hp - hp));
  }
  function battleAction(a) {
    const b = battle, sol = b.en.solution;
    if (a === sol[b.step]) {
      b.step++;
      b.log.push(b.en.hints[a] || "Funciona.");
      A.sfx.interact();
      if (b.step >= sol.length) { battleWin(); return; }
    } else {
      b.wrong++;
      b.log.push("Não é agora. " + (b.en.loseLog || "Algo se apaga."));
      applyBattleErase(b.en);
      A.sfx.erase();
      if (b.wrong >= 3 || S.stats.mem <= 0) { battleLose(); return; }
    }
    renderBattle();
  }
  function applyBattleErase(en) {
    if (en.erases === "item") { const id = removeRandomItem(); if (id) btoast("Apagado: " + D.ITEMS[id].nm); }
    else if (en.erases === "name") { S.flags.nome_apagado_em_batalha = true; }
    else if (en.erases === "memory") addStat("mem", -1);
    else if (en.erases === "dialogue") S.flags.fala_apagada = true;
    S.corrupt = Math.min(1, S.corrupt + 0.06); updateCorruptVisual();
  }
  function btoast(t) { toast(t, "bad"); }
  function battleWin() {
    battle.log.push("— " + battle.en.winLog);
    S.flags[battle.id + "_done"] = true;
    addStat("cou", 1);
    renderBattle();
    el("battle-actions").innerHTML = "";
    const b = document.createElement("button");
    b.className = "btn primary"; b.textContent = "Continuar";
    b.onclick = () => { hide("battle"); battle = null; mode = "play"; A.sfx.win(); };
    el("battle-actions").appendChild(b);
    A.sfx.win();
    saveGame();
  }
  function battleLose() {
    battle.log.push("— Você foi apagado, em parte. A batalha termina, mas falta algo em você.");
    S.corrupt = Math.min(1, S.corrupt + 0.2); updateCorruptVisual();
    renderBattle();
    el("battle-actions").innerHTML = "";
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = "Reerguer-se do checkpoint";
    b.onclick = () => {
      hide("battle"); battle = null;
      if (S.stats.mem <= 0) { showDefeat(); return; }
      toast("Você acorda perto da entrada, mais vazio que antes.", "bad");
      const old = S.area;
      enterArea(old, D.AREAS[old].spawn.x, D.AREAS[old].spawn.y);
      mode = "play";
    };
    el("battle-actions").appendChild(b);
    A.sfx.bad();
  }

  function showDefeat() {
    S.stats.mem = Math.max(1, S.stats.mem);
    showText("💀 Você foi apagado", "Sem memórias, você não tem forma. O mundo te dilui e te devolve, incompleto, ao ponto onde as coisas ainda faziam sentido.", [
      { text: "Reacordar em Véspera (perder um objeto).", effects: [{ t: "ending", id: "__revive" }] },
    ]);
  }

  /* ---------------------------------------------------------
     FINAIS
     --------------------------------------------------------- */
  function pickEnding(s, choice) {
    if (choice === "erro") return "erro";
    if (choice === "abandon") return "esquecido";
    if (s.flags.assumiu) return "autor";
    if (s.flags.authorKnown && s.stats.mem >= 8) return "autor";
    if (s.stats.cou >= 5) return "heroi";
    if (s.stats.mem >= 6) return "autor";
    return "esquecido";
  }
  function endGame(id) {
    if (id === "__revive") {
      S.inv = {}; S.stats.mem = 2; S.corrupt = Math.max(0, S.corrupt - 0.2);
      enterArea("rua", 11, 7); updateHud();
      showText("", "Você acorda no meio da rua, com menos coisas e mais perguntas. Véspera continua te esperando.", null);
      saveGame();
      return;
    }
    const end = D.ENDINGS[id];
    if (!end) return;
    meta.cycles += 1;
    meta.endings[id] = (meta.endings[id] || 0) + 1;
    saveMeta(meta);
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    el("end-title").textContent = end.title;
    el("end-title").style.color = end.color;
    el("end-text").textContent = end.text;
    el("end-stats").innerHTML =
      `<span>MEMÓRIA ${S.stats.mem}</span><span>CORAGEM ${S.stats.cou}</span><span>DÚVIDA ${S.stats.dou}</span><span>· ciclos: ${meta.cycles}</span>`;
    show("ending"); mode = "ending";
    A.sfx.win();
  }
  function restart() {
    hide("ending");
    startNewGame(true);
  }

  /* ---------------------------------------------------------
     PAUSA
     --------------------------------------------------------- */
  function openPause() {
    show("menu");
    el("btn-new").textContent = "Reiniciar Partida";
    mode = "menu";
  }

  /* ---------------------------------------------------------
     UPDATE / MOVIMENTO
     --------------------------------------------------------- */
  function update(dt) {
    if (mode === "puzzle" && puzzle && puzzle.id === "lake") lakeTick(dt);

    if (mode !== "play") { animateParticles(dt); return; }

    let dx = 0, dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      S.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      const step = C.playerSpeed * dt;
      moveWithCollision(dx * step, dy * step);
      idleTimer = 0;
      if (Math.random() < 0.12) A.sfx.step();
    } else {
      idleTimer += dt;
      if (idleTimer > 12 && !S.flags.ficou_parado) {
        S.flags.ficou_parado = true; addStat("dou", 1);
        toast("Ficar parado também é uma ação. Algo se move porque você não se moveu.", "mem");
      }
    }
    updateCamera();
    if (checkPortal()) return;
    updateHud();
    animateParticles(dt);
  }

  function moveWithCollision(mx, my) {
    const r = C.tile * 0.32;
    // eixo X
    let nx = S.px + mx;
    if (!boxHits(nx, S.py, r)) S.px = nx;
    // eixo Y
    let ny = S.py + my;
    if (!boxHits(S.px, ny, r)) S.py = ny;
    S.px = Math.max(r, Math.min(mapPxW - r, S.px));
    S.py = Math.max(r, Math.min(mapPxH - r, S.py));
  }
  function boxHits(cx, cy, r) {
    const pts = [[cx - r, cy - r], [cx + r, cy - r], [cx - r, cy + r], [cx + r, cy + r]];
    for (const [x, y] of pts) {
      const tx = Math.floor(x / C.tile), ty = Math.floor(y / C.tile);
      if (isSolid(tileChar(tx, ty))) return true;
    }
    return false;
  }
  function updateCamera() {
    camX = S.px - cw / 2; camY = S.py - ch / 2;
    camX = Math.max(0, Math.min(mapPxW - cw, camX));
    camY = Math.max(0, Math.min(mapPxH - ch, camY));
    if (mapPxW < cw) camX = (mapPxW - cw) / 2;
    if (mapPxH < ch) camY = (mapPxH - ch) / 2;
  }
  function animateParticles(dt) {
    for (const p of particles) {
      p.y -= p.v * dt * 60;
      if (p.y < -5) { p.y = ch + 5; p.x = Math.random() * cw; }
    }
  }

  /* ---------------------------------------------------------
     RENDER
     --------------------------------------------------------- */
  function render() {
    ctx.clearRect(0, 0, cw, ch);
    drawBackdrop();
    if ((mode === "menu" || mode === "howto" || mode === "credits") && !area) { return; }
    if (!area) return;
    const cor = S ? S.corrupt : 0;
    const pal = area.palette;
    const floor = cold(hex2rgb(pal.floor), cor * 0.7);
    const wall = cold(hex2rgb(pal.wall), cor * 0.8);
    const deco = cold(hex2rgb(pal.deco), cor * 0.7);

    const t0x = Math.max(0, Math.floor(camX / C.tile) - 1);
    const t0y = Math.max(0, Math.floor(camY / C.tile) - 1);
    const t1x = Math.min(mapW, Math.ceil((camX + cw) / C.tile) + 1);
    const t1y = Math.min(mapH, Math.ceil((camY + ch) / C.tile) + 1);

    for (let ty = t0y; ty < t1y; ty++) {
      for (let tx = t0x; tx < t1x; tx++) {
        const c = tileChar(tx, ty);
        const x = tx * C.tile - camX, y = ty * C.tile - camY;
        // buraco de apagamento
        if (cor > 0.05 && tileNoise(tx, ty, 1) < cor * 0.22) {
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.fillRect(x, y, C.tile, C.tile);
          continue;
        }
        if (c === "#") {
          ctx.fillStyle = rgb2css(wall);
          ctx.fillRect(x, y, C.tile, C.tile);
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(x, y + C.tile - 6, C.tile, 6);
        } else if (c === "T") {
          ctx.fillStyle = rgb2css(mix(floor, [30, 50, 30], 0.4));
          ctx.fillRect(x, y, C.tile, C.tile);
          ctx.font = `${C.tile * 0.8}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🌲", x + C.tile / 2, y + C.tile / 2);
        } else if (c === "~" || c === "w") {
          ctx.fillStyle = rgb2css(cold(hex2rgb(pal.accent), 0.2));
          ctx.globalAlpha = 0.55;
          ctx.fillRect(x, y, C.tile, C.tile);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          const wob = Math.sin(performance.now() / 700 + tx + ty) * 3;
          ctx.beginPath(); ctx.moveTo(x + 6 + wob, y + C.tile / 2); ctx.lineTo(x + C.tile - 6 + wob, y + C.tile / 2); ctx.stroke();
        } else {
          // chão
          ctx.fillStyle = rgb2css(floor);
          ctx.fillRect(x, y, C.tile, C.tile);
          if (tileNoise(tx, ty, 3) < 0.18) { ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.fillRect(x + 8, y + 10, C.tile - 16, C.tile - 20); }
          if (tileNoise(tx, ty, 5) < 0.1) { ctx.fillStyle = rgb2css(deco); ctx.globalAlpha = 0.3; ctx.fillRect(x + C.tile / 2 - 3, y + C.tile / 2 - 3, 6, 6); ctx.globalAlpha = 1; }
        }
      }
    }

    // portais (arcos)
    for (const p of area.portals) {
      const x = p.x * C.tile - camX, y = p.y * C.tile - camY;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(231,180,99,0.25)";
      ctx.fillRect(x + 4, y + 4, C.tile - 8, C.tile - 8);
      ctx.font = `${C.tile * 0.7}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.icon || "🚪", x + C.tile / 2, y + C.tile / 2);
      ctx.restore();
    }

    // objetos
    for (const o of area.objects) {
      if (o.hidden && !(o.requires && S.flags[o.requires])) continue;
      if (o.kind === "secret_cat" && o.id && o.id === "armario" && !S.catfollow) { /* ainda aparece */ }
      drawEntity(o.x, o.y, o.icon, 0.72, 1, o.id === "porta_final" && !allFragments());
    }

    // npcs
    for (const n of area.npcs) {
      const bob = n.wander ? Math.sin(performance.now() / 400 + n.x) * 3 : Math.sin(performance.now() / 600 + n.y) * 2;
      const x = n.x * C.tile - camX + C.tile / 2;
      const y = n.y * C.tile - camY + C.tile / 2 + bob;
      ctx.font = `${C.tile * 0.76}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(x, y + C.tile * 0.3, C.tile * 0.28, C.tile * 0.12, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillText(n.icon, x, y);
    }

    // jogador
    drawPlayer();

    // prompt de interação
    const t = nearestInteractable();
    if (t && mode === "play") {
      const x = t.item.x * C.tile - camX + C.tile / 2;
      const y = t.item.y * C.tile - camY - 6;
      ctx.font = `13px "Courier New", monospace`; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const label = "[E] " + (t.item.name || "");
      const w = ctx.measureText(label).width + 14;
      ctx.fillRect(x - w / 2, y - 22, w, 20);
      ctx.fillStyle = "#e7b463"; ctx.fillText(label, x, y - 8);
    }

    // vinheta
    const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.25, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${0.25 + cor * 0.5})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
  }

  function drawEntity(tx, ty, icon, scale, alpha, dim) {
    const x = tx * C.tile - camX + C.tile / 2;
    const y = ty * C.tile - camY + C.tile / 2;
    ctx.save();
    ctx.globalAlpha = alpha != null ? alpha : 1;
    ctx.globalAlpha *= 0.3; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(x, y + C.tile * 0.3, C.tile * 0.28, C.tile * 0.12, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = alpha != null ? alpha : 1;
    ctx.font = `${C.tile * scale}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (dim) ctx.globalAlpha *= 0.4;
    ctx.fillText(icon, x, y + Math.sin(performance.now() / 800 + tx) * 2);
    ctx.restore();
  }

  function drawPlayer() {
    const x = S.px - camX, y = S.py - camY;
    const cor = S.corrupt;
    const t = C.tile;
    // sombra
    ctx.globalAlpha = 0.3; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(x, y + t * 0.32, t * 0.26, t * 0.11, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    // corpo: manto
    const warm = cold([231, 180, 99], cor * 0.8);
    ctx.fillStyle = rgb2css(warm);
    ctx.beginPath();
    ctx.moveTo(x, y - t * 0.28);
    ctx.lineTo(x - t * 0.22, y + t * 0.3);
    ctx.lineTo(x + t * 0.22, y + t * 0.3);
    ctx.closePath(); ctx.fill();
    // cabeça
    ctx.fillStyle = rgb2css(cold([240, 220, 190], cor * 0.6));
    ctx.beginPath(); ctx.arc(x, y - t * 0.32, t * 0.13, 0, 7); ctx.fill();
    // olhos conforme direção
    ctx.fillStyle = "#2a1f2e";
    const eyeY = y - t * 0.34;
    let ex = 0, ey = 0;
    if (S.dir === "left") ex = -2; else if (S.dir === "right") ex = 2; else if (S.dir === "up") ey = -2; else ey = 2;
    ctx.beginPath(); ctx.arc(x - 3 + ex, eyeY + ey, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 3 + ex, eyeY + ey, 1.6, 0, 7); ctx.fill();
    // glitch quando corrupto
    if (cor > 0.5 && Math.random() < cor * 0.08) {
      ctx.globalAlpha = 0.4; ctx.fillStyle = "#7fd6d1";
      ctx.fillRect(x - t * 0.3, y - t * 0.2 + Math.random() * t * 0.5, t * 0.6, 2);
      ctx.globalAlpha = 1;
    }
    // "?" do nome desconhecido
    ctx.font = `${t * 0.3}px "Courier New", monospace`; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("?", x, y - t * 0.6);
  }

  function drawBackdrop() {
    const cor = S ? S.corrupt : 0;
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    // quente no início, frio no fim
    const r0 = lerp(32, 8, cor), g0 = lerp(22, 12, cor), b0 = lerp(28, 40, cor);
    g.addColorStop(0, `rgb(${r0},${g0},${b0})`);
    g.addColorStop(1, "#050409");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    // partículas
    for (const p of particles) {
      ctx.globalAlpha = p.o * (0.5 + Math.sin(performance.now() / 1000 + p.x) * 0.5);
      ctx.fillStyle = cor > 0.4 ? "#7fd6d1" : "#e7b463";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------------------------------------------------
     OVERLAY HELPERS
     --------------------------------------------------------- */
  function show(id) { el(id).classList.remove("hidden"); }
  function hide(id) { el(id).classList.add("hidden"); }

  /* ---------------------------------------------------------
     MENU
     --------------------------------------------------------- */
  function initMenu() {
    el("menu-quote").textContent = D.QUOTES[Math.floor(Math.random() * D.QUOTES.length)];
    el("btn-continue").disabled = !hasSave();
    el("btn-new").textContent = "Novo Jogo";
    el("btn-new").onclick = () => startNewGame(false);
    el("btn-continue").onclick = () => startContinue();
    el("btn-how").onclick = () => { show("howto"); hide("menu"); mode = "howto"; };
    el("btn-credits").onclick = () => { show("credits"); hide("menu"); mode = "credits"; };
    el("how-close").onclick = () => { hide("howto"); show("menu"); mode = "menu"; };
    el("credits-close").onclick = () => { hide("credits"); show("menu"); mode = "menu"; };
    el("inv-close").onclick = closeInventory;
    el("end-restart").onclick = restart;
  }

  function startNewGame(fromEnd) {
    S = newState();
    if (meta.cycles > 0) S.flags.tem_ciclo = true;
    loadAreaIntoGame();
    hide("menu"); hide("ending");
    A.start();
    // intro
    const lines = D.INTRO.slice();
    if (meta.cycles > 0) lines.unshift("Você já esteve aqui. " + meta.cycles + " vezes. Mas sua cabeça não guarda isso — só o corpo.");
    showCutscene(lines, () => { mode = "play"; toast("Você acorda na Rua Sem Nome. Seu nome é «???».", "mem"); });
  }
  function startContinue() {
    const st = loadGame();
    if (!st) { startNewGame(false); return; }
    S = Object.assign(newState(), st);
    loadAreaIntoGame();
    hide("menu");
    A.start();
    showCutscene(["Você pisca. Véspera continua exatamente onde parou — apagando-se, devagar, à sua espera."], () => { mode = "play"; });
  }
  function loadAreaIntoGame() {
    const id = S.area && D.AREAS[S.area] ? S.area : "rua";
    area = D.AREAS[id];
    computeMapSize();
    if (S.px > 0) { /* mantém posição salva */ } else { S.px = area.spawn.x * C.tile + C.tile / 2; S.py = area.spawn.y * C.tile + C.tile / 2; }
    if (area.onEnter && area.onEnter.music) setMusic(area.onEnter.music);
    updateHud(); updateCorruptVisual();
    camX = S.px - cw / 2; camY = S.py - ch / 2;
  }

  /* ---------------------------------------------------------
     LOOP
     --------------------------------------------------------- */
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  initMenu();
  requestAnimationFrame(loop);

  // expõe para depuração
  window.__V = {
    get S() { return S; }, set S(v) { S = v; },
    get mode() { return mode; }, set mode(v) { mode = v; },
    get area() { return area; },
    startNewGame, enterArea, interact, openDialogue, startBattle, applyEffects,
    showText, collectFragment, endGame, pickEnding,
    get puzzle() { return puzzle; }, get battle() { return battle; },
    get keys() { return keys; }, get tile() { return C.tile; },
    nearestInteractable,
  };
})();
