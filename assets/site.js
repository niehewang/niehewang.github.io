(function () {
  "use strict";

  const STORAGE_LANG = "hewang-homepage-lang-v3";
  const STORAGE_THEME = "hewang-homepage-theme-v3";
  const STORAGE_PUB_FILTER = "hewang-homepage-pub-filter-v1";
  const STORAGE_PUB_YEAR = "hewang-homepage-pub-year-v1";
  const pairs = [
    ["hero-zh", "hero-en"],
    ["content-zh", "content-en"],
    ["contact-zh", "contact-en"],
    ["tags-zh", "tags-en"],
    ["nav-zh", "nav-en"]
  ];
  const copy = {
    zh: {
      title: "个人主页 | 聂何望 (Hewang Nie)",
      htmlLang: "zh-CN",
      contact: "联系方式",
      tag: "研究方向",
      nav: "页面导航",
      dark: "深色",
      light: "浅色",
      pubPlaceholder: "检索论文题目、期刊会议或作者",
      pubCount: "显示 {shown} / {total} 篇",
      allYears: "全部年份",
      allLevels: "全部级别",
      copyBib: "复制引用",
      copied: "已复制",
      copyFailed: "复制失败，请手动复制",
      resetFilters: "重置"
    },
    en: {
      title: "Homepage | Hewang Nie",
      htmlLang: "en",
      contact: "Contact",
      tag: "Research",
      nav: "Navigation",
      dark: "Dark",
      light: "Light",
      pubPlaceholder: "Search title, venue, or author",
      pubCount: "Showing {shown} / {total}",
      allYears: "All years",
      allLevels: "All levels",
      copyBib: "Copy citation",
      copied: "Copied",
      copyFailed: "Copy failed; copy manually",
      resetFilters: "Reset"
    }
  };

  const $ = (id) => document.getElementById(id);

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      // Storage can be disabled in private browsing; the page still works without persistence.
    }
  }

  function currentLang() {
    return (safeGet(STORAGE_LANG) || "zh") === "en" ? "en" : "zh";
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    safeSet(STORAGE_THEME, next);
    updateThemeButton();
  }

  function updateThemeButton() {
    const btn = $("theme-toggle");
    if (!btn) return;
    const lang = currentLang();
    const isDark = currentTheme() === "dark";
    btn.textContent = isDark ? copy[lang].light : copy[lang].dark;
    btn.setAttribute("aria-label", btn.textContent);
    btn.setAttribute("aria-pressed", String(isDark));
    btn.dataset.active = String(isDark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#111318" : "#f5f7f9");
  }

  function setLang(lang, opts) {
    const next = lang === "en" ? "en" : "zh";
    pairs.forEach(([zh, en]) => {
      const z = $(zh);
      const e = $(en);
      if (z) {
        z.hidden = next !== "zh";
        z.style.display = next === "zh" ? "" : "none";
      }
      if (e) {
        e.hidden = next !== "en";
        e.style.display = next === "en" ? "" : "none";
      }
    });

    const btnZh = $("btn-zh");
    const btnEn = $("btn-en");
    if (btnZh) {
      btnZh.classList.toggle("active", next === "zh");
      btnZh.setAttribute("aria-pressed", String(next === "zh"));
    }
    if (btnEn) {
      btnEn.classList.toggle("active", next === "en");
      btnEn.setAttribute("aria-pressed", String(next === "en"));
    }

    document.documentElement.lang = copy[next].htmlLang;
    document.title = copy[next].title;
    const sideContact = $("side-contact-title");
    const sideTag = $("side-tag-title");
    const sideNav = $("side-nav-title");
    if (sideContact) sideContact.textContent = copy[next].contact;
    if (sideTag) sideTag.textContent = copy[next].tag;
    if (sideNav) sideNav.textContent = copy[next].nav;
    const skip = document.querySelector(".skip-link");
    if (skip) {
      skip.href = next === "en" ? "#content-en" : "#content-zh";
      skip.textContent = next === "en" ? "Skip to content" : "跳到正文";
    }
    document.querySelectorAll("[data-zh][data-en]").forEach((el) => {
      el.textContent = el.getAttribute("data-" + next);
    });
    safeSet(STORAGE_LANG, next);
    updateThemeButton();
    bindActiveNav();
    updatePublicationToolsLanguage();
    if (!opts || opts.scroll !== false) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindActiveNav() {
    const lang = currentLang();
    const nav = $(lang === "zh" ? "nav-zh" : "nav-en");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll(".nav-link"));
    const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (window.__hewangNavObserver) window.__hewangNavObserver.disconnect();
    if (!("IntersectionObserver" in window) || !sections.length) return;

    window.__hewangNavObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + visible.target.id));
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [.01, .08, .16, .32] });
    sections.forEach((section) => window.__hewangNavObserver.observe(section));
  }

  function initEmailLinks() {
    const makeEmail = (value) => String(value || "")
      .split(",")
      .map((n) => String.fromCharCode(Number(n)))
      .join("");

    document.querySelectorAll(".js-email").forEach((el) => {
      const email = makeEmail(el.getAttribute("data-email"));
      if (!email) return;
      el.href = "mailto:" + email;
      el.setAttribute("aria-label", email);
      el.setAttribute("title", email);
      el.dataset.copyText = email;
      const user = el.querySelector(".email-user");
      const at = el.querySelector(".email-at");
      const domain = el.querySelector(".email-domain");
      const atIndex = email.indexOf("@");
      if (user && at && domain && atIndex > 0) {
        user.textContent = email.slice(0, atIndex);
        at.textContent = "@";
        domain.textContent = email.slice(atIndex + 1);
      }
    });
  }

  function showToast(message) {
    let toast = $("site-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "site-toast";
      toast.className = "site-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(window.__hewangToastTimer);
    window.__hewangToastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1600);
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // Fallback below.
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    textarea.remove();
    return ok;
  }

  function initReveal() {
    const targets = document.querySelectorAll("section,.side-card,.stat,.pub-item,.service-card,.project-card,.mini-card,.callout,.tool-card");
    targets.forEach((el) => el.classList.add("reveal"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .06, rootMargin: "0px 0px -4% 0px" });
    targets.forEach((el) => io.observe(el));
  }

  function initScrollTools() {
    if (!document.querySelector(".scroll-progress")) {
      const progress = document.createElement("div");
      progress.className = "scroll-progress";
      progress.setAttribute("aria-hidden", "true");
      document.body.prepend(progress);
    }

    if (!$("back-to-top")) {
      const btn = document.createElement("button");
      btn.id = "back-to-top";
      btn.className = "back-to-top";
      btn.type = "button";
      btn.textContent = "↑";
      btn.setAttribute("aria-label", "Back to top");
      document.body.appendChild(btn);
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    const progress = document.querySelector(".scroll-progress");
    const topBtn = $("back-to-top");
    const update = () => {
      const st = window.scrollY || document.documentElement.scrollTop;
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progress) progress.style.width = Math.min(100, Math.max(0, st / h * 100)) + "%";
      if (topBtn) topBtn.classList.toggle("visible", st > 520);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function updatePublicationCount(section, shown, total) {
    const count = section.querySelector(".pub-count");
    if (!count) return;
    const lang = section.id.endsWith("-en") ? "en" : "zh";
    count.textContent = copy[lang].pubCount
      .replace("{shown}", String(shown))
      .replace("{total}", String(total));
  }

  function getPublicationYear(item) {
    let node = item.closest(".pub-list")?.previousElementSibling;
    while (node) {
      if (node.tagName === "H4") {
        const match = node.textContent.match(/\b(20\d{2})\b/);
        return match ? match[1] : "";
      }
      node = node.previousElementSibling;
    }
    return "";
  }

  function getPublicationLevel(item) {
    const text = normalizeText(item.textContent);
    const levels = [];
    if (text.includes("ccf a") || text.includes("ccf a类") || text.includes("ccf-a")) levels.push("ccf-a");
    if (text.includes("ccf b") || text.includes("ccf b类") || text.includes("ccf-b")) levels.push("ccf-b");
    if (text.includes("sci q1") || text.includes("sci一区")) levels.push("sci-q1");
    if (text.includes("top")) levels.push("top");
    return levels.join(" ");
  }

  function getPublicationCitation(item) {
    const title = item.querySelector(".pub-title")?.textContent.trim() || "";
    const meta = Array.from(item.querySelectorAll(".pub-meta"))
      .map((el) => el.textContent.replace(/\s+/g, " ").trim())
      .join(" ");
    return [title, meta].filter(Boolean).join(". ");
  }

  function filterPublications(section, term) {
    const query = normalizeText(term);
    const tools = section.querySelector(".pub-tools");
    const year = tools?.querySelector(".pub-year")?.value || "all";
    const level = tools?.querySelector(".pub-level")?.value || "all";
    const items = Array.from(section.querySelectorAll(".pub-item"));
    let shown = 0;
    items.forEach((item) => {
      const text = normalizeText(item.textContent);
      const matchesQuery = !query || text.includes(query);
      const matchesYear = year === "all" || item.dataset.year === year;
      const itemLevels = String(item.dataset.level || "").split(/\s+/);
      const matchesLevel = level === "all" || itemLevels.includes(level) || text.includes(level.replace("-", " "));
      const visible = matchesQuery && matchesYear && matchesLevel;
      item.classList.toggle("hidden-by-filter", !visible);
      if (visible) shown += 1;
    });
    section.querySelectorAll("h4").forEach((heading) => {
      const list = heading.nextElementSibling;
      if (!list || !list.classList.contains("pub-list")) return;
      const hasVisible = Array.from(list.querySelectorAll(".pub-item"))
        .some((item) => !item.classList.contains("hidden-by-filter"));
      heading.classList.toggle("hidden-by-filter", !hasVisible);
    });
    updatePublicationCount(section, shown, items.length);
  }

  function buildYearOptions(section, lang) {
    const years = Array.from(new Set(Array.from(section.querySelectorAll(".pub-item"))
      .map((item) => item.dataset.year)
      .filter(Boolean))).sort((a, b) => Number(b) - Number(a));
    return [`<option value="all">${copy[lang].allYears}</option>`]
      .concat(years.map((year) => `<option value="${year}">${year}</option>`))
      .join("");
  }

  function enhancePublicationSearch(section, lang) {
    if (!section || section.dataset.enhanced === "true") return;
    section.dataset.enhanced = "true";
    section.querySelectorAll(".pub-item").forEach((item) => {
      item.dataset.year = getPublicationYear(item);
      item.dataset.level = getPublicationLevel(item);
    });
    const note = section.querySelector(".pub-note") || section.querySelector("h3");
    if (!note) return;

    const tools = document.createElement("div");
    tools.className = "pub-tools";
    tools.innerHTML = [
      `<input class="pub-search" type="search" autocomplete="off" aria-label="${copy[lang].pubPlaceholder}" placeholder="${copy[lang].pubPlaceholder}">`,
      `<select class="pub-filter pub-year" aria-label="${copy[lang].allYears}">${buildYearOptions(section, lang)}</select>`,
      `<select class="pub-filter pub-level" aria-label="${copy[lang].allLevels}">
        <option value="all">${copy[lang].allLevels}</option>
        <option value="ccf-a">CCF A</option>
        <option value="ccf-b">CCF B</option>
        <option value="sci-q1">SCI Q1</option>
        <option value="top">TOP</option>
      </select>`,
      `<button class="pub-reset" type="button">${copy[lang].resetFilters}</button>`,
      '<span class="pub-count"></span>'
    ].join("");
    note.insertAdjacentElement("afterend", tools);

    const input = tools.querySelector(".pub-search");
    const year = tools.querySelector(".pub-year");
    const level = tools.querySelector(".pub-level");
    const reset = tools.querySelector(".pub-reset");
    year.value = safeGet(STORAGE_PUB_YEAR) || "all";
    level.value = safeGet(STORAGE_PUB_FILTER) || "all";
    input.addEventListener("input", () => filterPublications(section, input.value));
    year.addEventListener("change", () => {
      safeSet(STORAGE_PUB_YEAR, year.value);
      filterPublications(section, input.value);
    });
    level.addEventListener("change", () => {
      safeSet(STORAGE_PUB_FILTER, level.value);
      filterPublications(section, input.value);
    });
    reset.addEventListener("click", () => {
      input.value = "";
      year.value = "all";
      level.value = "all";
      safeSet(STORAGE_PUB_YEAR, "all");
      safeSet(STORAGE_PUB_FILTER, "all");
      filterPublications(section, "");
      input.focus();
    });
    section.querySelectorAll(".pub-item").forEach((item) => {
      if (item.querySelector(".pub-copy")) return;
      const meta = item.querySelector(".pub-meta");
      if (!meta) return;
      const btn = document.createElement("button");
      btn.className = "pub-copy";
      btn.type = "button";
      btn.textContent = copy[lang].copyBib;
      btn.dataset.citation = getPublicationCitation(item);
      meta.appendChild(btn);
    });
    filterPublications(section, "");
  }

  function updatePublicationToolsLanguage() {
    document.querySelectorAll(".pub-tools").forEach((tools) => {
      const section = tools.closest("section");
      if (!section) return;
      const lang = section.id.endsWith("-en") ? "en" : "zh";
      const input = tools.querySelector(".pub-search");
      if (input) {
        input.placeholder = copy[lang].pubPlaceholder;
        input.setAttribute("aria-label", copy[lang].pubPlaceholder);
      }
      const year = tools.querySelector(".pub-year");
      if (year) {
        year.setAttribute("aria-label", copy[lang].allYears);
        const all = year.querySelector('option[value="all"]');
        if (all) all.textContent = copy[lang].allYears;
      }
      const level = tools.querySelector(".pub-level");
      if (level) {
        level.setAttribute("aria-label", copy[lang].allLevels);
        const all = level.querySelector('option[value="all"]');
        if (all) all.textContent = copy[lang].allLevels;
      }
      const reset = tools.querySelector(".pub-reset");
      if (reset) reset.textContent = copy[lang].resetFilters;
      section.querySelectorAll(".pub-copy").forEach((btn) => {
        btn.textContent = copy[lang].copyBib;
      });
      filterPublications(section, input ? input.value : "");
    });
  }

  function initPublicationSearch() {
    enhancePublicationSearch($("publications-zh"), "zh");
    enhancePublicationSearch($("publications-en"), "en");
  }

  function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set(String(link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", Array.from(rel).join(" "));
    });
  }

  function initCopyActions() {
    document.addEventListener("click", async (event) => {
      const pubCopy = event.target.closest(".pub-copy");
      if (pubCopy) {
        const lang = currentLang();
        const ok = await copyText(pubCopy.dataset.citation || "");
        showToast(ok ? copy[lang].copied : copy[lang].copyFailed);
        return;
      }

      const email = event.target.closest(".js-email");
      if (email && (event.altKey || event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const lang = currentLang();
        const ok = await copyText(email.dataset.copyText || email.textContent.trim());
        showToast(ok ? copy[lang].copied : copy[lang].copyFailed);
      }
    });
  }

  function initShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
      if (event.key === "/") {
        const section = currentLang() === "en" ? $("publications-en") : $("publications-zh");
        const input = section?.querySelector(".pub-search");
        if (input) {
          event.preventDefault();
          input.focus();
        }
      }
      if (event.key.toLowerCase() === "t") {
        const themeBtn = $("theme-toggle");
        if (themeBtn) {
          event.preventDefault();
          themeBtn.click();
        }
      }
    });
  }

  function initPhotoFallback() {
    const img = $("profile-photo");
    if (!img) return;
    img.addEventListener("error", () => {
      img.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent([
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560">',
        '<rect width="420" height="560" rx="8" fill="#f5f7f9"/>',
        '<circle cx="210" cy="168" r="76" fill="#d9dee7"/>',
        '<path d="M84 505c18-132 96-195 126-195s108 63 126 195" fill="#172033"/>',
        '<text x="210" y="512" text-anchor="middle" font-size="26" font-family="Arial" font-weight="700" fill="#172033">Hewang Nie</text>',
        '</svg>'
      ].join(""));
    }, { once: true });
  }

  function init() {
    const savedTheme = safeGet(STORAGE_THEME);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(savedTheme || (prefersDark ? "dark" : "light"));

    const themeBtn = $("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark"));
    const zh = $("btn-zh");
    const en = $("btn-en");
    if (zh) zh.addEventListener("click", (e) => {
      e.preventDefault();
      setLang("zh");
    });
    if (en) en.addEventListener("click", (e) => {
      e.preventDefault();
      setLang("en");
    });

    window.setLang = setLang;
    window.toggleTheme = () => setTheme(currentTheme() === "dark" ? "light" : "dark");
    initEmailLinks();
    initPhotoFallback();
    initPublicationSearch();
    setLang(safeGet(STORAGE_LANG) || "zh", { scroll: false });
    initReveal();
    initScrollTools();
    initCopyActions();
    initShortcuts();
    initExternalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
