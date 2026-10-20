/* =========================================================
   Hbayebna — registration forms
   Validation, conditional questions, and submission to
   Google Forms (configured in js/config.js).
   ========================================================= */
(function () {
  "use strict";
  var form = document.getElementById("regForm");
  if (!form) return;

  var CONFIG = window.HBAYEBNA_CONFIG || { forms: {}, contact: {} };
  var TYPE = form.dataset.form;                       // "employer" | "employee"
  var CFG = (CONFIG.forms && CONFIG.forms[TYPE]) || {};
  var CONTACT = CONFIG.contact || {};
  var successBox = document.getElementById("success");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  function T(key) {
    var all = window.UI_TEXT || {};
    var lang = window.HB && window.HB.lang ? window.HB.lang() : "en";
    return (all[lang] && all[lang][key]) || (all.en && all.en[key]) || key;
  }

  /* ---------- reference number ---------- */
  function makeRef() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    var rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return form.dataset.refPrefix + "-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + rnd;
  }
  var REF = makeRef();
  var refEl = document.getElementById("refNo");
  if (refEl) refEl.textContent = REF;

  /* ---------- conditional questions ---------- */
  function currentValue(name) {
    var els = form.elements[name];
    if (!els) return "";
    if (els instanceof RadioNodeList || (els.length && !els.tagName)) {
      var vals = [];
      Array.prototype.forEach.call(els, function (e) { if (e.checked) vals.push(e.value); });
      return vals;
    }
    if (els.type === "checkbox" || els.type === "radio") return els.checked ? [els.value] : [];
    return [els.value];
  }
  function updateConditions() {
    form.querySelectorAll("[data-show-if]").forEach(function (el) {
      var rule = el.dataset.showIf.split("=");
      var show = currentValue(rule[0]).indexOf(rule[1]) !== -1;
      el.classList.toggle("show", show);
    });
  }
  function isHidden(el) { var c = el.closest(".cond"); return !!(c && !c.classList.contains("show")); }

  /* ---------- labels (English for the data, current language for display) ---------- */
  var LABEL_OVERRIDES = {
    salaryMin: ["Salary offered – from", "الراتب المعروض – من"],
    salaryMax: ["Salary offered – to", "الراتب المعروض – إلى"],
    currency: ["Currency", "العملة"]
  };
  function labelFor(name, lang) {
    if (LABEL_OVERRIDES[name]) return LABEL_OVERRIDES[name][lang === "ar" ? 1 : 0];
    var ctrl = form.elements[name];
    var first = ctrl && !ctrl.tagName ? ctrl[0] : ctrl;
    if (!first) return name;
    var field = first.closest(".field");
    var lab = field && (field.querySelector(":scope > label") || field.querySelector(".group-label"));
    if (!lab) return name;
    if (name === "consent") return lang === "ar" ? "الموافقة" : "Consent";
    var i18n = lab.matches("[data-i18n]") ? lab : lab.querySelector("[data-i18n]");
    if (i18n) {
      if (lang === "ar") return (window.I18N_AR || {})[i18n.dataset.i18n] || i18n.dataset.en || i18n.textContent;
      return (i18n.dataset.en || i18n.textContent).replace(/&amp;/g, "&");
    }
    return lab.textContent.replace("*", "").trim();
  }
  function displayValue(name, value, lang) {
    if (lang !== "ar") return value;
    // translate list values back to Arabic for the on-screen summary
    var ctrl = form.elements[name];
    var nodes = ctrl && !ctrl.tagName ? Array.prototype.slice.call(ctrl) : [ctrl];
    var map = {};
    nodes.forEach(function (n) {
      if (!n) return;
      if (n.tagName === "SELECT") Array.prototype.forEach.call(n.options, function (o) { if (o.dataset.ar) map[o.value] = o.dataset.ar; });
      else if (n.nextElementSibling && n.nextElementSibling.dataset.ar) map[n.value] = n.nextElementSibling.dataset.ar;
    });
    return value.split(", ").map(function (v) { return map[v] || v; }).join("، ");
  }

  /* ---------- collect ---------- */
  function collect() {
    var names = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && names.indexOf(el.name) === -1) names.push(el.name);
    });
    var data = [];
    names.forEach(function (name) {
      var ctrl = form.elements[name];
      var first = ctrl.tagName ? ctrl : ctrl[0];
      if (isHidden(first)) return;
      var value;
      if (first.type === "checkbox" || first.type === "radio") value = currentValue(name).join(", ");
      else value = String(ctrl.value || "").trim();
      data.push({ key: name, label: labelFor(name, "en"), value: value });
    });
    var lang = window.HB.lang();
    return [
      { key: "reference", label: "Reference", value: REF },
      { key: "formType", label: "Form", value: TYPE === "employer" ? "Employer request" : "Job seeker registration" },
      { key: "submittedAt", label: "Submitted at", value: new Date().toLocaleString("en-GB") },
      { key: "language", label: "Language", value: lang === "ar" ? "Arabic" : "English" }
    ].concat(data);
  }
  function summaryText(data) {
    var title = TYPE === "employer" ? "Hbayebna – Employer request" : "Hbayebna – Job seeker registration";
    var lines = [title];
    data.forEach(function (d) { if (d.value) lines.push(d.label + ": " + d.value); });
    return lines.join("\n");
  }

  /* ---------- validation ---------- */
  function setInvalid(field, bad) { if (field) field.classList.toggle("invalid", !!bad); return !bad; }
  function validateField(field) {
    if (isHidden(field) || field.classList.contains("cond") && !field.classList.contains("show")) return true;
    var group = field.dataset.requiredGroup;
    if (group) return setInvalid(field, currentValue(group).length === 0);
    var ok = true;
    field.querySelectorAll("input:not([type=checkbox]):not([type=radio]), select, textarea").forEach(function (c) {
      if (c.value && typeof c.value === "string" && c.type !== "date") c.value = c.value.replace(/^\s+/, "");
      if (!c.checkValidity()) ok = false;
      if (c.required && !String(c.value).trim()) ok = false;
    });
    // custom rules
    var min = field.querySelector("#salaryMin"), max = field.querySelector("#salaryMax");
    if (min && max && min.value && max.value && Number(max.value) < Number(min.value)) ok = false;
    var dob = field.querySelector("#dob");
    if (dob && dob.value) {
      var age = (Date.now() - new Date(dob.value).getTime()) / 31557600000;
      if (!(age >= 18 && age < 80)) ok = false;
    }
    return setInvalid(field, !ok);
  }
  function validateAll() {
    var firstBad = null;
    form.querySelectorAll(".field").forEach(function (f) {
      if (!validateField(f) && !firstBad) firstBad = f;
    });
    return firstBad;
  }

  /* ---------- section progress (side nav) ---------- */
  function sectionComplete(fs) {
    var done = true;
    fs.querySelectorAll(".field").forEach(function (f) {
      if (isHidden(f)) return;
      if (f.dataset.requiredGroup) { if (!currentValue(f.dataset.requiredGroup).length) done = false; return; }
      f.querySelectorAll("[required]").forEach(function (c) { if (!String(c.value).trim() || !c.checkValidity()) done = false; });
    });
    return done;
  }
  function updateProgress() {
    document.querySelectorAll(".steps-nav a[data-step]").forEach(function (a) {
      var fs = document.getElementById(a.dataset.step);
      if (fs) a.classList.toggle("done", sectionComplete(fs));
    });
  }

  form.addEventListener("input", onChange);
  form.addEventListener("change", onChange);
  function onChange(e) {
    updateConditions();
    updateProgress();
    var f = e.target.closest(".field");
    if (f && f.classList.contains("invalid")) validateField(f);
  }

  /* ---------- Google Forms ---------- */
  function resolveGoogle() {
    var entries = {};
    var formId = (CFG.formId || "").trim();
    var summaryEntry = (CFG.summaryEntry || "").trim();
    if (CFG.prefilledUrl) {
      try {
        var u = new URL(CFG.prefilledUrl);
        var m = u.pathname.match(/\/forms\/d\/e\/([^/]+)\//);
        if (m && !formId) formId = m[1];
        u.searchParams.forEach(function (val, k) {
          if (k.indexOf("entry.") !== 0) return;
          val = val.trim();
          if (val === "summary" || val === "allDetails") summaryEntry = summaryEntry || k;
          else entries[val] = k;
        });
      } catch (err) { console.warn("[Hbayebna] prefilledUrl is not a valid link", err); }
    }
    Object.keys(CFG.entries || {}).forEach(function (k) { if (CFG.entries[k]) entries[k] = CFG.entries[k]; });
    // allow formId to be pasted as a full link
    var mm = formId.match(/\/forms\/d\/e\/([^/]+)/);
    if (mm) formId = mm[1];
    return { formId: formId, entries: entries, summaryEntry: summaryEntry,
             ready: !!formId && (Object.keys(entries).length > 0 || !!summaryEntry) };
  }

  function sendToGoogle(g, data) {
    var params = new URLSearchParams();
    data.forEach(function (d) {
      var entry = g.entries[d.key];
      if (!entry || !d.value) return;
      if (CFG.checkboxesAsList && d.value.indexOf(", ") !== -1) d.value.split(", ").forEach(function (v) { params.append(entry, v); });
      else params.append(entry, d.value);
    });
    if (g.summaryEntry) params.append(g.summaryEntry, summaryText(data));
    if (CONFIG.debug) console.log("[Hbayebna] Google Form", g.formId, Object.fromEntries(params));
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    return fetch("https://docs.google.com/forms/d/e/" + encodeURIComponent(g.formId) + "/formResponse", {
      method: "POST", mode: "no-cors", body: params, signal: ctrl ? ctrl.signal : undefined
    }).finally(function () { clearTimeout(timer); });
  }

  /* ---------- success / fallback screen ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var lastData = null, lastState = null;

  function renderSuccess(state) {
    lastState = state;
    var data = lastData;
    var lang = window.HB.lang();
    var text = summaryText(data);
    var wa = "https://wa.me/" + (CONTACT.whatsapp || "") + "?text=" + encodeURIComponent(text);
    var mail = "mailto:" + (CONTACT.email || "") + "?subject=" + encodeURIComponent((TYPE === "employer" ? "Employer request " : "Job seeker registration ") + REF) + "&body=" + encodeURIComponent(text);

    var title = state === "sent" ? (TYPE === "employer" ? T("okTitleEr") : T("okTitleEe")) : (lang === "ar" ? "خطوة أخيرة" : "One last step");
    var body = state === "sent" ? (TYPE === "employer" ? T("okBodyEr") : T("okBodyEe")) : "";
    var notice = state === "notConfigured" ? T("notConfigured") : state === "error" ? T("netError") : "";

    var rows = data.filter(function (d) { return d.value && ["formType", "submittedAt", "language"].indexOf(d.key) === -1; })
      .map(function (d) {
        var lbl = d.key === "reference" ? (lang === "ar" ? "المرجع" : "Reference") : labelFor(d.key, lang);
        return "<dt>" + esc(lbl) + "</dt><dd>" + esc(displayValue(d.key, d.value, lang)) + "</dd>";
      }).join("");

    successBox.innerHTML =
      '<span class="stamp">' + esc(REF) + "</span>" +
      "<h2>" + esc(title) + "</h2>" +
      (body ? "<p>" + esc(body) + "</p>" : "") +
      (notice ? '<p class="notice">' + esc(notice) + "</p>" : "") +
      "<p><strong>" + esc(T("keepRef")) + "</strong> " + esc(REF) + "</p>" +
      (state === "sent" && TYPE === "employee" ? "<p>" + esc(T("cvWa")) + ' <span dir="ltr">+' + esc(CONTACT.whatsapp || "") + "</span></p>" : "") +
      '<div class="summary"><strong>' + esc(T("yourDetails")) + '</strong><dl style="margin-top:8px">' + rows + "</dl></div>" +
      '<div class="actions">' +
        '<a class="btn" href="' + wa + '" target="_blank" rel="noopener">' + esc(T("sendWa")) + "</a>" +
        '<a class="btn ghost" href="' + mail + '">' + esc(T("sendMail")) + "</a>" +
        '<button class="btn ghost" type="button" id="copyBtn">' + esc(T("copy")) + "</button>" +
        '<button class="btn ghost" type="button" id="againBtn">' + esc(T("newForm")) + "</button>" +
      "</div>" +
      '<p class="hint">' + esc(CONTACT.email || "") + ' · <span dir="ltr">+' + esc(CONTACT.whatsapp || "") + "</span></p>";

    form.hidden = true;
    successBox.hidden = false;
    document.getElementById("copyBtn").addEventListener("click", function (e) {
      var b = e.currentTarget;
      var done = function () { b.textContent = T("copied"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      else { fallbackCopy(text); done(); }
    });
    document.getElementById("againBtn").addEventListener("click", function () {
      form.reset(); REF = makeRef(); if (refEl) refEl.textContent = REF;
      successBox.hidden = true; form.hidden = false; lastState = null;
      updateConditions(); updateProgress();
      document.getElementById("ticket").scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("ticket").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.addEventListener("hb:langchange", function () {
    if (lastState && !successBox.hidden) renderSuccess(lastState);
    if (statusEl.textContent) statusEl.textContent = "";
  });

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    updateConditions();
    var bad = validateAll();
    if (bad) {
      statusEl.textContent = T("fixErrors");
      bad.scrollIntoView({ behavior: "smooth", block: "center" });
      var focusable = bad.querySelector("input, select, textarea");
      if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 350);
      return;
    }
    lastData = collect();
    var g = resolveGoogle();
    if (!g.ready) {
      if (CONFIG.debug) console.log("[Hbayebna] Google Form not configured for", TYPE, lastData);
      renderSuccess("notConfigured");
      return;
    }
    submitBtn.disabled = true;
    statusEl.textContent = T("sending");
    sendToGoogle(g, lastData)
      .then(function () { renderSuccess("sent"); })
      .catch(function (err) { console.warn("[Hbayebna] submit failed", err); renderSuccess("error"); })
      .finally(function () { submitBtn.disabled = false; statusEl.textContent = ""; });
  });

  updateConditions();
  updateProgress();
})();
