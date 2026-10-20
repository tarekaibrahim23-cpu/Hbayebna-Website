/* =========================================================
   Hbayebna — shared page script
   Language toggle (EN / AR with RTL), option lists, mobile
   menu, client logos.
   ========================================================= */
(function () {
  "use strict";
  var AR = window.I18N_AR || {};
  var LISTS = window.LISTS || {};
  var root = document.documentElement;

  /* ---------- safe storage ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ---------- option lists ---------- */
  function populateLists() {
    document.querySelectorAll("select[data-list]").forEach(function (sel) {
      var list = LISTS[sel.dataset.list] || [];
      var group = null;
      list.forEach(function (item) {
        if (typeof item === "string" && item.charAt(0) === "#") {
          var parts = item.slice(1).split("|");
          group = document.createElement("optgroup");
          group.label = parts[0];
          group.dataset.en = parts[0];
          group.dataset.ar = parts[1] || parts[0];
          sel.appendChild(group);
          return;
        }
        var opt = document.createElement("option");
        opt.value = item[0];
        opt.textContent = item[0];
        opt.dataset.en = item[0];
        opt.dataset.ar = item[1] || item[0];
        (group || sel).appendChild(opt);
      });
    });

    document.querySelectorAll(".choices[data-list]").forEach(function (box) {
      var list = LISTS[box.dataset.list] || [];
      var name = box.dataset.name;
      var type = box.dataset.type || "checkbox";
      list.forEach(function (item, i) {
        var id = name + "_" + i;
        var label = document.createElement("label");
        label.className = "choice";
        label.setAttribute("for", id);
        var input = document.createElement("input");
        input.type = type;
        input.name = name;
        input.id = id;
        input.value = item[0];
        if (box.dataset.default === item[0]) input.checked = true;
        var span = document.createElement("span");
        span.textContent = item[0];
        span.dataset.en = item[0];
        span.dataset.ar = item[1] || item[0];
        label.appendChild(input);
        label.appendChild(span);
        box.appendChild(label);
      });
    });
  }

  /* ---------- language ---------- */
  function applyLang(lang) {
    lang = lang === "ar" ? "ar" : "en";
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      var key = el.dataset.i18n;
      el.innerHTML = lang === "ar" && AR[key] ? AR[key] : el.dataset.en;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      if (el.dataset.phEn === undefined) el.dataset.phEn = el.getAttribute("placeholder") || "";
      var key = el.dataset.i18nPh;
      el.setAttribute("placeholder", lang === "ar" && AR[key] ? AR[key] : el.dataset.phEn);
    });
    document.querySelectorAll("option[data-ar], .choice span[data-ar]").forEach(function (el) {
      el.textContent = lang === "ar" ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll("optgroup[data-ar]").forEach(function (el) {
      el.label = lang === "ar" ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    store("hb-lang", lang);
    document.dispatchEvent(new CustomEvent("hb:langchange", { detail: { lang: lang } }));
  }
  window.HB = window.HB || {};
  window.HB.lang = function () { return root.lang === "ar" ? "ar" : "en"; };
  window.HB.applyLang = applyLang;

  /* ---------- mobile menu ----------
     The menu opens as a panel over the page (see .nav-links in
     style.css), so the header never changes height. */
  function initMenu() {
    var btn = document.querySelector(".menu-btn");
    var links = document.getElementById("navLinks");
    if (!btn || !links) return;
    var scrim = null;
    function setOpen(open) {
      links.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open && !scrim) {
        scrim = document.createElement("div");
        scrim.className = "nav-scrim";
        scrim.addEventListener("click", function () { setOpen(false); });
        document.body.appendChild(scrim);
      } else if (!open && scrim) {
        scrim.remove(); scrim = null;
      }
    }
    btn.addEventListener("click", function () { setOpen(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && links.classList.contains("open")) { setOpen(false); btn.focus(); } });
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (mq) { if (mq.matches) setOpen(false); });
  }

  /* ---------- client logos (home page) ---------- */
  var CLIENTS = [
    ["enjoyed","Enjoyed Lounge"],["balcona99","Balcona 99"],["rif-indian","Indian Rural Restaurants"],["alshewaa","Alshewaa Al Shami"],
    ["taj-indian","Taj Indian Restaurant"],["yamin","Yamin Restaurant"],["the-break","The Break"],["loukoumades","Loukoumades"],
    ["yerevan","Yerevan Armenia"],["houn-beirut","Houn Beirut"],["boutique","Boutique"],["avril","Avril"],
    ["rouh-beirut","Rouh Beirut"],["amas","Amas Restaurant"],["velar-inn","Velar Inn"],["nobles","Nobles Restaurant"],
    ["jouri","Joori min Beirut"],["aria","Aria Lounge"],["artur","Artur"],["fatila","Fatileh"],
    ["bahar-al-hind","Indian Bihar"],["dar-al-oujh","Dar Al Oujh"],["hadikat-al-taj","Hadikat Al Taj"],["olimpo","Olimpo Indian Restaurant"],
    ["jai-w-shai","Jai w Shai"],["villa-fayrouz","Villa Fayrouz"],["skill-grill","Skill on the Grill"]
  ];
  function renderClients() {
    var grid = document.getElementById("logoGrid");
    if (!grid) return;
    CLIENTS.forEach(function (c) {
      var fig = document.createElement("figure");
      fig.innerHTML = '<img src="assets/clients/' + c[0] + '.jpg" alt="' + c[1] + '" title="' + c[1] + '" width="130" height="130" loading="lazy" decoding="async">';
      grid.appendChild(fig);
    });
  }

  /* ---------- boot ---------- */
  populateLists();
  renderClients();
  initMenu();
  document.querySelectorAll(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });
  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.dataset.lang); });
  });
  var q = new URLSearchParams(location.search).get("lang");
  applyLang(q || store("hb-lang") || "en");
})();
