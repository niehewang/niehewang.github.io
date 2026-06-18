(function () {
  "use strict";

  const STORAGE_LANG = "hewang-homepage-lang-v3";
  const STORAGE_THEME = "hewang-homepage-theme-v3";
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
      pubCount: "显示 {shown} / {total} 篇"
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
      pubCount: "Showing {shown} / {total}"
    }
  };

  const $ = (id) => document.getElementById(id);

  function currentLang() {
    return (localStorage.getItem(STORAGE_LANG) || "zh") === "en" ? "en" : "zh";
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_THEME, next);
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
    localStorage.setItem(STORAGE_LANG, next);
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

  function filterPublications(section, term) {
    const query = normalizeText(term);
    const items = Array.from(section.querySelectorAll(".pub-item"));
    let shown = 0;
    items.forEach((item) => {
      const text = normalizeText(item.textContent);
      const visible = !query || text.includes(query);
      item.classList.toggle("hidden-by-filter", !visible);
      if (visible) shown += 1;
    });
    updatePublicationCount(section, shown, items.length);
  }

  function enhancePublicationSearch(section, lang) {
    if (!section || section.dataset.enhanced === "true") return;
    section.dataset.enhanced = "true";
    const note = section.querySelector(".pub-note") || section.querySelector("h3");
    if (!note) return;

    const tools = document.createElement("div");
    tools.className = "pub-tools";
    tools.innerHTML = [
      `<input class="pub-search" type="search" autocomplete="off" aria-label="${copy[lang].pubPlaceholder}" placeholder="${copy[lang].pubPlaceholder}">`,
      '<span class="pub-count"></span>'
    ].join("");
    note.insertAdjacentElement("afterend", tools);

    const input = tools.querySelector(".pub-search");
    input.addEventListener("input", () => filterPublications(section, input.value));
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
    const savedTheme = localStorage.getItem(STORAGE_THEME);
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
    setLang(localStorage.getItem(STORAGE_LANG) || "zh", { scroll: false });
    initReveal();
    initScrollTools();
    initExternalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
