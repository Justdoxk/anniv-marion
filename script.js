(() => {
  "use strict";

  /* ==========================================================
     ✏️ CONFIG : c'est ici que tu personnalises le site
     ========================================================== */
  const CONFIG = {
    prenom: "Marion",
    age: 15,
    naissance: "2011-10-28",  // AAAA-MM-JJ
    heureNaissance: "00:00",  // HH:MM (si tu connais l'heure exacte, mets-la)
    frere: "Armand",

    // ✏️ Remplace / complète avec tes blagues internes et souvenirs.
    // emoji = gros emoji de la carte, titre = titre, texte = le message.
    messages: [
      { emoji: "🎂", titre: "Officiellement 15 ans", texte: "Tu passes officiellement en version 15.0. Nouvelles fonctionnalités : encore plus de slay, et toujours zéro bug. W petite sœur." },
      { emoji: "🗿", titre: "Rapport du conseil des moaïs", texte: "Après délibération, ton aura a été classée « légendaire ». Le conseil n'avait jamais vu ça. Il est ému." },
      { emoji: "💅", titre: "Note du grand frère", texte: "Je le dis pas souvent, alors profite : t'es vraiment une sœur incroyable. Voilà. Je retourne à mon rôle de frère sigma." },
      { emoji: "🔥", titre: "Prédictions pour tes 15 ans", texte: "Rizz +200 %, réussite +300 %, fous rires : illimités. Source : moi, no cap." },
      { emoji: "🥔", titre: "Message de la Patate Sigma", texte: "« 15 ans ? Giga validé. Que ton année soit plus croustillante qu'une frite bien dorée. »" },
      { emoji: "✨", titre: "Le vrai message", texte: "Que cette année soit remplie de fous rires, de bons moments et d'aura infinie. Je t'aime fort (oui c'est gênant, oui c'est vrai)." }
    ]
  };

  /* ---------- Utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Math.floor(n).toLocaleString("fr-FR");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const COLORS = ["#39ff14", "#ff00e6", "#fff200", "#00f0ff", "#ff6a00", "#8a2be2", "#ff1744", "#2979ff"];
  const EMOJIS = ["💀", "🔥", "🗿", "🤡", "✨", "🎂", "🎉", "👑", "💅", "🥳", "🌈", "⭐"];
  const P = CONFIG.prenom;
  const AGE = CONFIG.age;

  /* ---------- Remplissage des textes ---------- */
  const FILL = {
    prenom: P,
    "prenom-upper": P.toUpperCase(),
    age: String(AGE),
    frere: CONFIG.frere,
    annee: CONFIG.naissance.slice(0, 4)
  };
  $$("[data-fill]").forEach((e) => { if (FILL[e.dataset.fill]) e.textContent = FILL[e.dataset.fill]; });
  document.title = `W ANNIVERSAIRE ${P.toUpperCase()} 🎂💀 ${AGE} ANS`;

  const MARQUEE = `🔥 W ANNIVERSAIRE ${P.toUpperCase()} 🔥 AURA +1000 🗿 NO CAP 💅 SLAY 💀 OHIO-LEVEL BIRTHDAY 🌽 RIZZ MAXIMALE ✨ C'EST GIGA VALIDÉ 🎂 SIGMA SISTER 👑 ${AGE} ANS DE LÉGENDE 🥳 `;
  const MARQUEE2 = `✨ ${P} a ${AGE} ans et c'est validé par la science 🧪 ✨ le gâteau a des jambes, c'est normal 🦵🎂 ✨ ne pas toucher à l'aura-mètre (si, touche) 🗿 ✨ `;
  $$("[data-marquee]").forEach((e) => { e.textContent = MARQUEE; });
  $$("[data-marquee2]").forEach((e) => { e.textContent = MARQUEE2; });

  /* ---------- WordArt : une lettre = un span qui wobble ---------- */
  function wordartify(target) {
    const text = target.textContent.trim();
    target.textContent = "";
    const sr = el("span", null, text);
    sr.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)";
    const vis = el("span");
    vis.setAttribute("aria-hidden", "true");
    let i = 0;
    text.split(" ").forEach((word, wi, words) => {
      const w = el("span", "wa-word");
      for (const ch of word) {
        const s = el("span", "wa-letter", ch);
        s.style.setProperty("--i", i);
        s.style.setProperty("--c", COLORS[i % COLORS.length]);
        i++;
        w.appendChild(s);
      }
      vis.appendChild(w);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(" "));
    });
    target.append(sr, vis);
  }
  $$("[data-wordart]").forEach(wordartify);

  /* ==========================================================
     Mode calme (+ prefers-reduced-motion)
     ========================================================== */
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const btnCalm = $("#btn-calm");
  let calm = false;

  function setCalm(on) {
    calm = on;
    document.body.classList.toggle("calm", on);
    // si l'utilisatrice a reduced-motion mais choisit explicitement le chaos
    document.body.classList.toggle("force-chaos", !on && mqReduce.matches);
    btnCalm.setAttribute("aria-pressed", String(on));
    btnCalm.textContent = on ? "mode chaos 🤪" : "mode calme 😴";
    if (on) parts.length = 0;
  }
  btnCalm.addEventListener("click", () => setCalm(!calm));

  /* ==========================================================
     Sons synthétiques (Web Audio API), actifs par défaut.
     Les navigateurs bloquent l'audio avant une interaction :
     le son démarre donc au premier clic / tap / touche.
     ========================================================== */
  const btnSound = $("#btn-sound");
  let soundOn = true;
  let unlocked = false;
  let actx = null;
  let noiseBuf = null;

  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }

  function tone({ freq = 440, to = null, dur = 0.15, type = "square", vol = 0.12, delay = 0 }) {
    if (!soundOn || !unlocked) return;
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function noise(dur = 0.4, vol = 0.35) {
    if (!soundOn || !unlocked) return;
    const ctx = audio();
    if (!ctx) return;
    if (!noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.6);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + dur);
  }

  const SFX = {
    none() {},
    bip() { tone({ freq: pick([660, 880, 990, 1320]), dur: 0.08 }); },
    boing() {
      tone({ freq: 140, to: 620, dur: 0.22, type: "sine", vol: 0.25 });
      tone({ freq: 620, to: 260, dur: 0.18, type: "sine", vol: 0.15, delay: 0.2 });
    },
    pouet() { tone({ freq: 320, to: 110, dur: 0.32, type: "sawtooth", vol: 0.09 }); },
    souffle() { noise(0.4, 0.4); tone({ freq: 900, to: 300, dur: 0.25, type: "triangle", vol: 0.06 }); },
    erreur() {
      tone({ freq: 520, dur: 0.12, type: "square", vol: 0.08 });
      tone({ freq: 390, dur: 0.22, type: "square", vol: 0.08, delay: 0.13 });
    },
    aura(level) {
      const f = 260 + Math.min(level, 120) * 10;
      tone({ freq: f, to: f * 1.6, dur: 0.12, type: "sawtooth", vol: 0.07 });
    },
    tung() {
      for (let i = 0; i < 3; i++) {
        tone({ freq: 190, to: 70, dur: 0.14, type: "sine", vol: 0.5, delay: i * 0.17 });
        tone({ freq: 900, to: 300, dur: 0.03, type: "square", vol: 0.05, delay: i * 0.17 });
      }
    },
    tralala() {
      [784, 659, 784, 659, 880, 784].forEach((f, i) => tone({ freq: f, dur: 0.11, type: "triangle", vol: 0.18, delay: i * 0.12 }));
    },
    lirili() {
      tone({ freq: 500, to: 900, dur: 0.18, type: "sine", vol: 0.2 });
      tone({ freq: 900, to: 450, dur: 0.22, type: "sine", vol: 0.2, delay: 0.2 });
    },
    fanfare() {
      const notes = [[523, 0, 0.13], [523, 0.15, 0.13], [523, 0.3, 0.13], [659, 0.45, 0.38], [587, 0.88, 0.13], [659, 1.03, 0.13], [784, 1.18, 0.6]];
      notes.forEach(([f, d, du]) => {
        tone({ freq: f, dur: du, delay: d, type: "square", vol: 0.07 });
        tone({ freq: f / 2, dur: du, delay: d, type: "triangle", vol: 0.12 });
      });
    }
  };

  /* ---------- Musique de fond ----------
     assets/music.mp3 = extrait 0:41.5 → 2:32.5 du morceau.
     On démarre à 0:42 (0.5 s dans le fichier) et on boucle à 2:32 (110.5 s). */
  const MUSIC = { src: "assets/music.mp3", loopStart: 0.5, loopEnd: 110.5, vol: 0.45 };
  let musicStarted = false, musicGain = null, musicEl = null;

  async function startMusic() {
    if (musicStarted || !soundOn) return;
    musicStarted = true;
    try {
      // Web Audio : boucle précise à l'échantillon près (marche en https, pas en file://)
      const ctx = audio();
      if (!ctx) throw new Error("pas de Web Audio");
      const res = await fetch(MUSIC.src);
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      musicGain = ctx.createGain();
      musicGain.gain.value = soundOn ? MUSIC.vol : 0;
      musicGain.connect(ctx.destination);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = MUSIC.loopStart;
      src.loopEnd = MUSIC.loopEnd;
      src.connect(musicGain);
      src.start(0, MUSIC.loopStart);
    } catch (e) {
      // Repli <audio> (ex : index.html ouvert en local)
      musicEl = new Audio(MUSIC.src);
      musicEl.volume = MUSIC.vol;
      musicEl.currentTime = MUSIC.loopStart;
      musicEl.addEventListener("timeupdate", () => {
        if (musicEl.currentTime >= MUSIC.loopEnd) musicEl.currentTime = MUSIC.loopStart;
      });
      musicEl.addEventListener("ended", () => { musicEl.currentTime = MUSIC.loopStart; musicEl.play(); });
      if (soundOn) musicEl.play().catch(() => { musicStarted = false; musicEl = null; });
    }
  }

  function setMusic(on) {
    if (musicGain) musicGain.gain.value = on ? MUSIC.vol : 0;
    if (musicEl) { if (on) musicEl.play().catch(() => {}); else musicEl.pause(); }
    if (on) startMusic();
  }

  btnSound.addEventListener("click", () => {
    soundOn = !soundOn;
    btnSound.setAttribute("aria-pressed", String(soundOn));
    btnSound.textContent = soundOn ? "🔇 COUPER LE CHAOS" : "🔊 ACTIVER LE CHAOS";
    setMusic(soundOn);
    if (soundOn) {
      audio();
      SFX.fanfare();
      const r = btnSound.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.bottom, 40, 9, 0, Math.PI * 2);
    }
  });

  // Premier geste de l'utilisatrice = déblocage de l'audio
  const unlock = (e) => {
    if (unlocked) return;
    unlocked = true;
    // lance la musique, sauf si le premier geste sert justement à couper le son
    if (soundOn && !(e.target.closest && e.target.closest("#btn-sound"))) {
      audio();
      startMusic();
    }
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);

  // Bruitage au clic partout (data-sfx="nom" pour choisir, "none" si l'élément gère lui-même)
  document.addEventListener("click", (e) => {
    if (!soundOn || e.target.closest("#btn-sound")) return;
    const owner = e.target.closest("[data-sfx]");
    const name = owner ? owner.dataset.sfx : pick(["bip", "boing", "pouet"]);
    (SFX[name] || SFX.bip)();
  });

  /* ==========================================================
     Confettis maison (canvas)
     ========================================================== */
  const cv = $("#confetti");
  const cx = cv.getContext("2d");
  const parts = [];
  let rafId = 0, W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  // angMin/angMax en radians (canvas : PI*1.5 = vers le haut)
  function confetti(x, y, n = 80, power = 12, angMin = Math.PI * 1.15, angMax = Math.PI * 1.85) {
    if (calm) return;
    n = Math.min(n, 450 - parts.length);
    for (let i = 0; i < n; i++) {
      const a = rand(angMin, angMax);
      const sp = rand(power * 0.35, power);
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        w: rand(6, 12), h: rand(4, 9),
        rot: rand(0, 6.28), vr: rand(-0.25, 0.25),
        tilt: rand(0, 6.28),
        c: pick(COLORS),
        e: Math.random() < 0.1 ? pick(EMOJIS) : null
      });
    }
    if (!rafId && parts.length) rafId = requestAnimationFrame(step);
  }

  function step() {
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, cv.width, cv.height);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.24;
      p.tilt += 0.12;
      p.x += p.vx + Math.sin(p.tilt) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 30 || p.x < -60 || p.x > W + 60) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      const c = Math.cos(p.rot) * dpr, s = Math.sin(p.rot) * dpr;
      cx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
      if (p.e) {
        cx.font = "20px serif";
        cx.fillText(p.e, -10, 7);
      } else {
        const hh = p.h * Math.abs(Math.cos(p.tilt));
        cx.fillStyle = p.c;
        cx.fillRect(-p.w / 2, -hh / 2, p.w, hh);
      }
    }
    rafId = parts.length ? requestAnimationFrame(step) : 0;
    if (!rafId) {
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  function bigParty() {
    confetti(W * 0.08, H, 110, 20, Math.PI * 1.55, Math.PI * 1.85);
    confetti(W * 0.92, H, 110, 20, Math.PI * 1.15, Math.PI * 1.45);
    setTimeout(() => confetti(W / 2, H * 0.35, 90, 13, 0, Math.PI * 2), 350);
  }

  /* ==========================================================
     Traînée d'emojis qui suit la souris / le doigt
     ========================================================== */
  const trail = $("#trail");
  const POOL = Array.from({ length: 24 }, () => trail.appendChild(el("span", "trail-bit")));
  let poolIdx = 0, lastT = 0, lastX = -99, lastY = -99;

  function spawnTrail(x, y, force) {
    if (calm || !trail.animate) return;
    const now = performance.now();
    if (!force && (now - lastT < 35 || Math.hypot(x - lastX, y - lastY) < 14)) return;
    lastT = now; lastX = x; lastY = y;
    const s = POOL[poolIdx++ % POOL.length];
    s.textContent = pick(EMOJIS);
    s.getAnimations().forEach((a) => a.cancel());
    const dx = force ? rand(-60, 60) : rand(-20, 20);
    const dy = force ? rand(-60, 60) : rand(20, 50);
    s.animate([
      { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
      { transform: `translate(${x + dx}px, ${y + dy}px) translate(-50%, -50%) scale(.3) rotate(${rand(-200, 200)}deg)`, opacity: 0 }
    ], { duration: 800, easing: "ease-out", fill: "forwards" });
  }
  window.addEventListener("pointermove", (e) => spawnTrail(e.clientX, e.clientY), { passive: true });
  window.addEventListener("pointerdown", (e) => {
    for (let i = 0; i < 5; i++) spawnTrail(e.clientX, e.clientY, true);
  }, { passive: true });

  // Petit texte qui s'envole (+420 aura, 💨…)
  function floaty(text, x, y, color = "#fff200") {
    if (calm || !document.body.animate) return;
    const s = el("span", "floaty", text);
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.color = color;
    document.body.appendChild(s);
    s.animate([
      { transform: "translate(-50%, 0) scale(.6)", opacity: 1 },
      { transform: `translate(calc(-50% + ${rand(-50, 50)}px), -100px) scale(1.2) rotate(${rand(-20, 20)}deg)`, opacity: 0 }
    ], { duration: 900, easing: "ease-out" }).onfinish = () => s.remove();
  }

  /* ==========================================================
     Personnages absurdes
     ========================================================== */
  const LINES = {
    gatolas: [
      "J'ai des jambes et zéro regret 🦵",
      "Me manger ? Non. Me respecter. 🎂",
      `${P}, ton aura fait fondre mon glaçage 🫠`,
      "Je cours le 100 m en 9 secondes. Avec une bougie sur la tête. 🔥",
      "Gâteau sigma, part de rizz incluse 🍰"
    ],
    moai: [
      "🗿",
      "🗿 (traduction : W anniversaire)",
      "Je danse depuis 800 ans pour ce moment 🪩",
      `${AGE} ans ? Moi j'en ai 800. T'es un bébé. Joyeux anniv quand même 🗿`,
      "Aura +1000. Je ne cligne jamais des yeux. 🗿"
    ],
    patate: [
      "Je suis une patate mais j'ai plus de rizz que toi 🥔",
      "Sigma ? Non. Patate-gma. 😤",
      `${AGE} ans ? Giga validé.`,
      "Ma couronne est en frite dorée, no cap 👑",
      `Ministère de l'Aura : ${P} est classée trésor national 🏆`
    ]
  };

  $$(".perso").forEach((perso) => {
    const bubble = $(".bubble", perso);
    let hideT = 0, last = "";
    const talk = () => {
      const lines = LINES[perso.dataset.perso];
      let line = pick(lines);
      if (line === last) line = lines[(lines.indexOf(line) + 1) % lines.length];
      last = line;
      bubble.textContent = line;
      bubble.classList.add("show");
      clearTimeout(hideT);
      hideT = setTimeout(() => bubble.classList.remove("show"), 2800);
      SFX.boing();
      const r = perso.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2, 14, 7);
    };
    perso.addEventListener("click", talk);
    perso.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); talk(); }
    });
  });

  /* ==========================================================
     Gang Italian brainrot (images domaine public, Wikimedia Commons)
     ========================================================== */
  const GANG = [
    { nom: "Tung Tung Tung Sahur", img: "tung-tung-tung-sahur.png", cutout: true, sfx: "tung" },
    { nom: "Tralalero Tralala", img: "tralalero-tralala.webp", sfx: "tralala" },
    { nom: "Lirilì Larilà", img: "lirili-larila.webp", sfx: "lirili" },
    { nom: "Ballerina Cappuccina", img: "ballerina-cappuccina.webp", sfx: "tralala" },
    { nom: "Brr Brr Patapim", img: "brr-brr-patapim.jpg", sfx: "boing" },
    { nom: "Chimpanzini Bananini", img: "chimpanzini-bananini.webp", sfx: "pouet" },
    { nom: "Cappuccino Assassino", img: "cappuccino-assassino.webp", sfx: "lirili" }
  ];
  const gangGrid = $("#gang-grid");
  GANG.forEach((g, i) => {
    const b = el("button", "spinner");
    b.type = "button";
    b.dataset.sfx = "none";
    b.setAttribute("aria-label", `${g.nom} : clique pour le faire tourner plus vite`);
    b.style.setProperty("--ring", COLORS[i % COLORS.length]);
    b.style.setProperty("--r", `${rand(-6, 6).toFixed(1)}deg`);
    const img = el("img", "spin-img" + (g.cutout ? " cutout" : ""));
    img.src = `assets/brainrot/${g.img}`;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    let spd = rand(0.55, 1.1);
    img.style.setProperty("--spd", `${spd.toFixed(2)}s`);
    img.style.setProperty("--dir", i % 2 ? "reverse" : "normal");
    b.append(img, el("span", "spin-name", g.nom));
    b.addEventListener("click", (e) => {
      spd = spd <= 0.2 ? rand(0.55, 1.1) : Math.max(0.2, spd * 0.6); // trop vite → on repart
      img.style.setProperty("--spd", `${spd.toFixed(2)}s`);
      SFX[g.sfx]();
      const r = img.getBoundingClientRect();
      floaty(`${g.nom.toUpperCase()} 🌀`, e.clientX || r.left + r.width / 2, r.top, COLORS[i % COLORS.length]);
      confetti(r.left + r.width / 2, r.top + r.height / 2, 16, 8, 0, Math.PI * 2);
    });
    gangGrid.appendChild(b);
  });

  /* ==========================================================
     Aura-mètre
     ========================================================== */
  const AURA_MAX = 70; // clics pour remplir la jauge
  const AURA_LEVELS = [
    [0, "aura niveau : PNJ en sortie de mise à jour 😐"],
    [1, "aura niveau : croissant au beurre 🥐"],
    [6, "aura niveau : sigma débutante 🗿"],
    [12, "aura niveau : rizz validée par le conseil des moaïs ✨"],
    [20, "aura niveau : LÉGENDAIRE 🔥🔥"],
    [30, "aura niveau : un pigeon s'est incliné sur ton passage 🐦"],
    [40, "aura niveau : la NASA a appelé, elle veut comprendre 🚀"],
    [52, "aura niveau : Ohio a demandé l'autographe 🌽✍️"],
    [62, "aura niveau : les profs mettent 20/20 sans lire la copie 📝"],
    [AURA_MAX, "L'AURA A CASSÉ LE SERVEUR 💀💀💀"],
    [90, "ERREUR 404 : plafond d'aura introuvable 🤡"],
    [120, "l'aura est devenue consciente. Elle te souhaite un joyeux anniversaire. 🎂"],
    [160, "aura niveau : ∞ + 1. Les mathématiciens pleurent. 📐😭"],
    [222, "ok tu peux arrêter, l'univers a validé. W anniversaire. 🌌"]
  ];
  const auraCard = $("#aura");
  const gauge = $("#gauge");
  const gaugeFill = $("#gauge-fill");
  const auraPtsEl = $("#aura-points");
  const auraMsg = $("#aura-msg");
  let auraClicks = 0, auraPts = 0, auraLevel = 0;

  $("#btn-aura").addEventListener("click", (e) => {
    auraClicks++;
    const gain = randInt(69, 420) * (1 + Math.floor(auraClicks / 10));
    auraPts += gain;
    gaugeFill.style.transform = `scaleX(${Math.min(auraClicks / AURA_MAX, 1)})`;
    auraPtsEl.textContent = `${fmt(auraPts)} aura`;

    let lvl = 0;
    AURA_LEVELS.forEach(([n], i) => { if (auraClicks >= n) lvl = i; });
    if (lvl !== auraLevel) {
      auraLevel = lvl;
      auraMsg.textContent = AURA_LEVELS[lvl][1];
      if (!calm && auraMsg.animate) {
        auraMsg.animate([{ transform: "scale(1.4) rotate(-4deg)" }, { transform: "scale(1)" }], { duration: 350, easing: "ease-out" });
      }
    }

    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top;
    floaty(`+${fmt(gain)} aura`, x, y - 10, pick(COLORS));
    confetti(x, y, 10, 7);
    SFX.aura(auraClicks);

    if (auraClicks === AURA_MAX) {
      gauge.classList.add("overload");
      auraCard.classList.remove("broken");
      void auraCard.offsetWidth; // relance l'animation de tremblement
      auraCard.classList.add("broken");
      SFX.erreur();
      bigParty();
      showPopup({
        title: "Serveur.exe", icon: "💥",
        text: `ERREUR CRITIQUE : l'aura de ${P} dépasse la capacité du serveur. Merci de ne pas être aussi iconique.`
      }, true);
    }
  });

  /* ==========================================================
     Fausses pop-ups Windows 98
     ========================================================== */
  const POPUPS = [
    { title: "Félicitations !!!", icon: "🏆", text: "Vous êtes la 1 000 000e visiteuse ! Vous avez gagné : un anniversaire GRATUIT. (déjà livré)" },
    { title: "ERREUR", icon: "⚠️", text: "ERREUR : trop de swag détecté. Le système ne peut pas gérer autant d'aura." },
    { title: "Mise à jour", icon: "💾", text: `${P}.exe a été mise à jour en version ${AGE}.0. Nouveautés : +1 an de slay, correctifs mineurs, rizz optimisée.` },
    { title: "Antivirus", icon: "🛡️", text: "Menace détectée : niveau de rizz anormalement élevé. Action recommandée : aucune, c'est giga validé." },
    { title: "Alerte météo", icon: "🌪️", text: "Tempête de confettis prévue dans votre secteur. Sortez les parapluies." },
    { title: "Message système", icon: "🗿", text: "Le conseil des moaïs a voté à l'unanimité : W anniversaire. No cap." },
    { title: "Mémoire insuffisante", icon: "🧠", text: "Trop de neurones brainrot chargés. Libérer de la place en oubliant les maths ? (non)" },
    { title: "Avertissement", icon: "🌽", text: "Cet anniversaire a été classé Ohio-level. Porter des lunettes de soleil est recommandé." },
    { title: "Livraison", icon: "📦", text: "Votre colis « 1 an de plus » a été livré. Signature : le gâteau à jambes." }
  ];
  const DODGE_TXT = ["raté 🤡", "trop lente 💀", "presque !", "nope 🗿", "hihi 🏃"];
  const popLayer = $("#popups");
  let openPops = 0;

  function showPopup(p = pick(POPUPS), force = false) {
    if (openPops >= 2 && !force) return;
    openPops++;

    const win = el("div", "win98");
    win.setAttribute("role", "alertdialog");
    win.setAttribute("aria-label", p.title);

    const bar = el("div", "win98-bar");
    const x = el("button", "win98-x", "✕");
    x.type = "button";
    x.setAttribute("aria-label", "Fermer");
    bar.append(el("span", null, p.title), x);

    const body = el("div", "win98-body");
    body.append(el("span", "win98-icon", p.icon), el("p", "win98-text", p.text));

    const actions = el("div", "win98-actions");
    const ok = el("button", "win98-btn", "OK");
    ok.type = "button";
    actions.appendChild(ok);
    win.append(bar, body, actions);

    const w = Math.min(320, window.innerWidth - 32);
    win.style.left = rand(16, Math.max(16, window.innerWidth - w - 16)) + "px";
    win.style.top = rand(60, Math.max(70, window.innerHeight - 300)) + "px";

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      openPops--;
      win.classList.add("pop-out");
      setTimeout(() => win.remove(), calm ? 0 : 200);
    };
    win._close = close;
    x.addEventListener("click", close);

    // Une fois sur deux, le bouton OK fuit (mais finit toujours par se laisser cliquer)
    let dodges = Math.random() < 0.5 ? randInt(2, 4) : 0;
    let justFled = false;
    const flee = () => {
      if (dodges <= 0) return false;
      dodges--;
      const room = Math.max(0, win.clientWidth / 2 - ok.offsetWidth / 2 - 10);
      ok.style.transform = `translate(${rand(-room, room)}px, ${rand(-80, 0)}px) rotate(${rand(-15, 15)}deg)`;
      ok.textContent = dodges > 0 ? pick(DODGE_TXT) : "ok vas-y 😌";
      SFX.boing();
      return true;
    };
    ok.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") flee(); });
    ok.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" && flee()) {
        justFled = true;
        setTimeout(() => { justFled = false; }, 500);
      }
    });
    ok.addEventListener("click", () => {
      if (justFled) return;
      close();
    });

    popLayer.appendChild(win);
    SFX.erreur();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const wins = $$(".win98:not(.pop-out)", popLayer);
      if (wins.length) wins[wins.length - 1]._close();
    }
  });

  function schedulePopup(first) {
    const delay = first ? 8000 : rand(16000, 32000) * (calm ? 2 : 1);
    setTimeout(() => {
      if (!document.hidden) showPopup();
      schedulePopup(false);
    }, delay);
  }

  /* ==========================================================
     Gâteau interactif
     ========================================================== */
  const candlesEl = $("#candles");
  const cakeCount = $("#cake-count");
  const cakeWin = $("#cake-win");
  const winTitle = $("#win-title");
  const btnRelight = $("#btn-relight");
  let lit = 0, blows = 0;

  winTitle.textContent = `${AGE} ANS VALIDÉS 🎉`;
  wordartify(winTitle);

  function cakeText() {
    if (lit === AGE) return `${AGE} bougies allumées. Clique dessus pour souffler (poumons de sigma requis) 💨`;
    if (lit === 0) return "TOUTES ÉTEINTES !!! 🎉🎉🎉";
    if (lit === 1) return "PLUS QU'UNE. Le destin retient son souffle. 😳";
    return pick([
      `Encore ${lit} ! No cap tu gères 💨`,
      `${lit} restantes. Poumons de sigma activés 🫁`,
      `${lit} bougies… le gâteau transpire 🥵`,
      `Plus que ${lit}, c'est giga validé ✅`,
      `${lit} restantes. Slay le souffle 💅`
    ]);
  }

  function buildCandles() {
    candlesEl.textContent = "";
    lit = AGE;
    blows = 0;
    for (let i = 0; i < AGE; i++) {
      const b = el("button", "candle");
      b.type = "button";
      b.dataset.sfx = "none";
      b.setAttribute("aria-label", `Souffler la bougie ${i + 1}`);
      b.style.setProperty("--c", COLORS[i % COLORS.length]);
      b.style.setProperty("--d", `${(i * -0.13).toFixed(2)}s`);
      b.append(el("span", "flame"), el("span", "stick"));
      candlesEl.appendChild(b);
    }
    cakeCount.textContent = cakeText();
    cakeWin.hidden = true;
    btnRelight.hidden = true;
    document.body.classList.remove("party");
  }

  candlesEl.addEventListener("click", (e) => {
    const b = e.target.closest(".candle");
    if (!b) return;
    blows++;
    if (b.classList.contains("out")) return;
    b.classList.add("out");
    b.setAttribute("aria-label", "Bougie éteinte");
    lit--;
    SFX.souffle();
    const r = b.getBoundingClientRect();
    floaty("💨", r.left + r.width / 2, r.top);
    confetti(r.left + r.width / 2, r.top, 8, 5);
    cakeCount.textContent = cakeText();
    if (lit === 0) celebrate();
  });

  function celebrate() {
    setTimeout(() => SFX.fanfare(), 250);
    bigParty();
    [700, 1200, 1800].forEach((d) => setTimeout(() => confetti(rand(W * 0.2, W * 0.8), rand(H * 0.15, H * 0.45), 80, 13, 0, Math.PI * 2), d));
    document.body.classList.add("party");
    cakeWin.hidden = false;
    btnRelight.hidden = false;
    setTimeout(() => showPopup({
      title: "Succès débloqué", icon: "🏆",
      text: `${P} a soufflé ${AGE} bougies en ${blows} souffles. Aura +1 000 000. Le gâteau à jambes est fier.`
    }, true), 1600);
  }
  btnRelight.addEventListener("click", buildCandles);

  /* ==========================================================
     Messages perso
     ========================================================== */
  const MSG_STYLES = [
    { bg: "#39ff14", fg: "#000", b: "#ff00e6" },
    { bg: "#fff200", fg: "#1a0066", b: "#00f0ff" },
    { bg: "#00f0ff", fg: "#000", b: "#ff1744" },
    { bg: "#ff6a00", fg: "#000", b: "#39ff14" },
    { bg: "#ffffff", fg: "#8a2be2", b: "#fff200" },
    { bg: "#ff8ad8", fg: "#000", b: "#2979ff" }
  ];
  const FONTS = ["f-comic", "f-impact", "f-papyrus"];
  const msgs = $("#msgs");
  CONFIG.messages.forEach((m, i) => {
    const st = MSG_STYLES[i % MSG_STYLES.length];
    const card = el("article", "msg");
    card.style.setProperty("--mbg", st.bg);
    card.style.setProperty("--mfg", st.fg);
    card.style.setProperty("--mb", st.b);
    card.style.setProperty("--r", `${rand(-3, 3).toFixed(1)}deg`);
    card.style.setProperty("--d", `${(-i * 0.2).toFixed(1)}s`);
    card.style.setProperty("--fs", `${rand(1.2, 1.9).toFixed(2)}rem`);
    card.append(el("span", "msg-emoji", m.emoji), el("h3", FONTS[i % FONTS.length], m.titre), el("p", null, m.texte));
    msgs.appendChild(card);
  });

  /* ==========================================================
     Compteur d'âge en secondes
     ========================================================== */
  const birth = new Date(`${CONFIG.naissance}T${CONFIG.heureNaissance}:00`);
  const secEl = $("#age-seconds"), tenthEl = $("#age-tenths");
  const minEl = $("#age-minutes"), dayEl = $("#age-days"), heartEl = $("#age-heart");
  let lastSec = -1;

  function tick() {
    const ms = Math.max(0, Date.now() - birth.getTime());
    const s = Math.floor(ms / 1000);
    tenthEl.textContent = `,${Math.floor((ms % 1000) / 100)}`;
    if (s === lastSec) return;
    lastSec = s;
    secEl.textContent = fmt(s);
    minEl.textContent = fmt(s / 60);
    dayEl.textContent = fmt(s / 86400);
    heartEl.textContent = fmt(s * 80 / 60); // ~80 battements/minute
  }
  tick();
  setInterval(tick, 100);

  /* ==========================================================
     Lancement
     ========================================================== */
  // Toujours en mode chaos au lancement (le bouton "mode calme" reste dispo)
  setCalm(false);
  // Certains navigateurs autorisent le son sans clic : on tente le coup
  if (soundOn) {
    const ctx = audio();
    if (ctx) {
      const tryStart = () => {
        if (ctx.state === "running" && !unlocked) {
          unlocked = true;
          startMusic();
        }
      };
      tryStart();
      setTimeout(tryStart, 300);
    }
  }
  buildCandles();
  schedulePopup(true);
  setTimeout(bigParty, 300);
})();
