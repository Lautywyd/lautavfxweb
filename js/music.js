// =====================================================
//  CONFIGURACIÓN DE MÚSICA  ·  ACÁ CAMBIÁS TUS DATOS
// =====================================================

// Pegá el link de tu playlist de Spotify (tiene que ser pública)
const SPOTIFY_PLAYLIST_URL = "PEGAR_LINK_DE_TU_PLAYLIST_ACA";

// Tracks del reproductor Antes / Después.
// Los archivos van en la carpeta assets/audio/
const AB_TRACKS = [
  {
    title: "Track de ejemplo 1",
    artist: "Nombre del artista",
    before: "assets/audio/ejemplo1-antes.mp3",
    after: "assets/audio/ejemplo1-despues.mp3",
  },
  {
    title: "Track de ejemplo 2",
    artist: "Nombre del artista",
    before: "assets/audio/ejemplo2-antes.mp3",
    after: "assets/audio/ejemplo2-despues.mp3",
  },
];

// =====================================================
//  REPRODUCTOR ANTES / DESPUÉS
// =====================================================
(function () {
  const player = document.getElementById("abPlayer");
  if (!player) return;

  const $ = (id) => document.getElementById(id);
  const els = {
    title: $("abTitle"), artist: $("abArtist"), tracks: $("abTracks"),
    play: $("abPlay"), seek: $("abSeek"), time: $("abTime"), status: $("abStatus"),
  };
  const modeBtns = document.querySelectorAll("#abSwitch button");
  const bars = document.querySelectorAll("#eq span");

  const before = new Audio();
  const after = new Audio();
  before.preload = after.preload = "auto";

  let current = 0, mode = "before", actx, analyser, gainB, gainA, data, raf, seeking = false;

  const mmss = (s) => {
    if (!isFinite(s)) return "0:00";
    return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  };

  function setStatus(msg, isError) {
    els.status.textContent = msg;
    els.status.classList.toggle("error", !!isError);
  }

  // --- Audio (Web Audio API): dos pistas sincronizadas, una suena y la otra queda en silencio ---
  function setupAudio() {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const srcB = actx.createMediaElementSource(before);
    const srcA = actx.createMediaElementSource(after);
    gainB = actx.createGain();
    gainA = actx.createGain();
    analyser = actx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    srcB.connect(gainB);
    srcA.connect(gainA);
    gainB.connect(analyser);
    gainA.connect(analyser);
    analyser.connect(actx.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
    applyMode(true);
  }

  function applyMode(instant) {
    if (!actx) return;
    const t = actx.currentTime;
    const b = mode === "before" ? 1 : 0;
    const a = 1 - b;
    if (instant) {
      gainB.gain.setValueAtTime(b, t);
      gainA.gain.setValueAtTime(a, t);
    } else {
      gainB.gain.setTargetAtTime(b, t, 0.03);
      gainA.gain.setTargetAtTime(a, t, 0.03);
    }
  }

  // --- Loop de animación mientras suena ---
  function tick() {
    const d = before.duration || 0;
    if (!seeking) els.seek.value = d ? (before.currentTime / d) * 100 : 0;
    els.time.textContent = mmss(before.currentTime) + " / " + mmss(d);

    // mantener las dos pistas sincronizadas
    if (Math.abs(after.currentTime - before.currentTime) > 0.08) {
      after.currentTime = before.currentTime;
    }

    analyser.getByteFrequencyData(data);
    bars.forEach((bar, i) => {
      const idx = Math.floor((i * data.length * 0.7) / bars.length);
      bar.style.transform = `scaleY(${Math.max(0.06, data[idx] / 255)})`;
    });
    raf = requestAnimationFrame(tick);
  }

  function startViz() {
    bars.forEach((b) => (b.style.animationName = "none"));
    cancelAnimationFrame(raf);
    tick();
  }
  function stopViz() {
    cancelAnimationFrame(raf);
    bars.forEach((b) => { b.style.animationName = ""; b.style.transform = ""; });
  }

  // --- Controles ---
  async function play() {
    setupAudio();
    await actx.resume();
    after.currentTime = before.currentTime;
    try {
      await Promise.all([before.play(), after.play()]);
    } catch (e) {
      return;
    }
    els.play.textContent = "❚❚";
    startViz();
  }

  function pause() {
    before.pause();
    after.pause();
    els.play.textContent = "▶";
    stopViz();
  }

  function loadTrack(i) {
    current = i;
    const t = AB_TRACKS[i];
    pause();
    els.title.textContent = t.title;
    els.artist.textContent = t.artist;
    setStatus("");
    before.src = t.before;
    after.src = t.after;
    before.load();
    after.load();
    els.seek.value = 0;
    els.time.textContent = "0:00 / 0:00";
    els.tracks.querySelectorAll("button").forEach((b, n) => b.classList.toggle("active", n === i));
  }

  els.play.addEventListener("click", () => (before.paused ? play() : pause()));

  els.seek.addEventListener("input", () => {
    seeking = true;
    const d = before.duration || 0;
    const t = (els.seek.value / 100) * d;
    before.currentTime = t;
    after.currentTime = t;
    els.time.textContent = mmss(t) + " / " + mmss(d);
  });
  els.seek.addEventListener("change", () => { seeking = false; });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      modeBtns.forEach((b) => b.classList.toggle("active", b === btn));
      applyMode(false);
    });
  });

  before.addEventListener("ended", () => {
    pause();
    before.currentTime = 0;
    after.currentTime = 0;
    els.seek.value = 0;
  });

  const onError = () => setStatus("🎧 Modo demo: agregá tus audios en assets/audio/ con los nombres de AB_TRACKS (js/music.js) para activar el reproductor.", true);
  before.addEventListener("error", onError);
  after.addEventListener("error", onError);

  // --- Selector de tracks ---
  if (AB_TRACKS.length > 1) {
    AB_TRACKS.forEach((t, i) => {
      const b = document.createElement("button");
      b.textContent = "Track " + (i + 1);
      b.addEventListener("click", () => loadTrack(i));
      els.tracks.appendChild(b);
    });
  }

  loadTrack(0);
})();

// =====================================================
//  PLAYLIST DE SPOTIFY
// =====================================================
(function () {
  const box = document.getElementById("spotifyBox");
  if (!box) return;

  const match = SPOTIFY_PLAYLIST_URL.match(/playlist\/([A-Za-z0-9]+)/);
  if (!match) {
    box.innerHTML = `<div class="spotify-placeholder">🎵 Acá va tu playlist de Spotify.<br><small>Pegá el link en <code>SPOTIFY_PLAYLIST_URL</code> (js/music.js).</small></div>`;
    return;
  }

  box.innerHTML = `
    <iframe title="Playlist Mix & Master by @lautywyd en Spotify"
      src="https://open.spotify.com/playlist/4lSBTLomOt9lZBfNu2aVU9?si=xty69EVPRkKVxDu1LtsQ4g&utm_source=whatsapp&pi=Pm-FHkAUROC-U${match[1]}?utm_source=generator&theme=0"
      width="100%" height="380" frameborder="0" loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    <a class="btn btn-ghost" href="${SPOTIFY_PLAYLIST_URL}" target="_blank" rel="noopener">
      <i class="fa-brands fa-spotify"></i> Abrir en Spotify
    </a>`;
})();