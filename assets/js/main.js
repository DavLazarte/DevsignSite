/* ==========================================================================
   Devsign — main.js
   Sin dependencias. Header, navegación, reveals, marquee y año.
   ========================================================================== */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Header con estado al hacer scroll ------------------------------------- */
  const header = doc.querySelector("[data-header]");
  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* Navegación móvil ------------------------------------------------------- */
  const navToggle = doc.querySelector("[data-nav-toggle]");
  const nav = doc.querySelector("[data-nav]");

  if (navToggle && nav) {
    const label = navToggle.querySelector(".nav-toggle__label");
    const firstLink = nav.querySelector("a");

    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      nav.dataset.open = String(open);
      doc.body.classList.toggle("nav-open", open);
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      if (open && firstLink) {
        window.setTimeout(() => firstLink.focus(), 60);
      }
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && navToggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
      }
    });

    setOpen(false);
  }

  /* Reveals al scroll ------------------------------------------------------ */
  const revealItems = Array.from(doc.querySelectorAll("[data-reveal]"));

  if (revealItems.length) {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    } else {
      const groups = new Map();
      doc.querySelectorAll("[data-reveal-group]").forEach((group) => {
        Array.from(group.querySelectorAll("[data-reveal]")).forEach((el, index) => {
          groups.set(el, index);
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const index = groups.get(el);
            if (typeof index === "number") {
              el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 70}ms`);
            }
            el.classList.add("is-visible");
            observer.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealItems.forEach((el) => observer.observe(el));
    }
  }

  /* Marquee: pausa accesible ---------------------------------------------- */
  doc.querySelectorAll("[data-marquee]").forEach((marquee) => {
    const button = marquee.querySelector("[data-marquee-pause]");
    if (!button) return;
    const text = button.querySelector("[data-marquee-label]");

    const setPaused = (paused) => {
      marquee.dataset.paused = String(paused);
      button.setAttribute("aria-pressed", String(paused));
      if (text) text.textContent = paused ? "Reproducir" : "Pausar";
    };

    button.addEventListener("click", () => {
      setPaused(marquee.dataset.paused !== "true");
    });

    setPaused(false);
  });

  /* Hero: slider de portada ------------------------------------------------ */
  const hero = doc.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const chapters = Array.from(hero.querySelectorAll("[data-hero-chapter]"));
    const prevBtn = hero.querySelector("[data-hero-prev]");
    const nextBtn = hero.querySelector("[data-hero-next]");
    const pauseBtn = hero.querySelector("[data-hero-pause]");
    const pauseLabel = hero.querySelector("[data-hero-pause-label]");
    const currentEl = hero.querySelector("[data-hero-current]");
    const bar = hero.querySelector("[data-hero-bar]");

    const canAuto = slides.length > 1;
    let index = 0;
    let userPaused = false;
    let pointerPaused = false;
    let focusPaused = false;

    const pad = (n) => String(n + 1).padStart(2, "0");
    const isPaused = () => !canAuto || userPaused || pointerPaused || focusPaused || doc.hidden;

    const syncPaused = () => {
      hero.classList.toggle("is-paused", isPaused());
      if (pauseBtn) pauseBtn.setAttribute("aria-pressed", String(userPaused));
      if (pauseLabel) pauseLabel.textContent = userPaused ? "Reproducir" : "Pausar";
    };

    const restartBar = () => {
      if (!canAuto || !bar) return;
      bar.style.animation = "none";
      void bar.offsetWidth;
      bar.style.animation = "";
      syncPaused();
    };

    const go = (next) => {
      index = (next + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
        // Una diapositiva oculta no debe poder recibir foco por teclado:
        // si no, los links de las otras 3 quedan en el orden de tabulación
        // dentro de un contenedor aria-hidden (falla axe/Lighthouse).
        slide.inert = !active;
      });

      chapters.forEach((chapter, i) => {
        if (i === index) chapter.setAttribute("aria-current", "true");
        else chapter.removeAttribute("aria-current");
      });

      if (currentEl) currentEl.textContent = pad(index);
      restartBar();
    };

    chapters.forEach((chapter, i) => {
      chapter.addEventListener("click", () => go(i));
    });

    if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        userPaused = !userPaused;
        if (!userPaused) {
          pointerPaused = false;
          focusPaused = false;
        }
        syncPaused();
        if (!userPaused) restartBar();
      });
    }

    if (bar) {
      bar.addEventListener("animationend", () => {
        if (!isPaused()) go(index + 1);
      });
    }

    // Pausa al pasar el mouse (escritorio) y al tocar (táctil).
    hero.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      pointerPaused = true;
      syncPaused();
    });

    hero.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      pointerPaused = false;
      syncPaused();
    });

    hero.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      // En táctil no hay "pointerleave": lo tratamos como pausa manual,
      // así el botón muestra "Reproducir" y el estado es coherente.
      userPaused = true;
      syncPaused();
    });

    // Pausa mientras el foco esté dentro del slider.
    hero.addEventListener("focusin", () => {
      focusPaused = true;
      syncPaused();
    });

    hero.addEventListener("focusout", (event) => {
      if (hero.contains(event.relatedTarget)) return;
      focusPaused = false;
      syncPaused();
    });

    hero.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
      }
    });

    doc.addEventListener("visibilitychange", syncPaused);

    if (pauseBtn) pauseBtn.hidden = !canAuto;
    if (!canAuto) {
      const progress = hero.querySelector(".hero__progress");
      if (progress) progress.hidden = true;
    }

    go(0);
  }

  /* Interés preseleccionado para el formulario de contacto ------------------ */
  const interesKey = "devsign:interes";

  const applyInteres = (value) => {
    if (!value) return;
    root.dataset.interes = value;
    try {
      sessionStorage.setItem(interesKey, value);
    } catch (error) {
      /* sessionStorage puede estar bloqueado; no es crítico. */
    }
    const field =
      doc.querySelector(`input[name="interes"][value="${value}"]`) ||
      doc.querySelector(`[data-interes-field] [value="${value}"]`);
    if (field) field.checked = true;

    // Conectar campos dinámicos contextuales
    doc.querySelectorAll("[data-dynamic]").forEach((el) => {
      const match = el.getAttribute("data-dynamic") === value;
      el.classList.toggle("is-active", match);
    });

    doc.dispatchEvent(new CustomEvent("devsign:interes", { detail: { interes: value } }));
  };

  doc.querySelectorAll("[data-interes]").forEach((link) => {
    link.addEventListener("click", () => applyInteres(link.getAttribute("data-interes")));
  });

  try {
    const savedInteres = sessionStorage.getItem(interesKey);
    if (savedInteres) applyInteres(savedInteres);
  } catch (error) {
    /* Sin sessionStorage no hay nada que recuperar. */
  }

  /* Formulario de contacto -------------------------------------------------- */
  // Endpoint del formulario procesado por contacto.php hacia admin@devsign.ar
  const FORM_ENDPOINT = "/contacto.php";

  const contactForm = doc.querySelector("[data-contact-form]");

  if (contactForm) {
    const statusEl = contactForm.querySelector("[data-form-status]");
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const interestFields = Array.from(contactForm.querySelectorAll('input[name="interes"]'));

    const setStatus = (message, state) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      if (state) statusEl.dataset.state = state;
      else statusEl.removeAttribute("data-state");
    };

    interestFields.forEach((field) => {
      field.addEventListener("change", () => applyInteres(field.value));
    });

    const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const interestLabel = (value) => {
      const field = interestFields.find((item) => item.value === value);
      const label = field ? field.closest("label") : null;
      return label ? clean(label.textContent) : value;
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const data = new FormData(contactForm);
      const payload = Object.fromEntries(data.entries());

      if (FORM_ENDPOINT) {
        setStatus("Enviando…");
        if (submitBtn) submitBtn.disabled = true;
        try {
          const response = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: data,
          });
          if (!response.ok) throw new Error("HTTP " + response.status);
          contactForm.reset();
          root.dataset.interes = "";
          try {
            sessionStorage.removeItem(interesKey);
          } catch (error) {
            /* Sin sessionStorage no hay nada que limpiar. */
          }
          setStatus("Listo. Te escribimos a la brevedad.", "ok");
        } catch (error) {
          setStatus("No pudimos enviar el formulario. Escribinos por WhatsApp.", "error");
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
        return;
      }

      // Respaldo sin backend: arma el mensaje y abre WhatsApp.
      const detalle =
        clean(payload.detalle_sistemas) ||
        clean(payload.detalle_ia) ||
        clean(payload.detalle_web) ||
        clean(payload.detalle_marketing) ||
        clean(payload.detalle_general);

      const lines = [
        "Hola Devsign, soy " + clean(payload.nombre) + ".",
        payload.negocio ? "Negocio: " + clean(payload.negocio) + "." : "",
        "Me interesa: " + interestLabel(payload.interes) + ".",
        detalle ? "Detalle: " + detalle + "." : "",
        payload.mensaje ? "Mensaje: " + clean(payload.mensaje) : "",
      ].filter(Boolean);

      const url = "https://wa.me/5493863515328?text=" + encodeURIComponent(lines.join(" "));
      window.open(url, "_blank", "noopener");
      setStatus("Te abrimos WhatsApp con el mensaje listo para enviar.", "ok");
    });
  }

  /* Casos de éxito: selector interactivo por pestañas (tabs) --------------- */
  const casesSection = doc.querySelector("[data-cases]");

  if (casesSection) {
    const tabs = Array.from(casesSection.querySelectorAll("[data-case-tab]"));
    const panels = Array.from(casesSection.querySelectorAll("[data-case-panel]"));

    const selectCase = (key, focusTab = false) => {
      tabs.forEach((tab) => {
        const active = tab.getAttribute("data-case-tab") === key;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focusTab) tab.focus();
      });

      panels.forEach((panel) => {
        const active = panel.getAttribute("data-case-panel") === key;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        selectCase(tab.getAttribute("data-case-tab"));
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = -1;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;

        if (nextIndex !== -1) {
          event.preventDefault();
          selectCase(tabs[nextIndex].getAttribute("data-case-tab"), true);
        }
      });
    });
  }

  /* Link activo en navegación según ruta actual ---------------------------- */
  const currentPath = window.location.pathname.replace(/index\.html$/, "");
  doc.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.includes("#")) return;
    if (
      (href === "/" && (currentPath === "/" || currentPath.endsWith("/devsign/"))) ||
      (href !== "/" && currentPath.includes(href))
    ) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* Lightbox de portfolio y reels en /marketing/ --------------------------- */
  const mktModal = doc.querySelector("[data-mkt-modal]");

  if (mktModal && typeof mktModal.showModal === "function") {
    const titleEl = mktModal.querySelector("[data-mkt-modal-title]");
    const tagEl = mktModal.querySelector("[data-mkt-modal-tag]");
    const descEl = mktModal.querySelector("[data-mkt-modal-desc]");
    const stageEl = mktModal.querySelector("[data-mkt-modal-stage]");
    const closeBtn = mktModal.querySelector("[data-mkt-modal-close]");

    const footEl = mktModal.querySelector("[data-mkt-modal-foot]");
    const extLink = mktModal.querySelector("[data-mkt-modal-ext]");

    const closeModal = () => {
      mktModal.classList.remove("mkt-modal--reel");
      if (stageEl) stageEl.innerHTML = "";
      if (footEl) footEl.hidden = true;
      mktModal.close();
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    mktModal.addEventListener("click", (event) => {
      if (event.target === mktModal) closeModal();
    });

    mktModal.addEventListener("close", () => {
      mktModal.classList.remove("mkt-modal--reel");
      if (stageEl) stageEl.innerHTML = "";
      if (footEl) footEl.hidden = true;
    });

    // Piezas del portfolio
    doc.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        mktModal.classList.remove("mkt-modal--reel");
        const src = trigger.getAttribute("data-lightbox-src");
        const title = trigger.getAttribute("data-lightbox-title") || "";
        const tag = trigger.getAttribute("data-lightbox-tag") || "";
        const desc = trigger.getAttribute("data-lightbox-desc") || "";

        if (titleEl) titleEl.textContent = title;
        if (tagEl) tagEl.textContent = tag;
        if (descEl) {
          descEl.textContent = desc;
          descEl.hidden = !desc;
        }
        if (footEl) footEl.hidden = true;
        if (stageEl && src) {
          stageEl.innerHTML = "";
          const img = doc.createElement("img");
          img.src = src;
          img.alt = title;
          stageEl.appendChild(img);
        }
        mktModal.showModal();
      });
    });

    // Reels de Instagram (modal vertical estilizado de smartphone / Elfsight style)
    doc.querySelectorAll("[data-reel-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const rawCode = (trigger.getAttribute("data-reel-code") || "").trim();
        if (!rawCode) return; // Sin código puntual, deja que el <a> abra @devsign.ar
        event.preventDefault();
        const code = rawCode.replace(/^\/?(p|reel)\//, "").replace(/\/$/, "");
        const title = trigger.getAttribute("data-reel-title") || "Reel de Instagram";

        mktModal.classList.add("mkt-modal--reel");
        if (titleEl) titleEl.textContent = title;
        if (tagEl) tagEl.textContent = "Instagram · @devsign.ar";
        if (descEl) descEl.hidden = true;
        if (footEl) footEl.hidden = false;
        if (extLink) extLink.href = "https://www.instagram.com/p/" + encodeURIComponent(code) + "/";

        if (stageEl) {
          stageEl.innerHTML = "";
          const iframe = doc.createElement("iframe");
          iframe.src = "https://www.instagram.com/p/" + encodeURIComponent(code) + "/embed/";
          iframe.title = title;
          iframe.loading = "lazy";
          iframe.allowFullscreen = true;
          stageEl.appendChild(iframe);
        }
        mktModal.showModal();
      });
    });
  }

  /* Switcher de vista Web / Sistema en capturas de casos ------------------- */
  doc.querySelectorAll("[data-shot-switcher]").forEach((switcher) => {
    const buttons = Array.from(switcher.querySelectorAll("[data-shot-toggle]"));
    const views = Array.from(switcher.querySelectorAll("[data-shot-view]"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.shotToggle;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        views.forEach((v) => {
          v.classList.toggle("is-active", v.dataset.shotView === target);
        });
      });
    });
  });

  /* Año dinámico ----------------------------------------------------------- */
  doc.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Marca el documento como mejorado -------------------------------------- */
  root.classList.add("js-ready");
})();
