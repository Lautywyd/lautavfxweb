// Navbar con efecto al hacer scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

// Aparición de secciones al hacer scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Pop-ups (modales)
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.modal));
});

document.querySelectorAll(".modal").forEach((modal) => {
  // cerrar con la X o haciendo clic afuera de la caja
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("modal-close")) {
      closeModal(modal);
    }
  });
});

// cerrar con la tecla Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.open").forEach(closeModal);
  }
});

// ===== Pantalla de carga =====
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("hidden"), 1200);
});

// ===== Barra de progreso de scroll =====
const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / max) * 100 + "%";
});

// ===== Brillo que sigue al cursor =====
const glow = document.getElementById("cursorGlow");
let gx = 0, gy = 0, tx = 0, ty = 0;
window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
(function followCursor() {
  gx += (tx - gx) * 0.12;
  gy += (ty - gy) * 0.12;
  glow.style.transform = `translate(${gx}px, ${gy}px)`;
  requestAnimationFrame(followCursor);
})();

// ===== Texto que se escribe =====
const words = ["VFX en After Effects", "edición de video", "mezcla y masterización", "música digital"];
const typedEl = document.getElementById("typed");
let wi = 0, ci = 0, deleting = false;
function type() {
  const word = words[wi];
  typedEl.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) { ci++; setTimeout(type, 80); }
  else if (!deleting) { deleting = true; setTimeout(type, 1500); }
  else if (ci > 0) { ci--; setTimeout(type, 40); }
  else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
}
type();

// ===== Partículas del hero =====
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const hero = document.getElementById("inicio");
const mouse = { x: null, y: null };
let particles = [];

function initParticles() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 16000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
  }));
}

