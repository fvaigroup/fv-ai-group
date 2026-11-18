/*!
 * fv-logo-3d.js — Logo de F&V AI Group en 3D, girando sobre su eje vertical.
 * Sin librerías. Funciona en cualquier sitio (HTML, React, Next.js, Vite...).
 *
 * 1) Componente:   <fv-logo-3d base="/assets/fv-logo-3d/"></fv-logo-3d>
 *    Atributos:
 *      base      carpeta pública donde están face.webp, edge.webp y halo.webp (por defecto /assets/fv-logo-3d/)
 *      turn      duración de una vuelta en ms (por defecto 2200)
 *      pause     pausa de frente entre vueltas en ms (por defecto 450; 0 = giro continuo)
 *      scroll    gira con el scroll en vez de con el reloj: una vuelta completa (360°) mientras el elemento
 *                indicado cruza la pantalla, desde que asoma por abajo hasta que sale por arriba.
 *                Valor: selector CSS del elemento a seguir (vacío = el propio logo). Ej.: scroll="#manifiesto".
 *                En este modo solo dibuja mientras el logo está en pantalla (no gasta batería fuera de ella).
 *    Tamaño con CSS: fv-logo-3d { --fv-size: 220px; }
 *    Con prefers-reduced-motion: no gira (queda de frente); solo late el farol.
 *
 * 2) Pantalla de carga a pantalla completa:
 *      FVLoader.show("Procesando...")   // muestra el logo fijo en el centro
 *      FVLoader.hide()                  // lo quita con un fundido
 *      await FVLoader.wrap(promesa)     // lo muestra mientras dura la promesa
 *    Para no parpadear: solo aparece si el trabajo tarda más de 250 ms
 *    y, una vez visible, se queda al menos 700 ms.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || window.customElements && customElements.get("fv-logo-3d")) return;

  var N = 14; // capas del canto (grosor)
  var SCRIPT_BASE = document.currentScript && document.currentScript.dataset.base;
  var BASE_DEFECTO = "/assets/fv-logo-3d/";

  var CSS =
    ":host{display:inline-block;position:relative;width:var(--fv-size,200px);aspect-ratio:420/370;perspective:1200px;contain:layout paint}" +
    ".halo{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}" +
    ".spin{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}" +
    ".layer,.face{position:absolute;inset:0;transform-style:preserve-3d}" +
    "img{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none;-webkit-user-drag:none}" +
    ".sheen{position:absolute;inset:0;pointer-events:none;opacity:0;-webkit-mask-size:100% 100%;mask-size:100% 100%;" +
    "background:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,236,214,.55) 47%,rgba(255,255,255,.9) 50%,rgba(255,236,214,.55) 53%,rgba(255,255,255,0) 70%);background-size:260% 100%}";

  function easeInOutSine(p) { return -(Math.cos(Math.PI * p) - 1) / 2; }

  class FVLogo3D extends HTMLElement {
    connectedCallback() {
      if (this._built) { this._start(); return; }
      this._built = true;
      var base = this.getAttribute("base") || SCRIPT_BASE || BASE_DEFECTO;
      if (base.slice(-1) !== "/") base += "/";
      var FACE = base + "face.webp", EDGE = base + "edge.webp", HALO = base + "halo.webp";

      if (!this.hasAttribute("role")) this.setAttribute("role", "img");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "F&V AI Group");

      var root = this.attachShadow({ mode: "open" });
      var style = document.createElement("style"); style.textContent = CSS; root.appendChild(style);

      function img(src) { var i = document.createElement("img"); i.src = src; i.alt = ""; i.decoding = "async"; i.draggable = false; return i; }
      this._halo = img(HALO); this._halo.className = "halo"; root.appendChild(this._halo);
      this._spin = document.createElement("div"); this._spin.className = "spin"; root.appendChild(this._spin);

      this._edges = [];
      for (var i = 0; i < N; i++) {
        var l = document.createElement("div"); l.className = "layer";
        l.appendChild(img(EDGE)); this._spin.appendChild(l); this._edges.push(l);
      }
      this._faces = []; this._sheens = [];
      for (var k = 0; k < 2; k++) {
        var f = document.createElement("div"); f.className = "face";
        var im = img(FACE);
        var sh = document.createElement("div"); sh.className = "sheen";
        sh.style.webkitMaskImage = sh.style.maskImage = "url(" + FACE + ")";
        f.appendChild(im); f.appendChild(sh); this._spin.appendChild(f);
        this._faces.push({ el: f, img: im }); this._sheens.push(sh);
      }

      var self = this;
      this._layout = function () {
        var T = Math.max(6, self.offsetWidth * 0.034);
        for (var i = 0; i < N; i++) {
          self._edges[i].style.transform = "translateZ(" + (-T / 2 + T * (i + 1) / (N + 1)).toFixed(2) + "px)";
        }
        self._faces[0].el.style.transform = "translateZ(" + (T / 2).toFixed(2) + "px)";
        self._faces[1].el.style.transform = "rotateY(180deg) translateZ(" + (T / 2).toFixed(2) + "px)";
      };
      this._layout();
      if (window.ResizeObserver) { this._ro = new ResizeObserver(this._layout); this._ro.observe(this); }

      // Modo scroll: solo dibuja mientras el logo está en pantalla
      if (this.hasAttribute("scroll") && "IntersectionObserver" in window) {
        this._visible = false;
        this._io = new IntersectionObserver(function (es) {
          self._visible = es[es.length - 1].isIntersecting;
          if (self._visible) self._start(); else self._stop();
        });
        this._io.observe(this);
        return;
      }
      this._start();
    }

    disconnectedCallback() { this._stop(); }

    _stop() { cancelAnimationFrame(this._raf); this._raf = 0; }

    // Avance 0..1 del elemento seguido por la pantalla: 0 = asoma por abajo, 1 = sale por arriba
    _progreso() {
      var sel = this.getAttribute("scroll");
      var el = (sel && document.querySelector(sel)) || this;
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var p = (vh - r.top) / (vh + r.height);
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    _render(th, now) {
      var pulse = 0.9 + 0.1 * Math.sin(now / 1000 * 2.2);
      // Si el ángulo no cambió (p. ej. no hubo scroll), solo late el farol: no se vuelven a pintar las caras
      if (th === this._th) { this._halo.style.opacity = ((0.82 + 0.18 * Math.abs(Math.cos(th))) * pulse).toFixed(3); return; }
      this._th = th;
      this._spin.style.transform = "rotateY(" + (th * 180 / Math.PI).toFixed(2) + "deg)";
      var c = Math.cos(th), s = Math.sin(th);
      var light = [Math.max(0, c), Math.max(0, -c)];
      for (var k = 0; k < 2; k++) {
        var b = 0.42 + 0.58 * Math.pow(light[k], 0.7);
        this._faces[k].img.style.filter = b > 0.995 ? "none" : "brightness(" + b.toFixed(3) + ")";
        var op = light[k] > 0.02 ? Math.pow(Math.abs(s), 1.4) * 0.75 * Math.min(1, light[k] * 3) : 0;
        this._sheens[k].style.opacity = op.toFixed(3);
        this._sheens[k].style.backgroundPosition = ((k ? -s : s) * 60 + 50).toFixed(1) + "% 0";
      }
      this._halo.style.opacity = ((0.82 + 0.18 * Math.abs(c)) * pulse).toFixed(3);
    }

    _start() {
      if (this._raf) return;
      var self = this;
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      var porScroll = this.hasAttribute("scroll");
      var TURN = +this.getAttribute("turn") || 2200;
      var PAUSE = this.hasAttribute("pause") ? +this.getAttribute("pause") : 450;
      var t0 = performance.now();
      function frame(now) {
        self._raf = requestAnimationFrame(frame);
        if (reduce) { self._render(0, now); return; } // sin giro: solo late el farol
        if (porScroll) { self._render(-2 * Math.PI * self._progreso(), now); return; }
        var t = (now - t0) % (TURN + PAUSE);
        var p = Math.min(t / TURN, 1);
        var th = PAUSE > 0 ? -2 * Math.PI * easeInOutSine(p) : -2 * Math.PI * (t / TURN);
        self._render(th, now);
      }
      this._raf = requestAnimationFrame(frame);
    }
  }
  customElements.define("fv-logo-3d", FVLogo3D);

  /* ---------- Pantalla de carga ---------- */
  var overlay = null, shownAt = 0, showTimer = 0, hideTimer = 0, depth = 0;
  var SHOW_DELAY = 250, MIN_VISIBLE = 700, FADE = 260;

  function ensure() {
    if (overlay) return overlay;
    var st = document.createElement("style");
    st.textContent =
      ".fv-loader{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;" +
      "background:var(--fv-loader-bg,rgba(5,7,11,.86));-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);" +
      "opacity:0;visibility:hidden;transition:opacity " + FADE + "ms ease,visibility 0s linear " + FADE + "ms}" +
      ".fv-loader.is-on{opacity:1;visibility:visible;transition:opacity " + FADE + "ms ease}" +
      ".fv-loader fv-logo-3d{--fv-size:var(--fv-loader-size,clamp(150px,28vw,240px))}" +
      ".fv-loader__msg{font:500 15px/1.4 system-ui,sans-serif;color:var(--fv-loader-text,#c9d3e0);letter-spacing:.01em;min-height:1.4em;text-align:center;padding:0 20px}";
    document.head.appendChild(st);
    overlay = document.createElement("div");
    overlay.className = "fv-loader";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    var base = window.FV_LOGO_3D_BASE || SCRIPT_BASE || BASE_DEFECTO;
    overlay.innerHTML = '<fv-logo-3d base="' + base + '"></fv-logo-3d><div class="fv-loader__msg"></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  window.FVLoader = {
    show: function (message) {
      depth++;
      clearTimeout(hideTimer);
      var el = ensure();
      el.querySelector(".fv-loader__msg").textContent = message || "";
      if (el.classList.contains("is-on") || showTimer) return;
      showTimer = setTimeout(function () {
        showTimer = 0;
        if (depth > 0) { el.classList.add("is-on"); shownAt = performance.now(); document.documentElement.style.overflow = "hidden"; }
      }, SHOW_DELAY);
    },
    hide: function () {
      depth = Math.max(0, depth - 1);
      if (depth > 0) return;
      if (showTimer) { clearTimeout(showTimer); showTimer = 0; return; }
      if (!overlay || !overlay.classList.contains("is-on")) return;
      var wait = Math.max(0, MIN_VISIBLE - (performance.now() - shownAt));
      hideTimer = setTimeout(function () {
        overlay.classList.remove("is-on");
        document.documentElement.style.overflow = "";
      }, wait);
    },
    wrap: function (promise, message) {
      var self = this; self.show(message);
      return Promise.resolve(promise).finally(function () { self.hide(); });
    }
  };
})();
