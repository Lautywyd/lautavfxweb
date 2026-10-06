document.querySelectorAll("[data-form]").forEach((form) => {
  const status = form.querySelector(".form-status");
  const btn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (form.getAttribute("action").includes("TU_ID_ACA")) {
      status.textContent = "⚠️ Falta poner el link de Formspree en el formulario.";
      status.className = "form-status error";
      return;
    }

    btn.disabled = true;
    status.className = "form-status";
    status.textContent = "Enviando...";

    try {
      const res = await fetch(form.getAttribute("action"), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = "✅ ¡Enviado! Te respondo a la brevedad.";
      status.className = "form-status ok";
    } catch {
      status.textContent = "❌ No se pudo enviar. Escribime por Instagram @lautavfx.";
      status.className = "form-status error";
    }
    btn.disabled = false;
  });
});