hero.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
hero.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
window.addEventListener("resize", initParticles);

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 179, 255, 0.8)";
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(47, 107, 255, ${0.25 * (1 - d / 120)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    if (mouse.x !== null) {
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160) {
        ctx.strokeStyle = `rgba(0, 179, 255, ${0.6 * (1 - dm / 160)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  initParticles();
  drawParticles();
}

// ===== Tarjetas 3D con luz =====
document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotY = (x / rect.width - 0.5) * 14;
    const rotX = -(y / rect.height - 0.5) * 14;
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    card.style.setProperty("--mx", x + "px");
    card.style.setProperty("--my", y + "px");
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

// ===== Botones magnéticos =====
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

// ===== Contadores animados =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1500;
    (function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

// ===== Ecualizador =====
const eq = document.getElementById("eq");
for (let i = 0; i < 48; i++) {
  const bar = document.createElement("span");
  bar.style.animationDuration = (0.4 + Math.random() * 0.9) + "s";
  bar.style.animationDelay = (-Math.random() * 1.5) + "s";
  eq.appendChild(bar);
}

// =====================================================
//  PLANES  ·  ACÁ CAMBIÁS PRECIOS, TEXTOS Y LINKS DE PAGO
// =====================================================
// ⚠️ Los precios en USD y los links de pago son DE EJEMPLO.
// Cambiá "#" por tus links reales de Mercado Pago (mp) y PayPal (paypal).
const PLANS = [
  {
    id: "vfx-basico", group: "vfx",
    name: "VFX Básico", tagline: "Hasta 1 minuto",
    ars: 10000, usd: 8,
    delivery: "Aprox. 1 semana",
    features: ["Montaje + VFX en After Effects", "Hasta 1 minuto de video", "3 revisiones", "Entrega en MP4 (1080p 60fps)"],
    mp: "#", paypal: "#",
  },
  {
    id: "vfx-estandar", group: "vfx",
    name: "VFX Estándar", tagline: "Hasta 2 minutos",
    ars: 20000, usd: 16,
    delivery: "Aprox. 1 semana",
    features: ["Montaje + VFX en After Effects", "Hasta 2 minutos de video", "3 revisiones", "Entrega en MP4 (1080p 60fps)"],
    mp: "#", paypal: "#",
  },
  {
    id: "vfx-pro", group: "vfx", featured: true,
    name: "VFX Pro", tagline: "Hasta 3 minutos · ideal videoclips",
    ars: 40000, usd: 32,
    oldArs: 65000, oldUsd: 52,
    badge: "-38%",
    delivery: "Entrega prioritaria (te doy una fecha según el proyecto)",
    features: ["Montaje + VFX en After Effects", "Hasta 3 minutos de video", "Entrega prioritaria", "3 revisiones", "Entrega en MP4 (1080p 60fps)"],
    mp: "#", paypal: "#",
  },
  {
    id: "mix", group: "audio",
    name: "Mix", tagline: "Mezcla de tu track",
    ars: 15000, usd: 12,
    delivery: "A coordinar según el proyecto",
    features: ["Pistas y stems ilimitados (ordenados)", "3 revisiones", "Entrega en WAV"],
    mp: "#", paypal: "#",
  },
  {
    id: "master", group: "audio",
    name: "Master", tagline: "Masterización de tu track",
    ars: 15000, usd: 12,
    delivery: "A coordinar según el proyecto",
    features: ["Masterización profesional", "3 revisiones", "Entrega en WAV"],
    mp: "#", paypal: "#",
  },
  {
    id: "pack", group: "audio", featured: true,
    name: "Pack Mix + Master", tagline: "El combo completo",
    ars: 25000, usd: 20,
    badge: "Ahorrás 17%",
    delivery: "A coordinar según el proyecto",
    features: ["Mezcla + masterización", "Pistas y stems ilimitados (ordenados)", "3 revisiones", "Entrega en WAV"],
    mp: "#", paypal: "#",
  },
];

let currency = "ARS";
const priceOf = (p) => (currency === "ARS" ? p.ars : p.usd);
const oldPriceOf = (p) => (currency === "ARS" ? p.oldArs : p.oldUsd);
const fmt = (n) =>
  currency === "ARS" ? "$" + n.toLocaleString("es-AR") : "US$ " + n.toLocaleString("en-US");

function planCardHTML(p, i) {
  return `
    <article class="plan tilt-plan ${p.featured ? "featured" : ""}" data-plan="${p.id}" style="--d:${i * 0.12}s">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <h4>${p.name}</h4>
      <p class="tagline">${p.tagline}</p>
      <div class="old-price" data-old="${p.id}">${oldPriceOf(p) ? fmt(oldPriceOf(p)) : ""}</div>
      <div class="price" data-price="${p.id}">${fmt(priceOf(p))}</div>
      <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      <button class="btn">Elegir plan</button>
    </article>`;
}

function renderPlans() {
  ["vfx", "audio"].forEach((group) => {
    const container = document.getElementById("plans-" + group);
    container.innerHTML = PLANS.filter((p) => p.group === group).map(planCardHTML).join("");
  });
  document.querySelectorAll(".tilt-plan").forEach(attachTilt);
}

function attachTilt(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.transform = `rotateX(${-(y / rect.height - 0.5) * 10}deg) rotateY(${(x / rect.width - 0.5) * 10}deg) translateY(-6px)`;
    card.style.setProperty("--mx", x + "px");
    card.style.setProperty("--my", y + "px");
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
}

// Animación del número al cambiar de moneda
function tweenPrice(el, from, to, format) {
  const start = performance.now();
  const duration = 500;
  (function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

function updatePrices(prevCurrency) {
  PLANS.forEach((p) => {
    const priceEl = document.querySelector(`[data-price="${p.id}"]`);
    const oldEl = document.querySelector(`[data-old="${p.id}"]`);
    const from = prevCurrency === "ARS" ? p.ars : p.usd;
    tweenPrice(priceEl, from, priceOf(p), (n) => fmt(n));
    if (oldEl) oldEl.textContent = oldPriceOf(p) ? fmt(oldPriceOf(p)) : "";
  });
}

document.querySelectorAll("#currencyToggle button").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.cur === currency) return;
    const prev = currency;
    currency = btn.dataset.cur;
    document.querySelectorAll("#currencyToggle button").forEach((b) => b.classList.toggle("active", b === btn));
    updatePrices(prev);
  });
});

function openPlanModal(id) {
  const p = PLANS.find((x) => x.id === id);
  const old = oldPriceOf(p);
  const payLink = currency === "ARS" ? p.mp : p.paypal;
  const payLabel = currency === "ARS" ? "Pagar con Mercado Pago" : "Pagar con PayPal";

  document.getElementById("modalPlanContent").innerHTML = `
    <h3>${p.name}</h3>
    <p style="color:var(--muted)">${p.tagline}</p>
    <div class="modal-price">${old ? `<s>${fmt(old)}</s>` : ""}${fmt(priceOf(p))}</div>
    <ul class="modal-list">
      ${p.features.map((f) => `<li>${f}</li>`).join("")}
      <li>${p.delivery}</li>
    </ul>
    <p class="modal-note">Después del pago te contacto para definir la dirección creativa (estilo, referencias, fecha) y arrancar el proyecto.</p>

    <div class="receipt-notice">
      <strong>⚠️ Importante</strong>
      <p>Después de pagar, enviame el comprobante por DM a
        <a href="https://instagram.com/lautavfx" target="_blank" rel="noopener">@lautavfx</a>
        para confirmar tu pago.</p>
      <label class="check-row">
        <input type="checkbox" id="receiptCheck">
        <span>Entendido, voy a enviar el comprobante por DM</span>
      </label>
    </div>

    <a class="btn disabled" id="payBtn" href="${payLink}" target="_blank" rel="noopener">${payLabel}</a>`;

  const payBtn = document.getElementById("payBtn");
  const check = document.getElementById("receiptCheck");

  check.addEventListener("change", () => {
    payBtn.classList.toggle("disabled", !check.checked);
  });

  payBtn.addEventListener("click", (e) => {
    if (!check.checked) {
      e.preventDefault();
      const row = check.closest(".check-row");
      row.classList.add("shake");
      setTimeout(() => row.classList.remove("shake"), 450);
      return;
    }
    if (payLink === "#") {
      e.preventDefault();
      alert("Todavía falta poner el link de pago real de este plan en main.js.");
    }
  });

  openModal("modal-plan");
}
document.querySelector("#planes").addEventListener("click", (e) => {
  const card = e.target.closest("[data-plan]");
  if (card) openPlanModal(card.dataset.plan);
});

renderPlans();