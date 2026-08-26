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

  const publicationBibtex = {
    "asynchronous random committee election for preprocessing in asynchronous distributed key generation": `@article{Shen2026AsynchronousCommittee,
  author = {Shen, Renfei and Lu, Zhi and Li, Hanqing and Li, Junming and Nie, Hewang and Lu, Songfeng},
  journal = {IEEE Transactions on Network Science and Engineering},
  title = {Asynchronous Random Committee Election for Preprocessing in Asynchronous Distributed Key Generation},
  year = {2026},
  pages = {1--24},
  doi = {10.1109/TNSE.2026.3718314},
  url = {https://doi.org/10.1109/TNSE.2026.3718314}
}`,
    "异步分布式密钥生成技术综述": `@article{Shen2026AsynchronousDKGReview,
  author = {Shen, Renfei and Li, Shuchang and Lu, Zhi and Li, Junming and Nie, Hewang and Lu, Songfeng},
  title = {异步分布式密钥生成技术综述},
  journal = {计算机科学与探索},
  year = {2026}
}`,
    "watermarking for model ownership verification: invisible at deployment, activated by updates": `@article{Nie2026WatermarkingOwnershipVerification,
  author = {Nie, Hewang and Xiao, Jue and Lu, Zhi and Shen, Renfei and Yu, Chunqiang and Tang, Zhenjun},
  title = {Watermarking for Model Ownership Verification: Invisible at Deployment, Activated by Updates},
  journal = {ACM Transactions on Privacy and Security},
  year = {2026},
  volume = {29},
  number = {3},
  pages = {1--28},
  publisher = {Association for Computing Machinery},
  doi = {10.1145/3817059},
  url = {https://doi.org/10.1145/3817059}
}`,
    "exclusive and updateable watermarking for neural network model trading": `@article{Nie2026UpdateableWatermarkingTrading,
  author = {Nie, Hewang and Yuan, Xuemei and Xiao, Jue},
  title = {Exclusive and Updateable Watermarking for Neural Network Model Trading},
  journal = {IEEE Transactions on Circuits and Systems for Video Technology},
  year = {2026},
  volume = {36},
  number = {5},
  pages = {6428--6442},
  publisher = {Institute of Electrical and Electronics Engineers},
  doi = {10.1109/TCSVT.2026.3651461},
  url = {https://doi.org/10.1109/TCSVT.2026.3651461}
}`,
    "delete but not gone: reactivation of neural network watermarks": `@article{Nie2026ReactivationWatermarks,
  author = {Nie, Hewang and Xiao, Jue and Lu, Zhi and Shen, Renfei and Lu, Songfeng},
  title = {Delete but Not Gone: Reactivation of Neural Network Watermarks},
  journal = {ACM Transactions on Intelligent Systems and Technology},
  year = {2026},
  volume = {17},
  number = {3},
  pages = {1--28},
  publisher = {Association for Computing Machinery},
  doi = {10.1145/3793678},
  url = {https://doi.org/10.1145/3793678}
}`,
    "零信任与零知识融合的匿名身份认证": `@article{Lu2026AnonymousIdentityAuthentication,
  author = {Lu, Zhi and Shen, Renfei and Nie, Hewang and Luo, Ting and Lu, Songfeng},
  title = {零信任与零知识融合的匿名身份认证},
  journal = {计算机学报},
  year = {2026},
  note = {Accepted for publication}
}`,
    "anonymous identity authentication combining zero-trust and zero-knowledge": `@article{Lu2026AnonymousIdentityAuthentication,
  author = {Lu, Zhi and Shen, Renfei and Nie, Hewang and Luo, Ting and Lu, Songfeng},
  title = {Anonymous Identity Authentication Combining Zero-Trust and Zero-Knowledge},
  journal = {Chinese Journal of Computers},
  year = {2026},
  note = {Accepted for publication}
}`,
    "compression is no barrier: dataset copyright protection with compression-resistant backdoor watermarks": `@article{Nie2025CompressionResistantBackdoor,
  author = {Nie, Hewang and Yuan, Xuemei},
  title = {Compression Is No Barrier: Dataset Copyright Protection with Compression-Resistant Backdoor Watermarks},
  journal = {Information Processing \\& Management},
  year = {2025},
  volume = {62},
  number = {6},
  pages = {104260},
  publisher = {Elsevier},
  doi = {10.1016/j.ipm.2025.104260},
  url = {https://doi.org/10.1016/j.ipm.2025.104260}
}`,
    "beyond protection: unveiling neural network copyright trading": `@article{Yuan2025CopyrightTrading,
  author = {Yuan, Xuemei and Nie, Hewang},
  title = {Beyond Protection: Unveiling Neural Network Copyright Trading},
  journal = {Knowledge-Based Systems},
  year = {2025},
  volume = {320},
  pages = {113617},
  publisher = {Elsevier},
  doi = {10.1016/j.knosys.2025.113617},
  url = {https://doi.org/10.1016/j.knosys.2025.113617}
}`,
    "secure industrial federated learning: label encryption for model protection": `@article{Yuan2025SecureIndustrialFederatedLearning,
  author = {Yuan, Xuemei and Nie, Hewang},
  title = {Secure Industrial Federated Learning: Label Encryption for Model Protection},
  journal = {Engineering Applications of Artificial Intelligence},
  year = {2025},
  volume = {160},
  pages = {111806},
  publisher = {Elsevier},
  doi = {10.1016/j.engappai.2025.111806},
  url = {https://doi.org/10.1016/j.engappai.2025.111806}
}`,
    "federated learning with bilateral defense via blockchain": `@article{Xiao2025BilateralDefenseBlockchain,
  author = {Xiao, Jue and Nie, Hewang and Yi, Zepu and Tang, Xueming and Lu, Songfeng},
  title = {Federated Learning with Bilateral Defense via Blockchain},
  journal = {Neural Networks},
  year = {2025},
  volume = {185},
  pages = {107199},
  publisher = {Elsevier},
  doi = {10.1016/j.neunet.2025.107199},
  url = {https://doi.org/10.1016/j.neunet.2025.107199}
}`,
    "deep model intellectual property protection with compression-resistant model watermarking": `@article{Nie2024DeepModelIPProtection,
  author = {Nie, Hewang and Lu, Songfeng and Wu, Junjun and Zhu, Jianxin},
  title = {Deep Model Intellectual Property Protection With Compression-Resistant Model Watermarking},
  journal = {IEEE Transactions on Artificial Intelligence},
  year = {2024},
  volume = {5},
  number = {7},
  pages = {3362--3373},
  publisher = {Institute of Electrical and Electronics Engineers},
  doi = {10.1109/TAI.2024.3351116},
  url = {https://doi.org/10.1109/TAI.2024.3351116}
}`,
    "persistverify: federated model ownership verification with spatial attention and boundary sampling": `@article{Nie2024PersistVerify,
  author = {Nie, Hewang and Lu, Songfeng},
  title = {PersistVerify: Federated Model Ownership Verification with Spatial Attention and Boundary Sampling},
  journal = {Knowledge-Based Systems},
  year = {2024},
  volume = {293},
  pages = {111675},
  publisher = {Elsevier},
  doi = {10.1016/j.knosys.2024.111675},
  url = {https://doi.org/10.1016/j.knosys.2024.111675}
}`,
    "fedcrmw: federated model ownership verification with compression-resistant model watermarking": `@article{Nie2024FedCRMW,
  author = {Nie, Hewang and Lu, Songfeng},
  title = {FedCRMW: Federated Model Ownership Verification with Compression-Resistant Model Watermarking},
  journal = {Expert Systems with Applications},
  year = {2024},
  volume = {249},
  pages = {123776},
  publisher = {Elsevier},
  doi = {10.1016/j.eswa.2024.123776},
  url = {https://doi.org/10.1016/j.eswa.2024.123776}
}`,
    "securing ip in edge ai: neural network watermarking for multimodal models": `@article{Nie2024EdgeAIMultimodalWatermarking,
  author = {Nie, Hewang and Lu, Songfeng},
  title = {Securing IP in Edge AI: Neural Network Watermarking for Multimodal Models},
  journal = {Applied Intelligence},
  year = {2024},
  volume = {54},
  number = {21},
  pages = {10455--10472},
  publisher = {Springer},
  doi = {10.1007/s10489-024-05746-x},
  url = {https://doi.org/10.1007/s10489-024-05746-x}
}`,
    "color image reversible data hiding with double-layer embedding": `@article{Tang2020ColorImageReversibleDataHiding,
  author = {Tang, Zhenjun and Nie, Hewang and Pun, Chi-Man and Yao, Heng and Yu, Chunqiang and Zhang, Xianquan},
  title = {Color Image Reversible Data Hiding With Double-Layer Embedding},
  journal = {IEEE Access},
  year = {2020},
  volume = {8},
  pages = {6915--6926},
  publisher = {Institute of Electrical and Electronics Engineers},
  doi = {10.1109/ACCESS.2020.2964264},
  url = {https://doi.org/10.1109/ACCESS.2020.2964264}
}`,
    "optimized dynamic watermarking for audio dnns with adaptive embedding and boundary sampling": `@inproceedings{Fei2025OptimizedAudioWatermarking,
  author = {Fei, Hao and Nie, Hewang and Sun, Siqi and Lu, Songfeng and Luo, Ting and Qian, Ling and Cai, Dunbo and Huang, Zhiguo and Zhang, Runqing},
  title = {Optimized Dynamic Watermarking for Audio DNNs with Adaptive Embedding and Boundary Sampling},
  booktitle = {ICASSP 2025 - 2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)},
  year = {2025},
  pages = {1--5},
  publisher = {IEEE},
  doi = {10.1109/ICASSP49660.2025.10890586},
  url = {https://doi.org/10.1109/ICASSP49660.2025.10890586}
}`,
    "feddit: federated learning by distillation token enhanced vision transformer": `@inproceedings{Xiao2025FedDiT,
  author = {Xiao, Jue and Yi, Zepu and Nie, Hewang and Lu, Zhi and Tang, Xueming and Lu, Songfeng and Huang, Zhiguo and Zhang, Runqing},
  title = {FedDiT: Federated Learning by Distillation Token Enhanced Vision Transformer},
  booktitle = {ICASSP 2025 - 2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)},
  year = {2025},
  pages = {1--5},
  publisher = {IEEE},
  doi = {10.1109/ICASSP49660.2025.10890584},
  url = {https://doi.org/10.1109/ICASSP49660.2025.10890584}
}`,
    "vsda: privacy-preserving verifiable secure distributed aggregation for multi-center clinical and genomic data": `@inproceedings{Dong2025VSDA,
  author = {Dong, Zhe and Lu, Zhi and Shen, Renfei and Nie, Hewang and Xiao, Jue and Li, Junming and Lu, Songfeng},
  title = {VSDA: Privacy-Preserving Verifiable Secure Distributed Aggregation for Multi-Center Clinical and Genomic Data},
  booktitle = {2025 IEEE International Conference on Bioinformatics and Biomedicine (BIBM)},
  year = {2025},
  pages = {1629--1634},
  publisher = {IEEE},
  doi = {10.1109/BIBM66473.2025.11356860},
  url = {https://doi.org/10.1109/BIBM66473.2025.11356860}
}`,
    "verichroma: ownership verification for federated models via rgb filters": `@inbook{Nie2024VeriChroma,
  author = {Nie, Hewang and Lu, Songfeng and Wang, Mu and Xiao, Jue and Lu, Zhi and Yi, Zepu},
  title = {VeriChroma: Ownership Verification for Federated Models via RGB Filters},
  booktitle = {Euro-Par 2024: Parallel Processing},
  year = {2024},
  pages = {332--345},
  publisher = {Springer Nature Switzerland},
  isbn = {9783031697661},
  doi = {10.1007/978-3-031-69766-1_23},
  url = {https://doi.org/10.1007/978-3-031-69766-1_23}
}`,
    "lightweight byzantine-robust and privacy-preserving federated learning": `@inbook{Lu2024LightweightByzantineRobustFL,
  author = {Lu, Zhi and Lu, Songfeng and Cui, Yongquan and Wu, Junjun and Nie, Hewang and Xiao, Jue and Yi, Zepu},
  title = {Lightweight Byzantine-Robust and Privacy-Preserving Federated Learning},
  booktitle = {Euro-Par 2024: Parallel Processing},
  year = {2024},
  pages = {274--287},
  publisher = {Springer Nature Switzerland},
  isbn = {9783031697661},
  doi = {10.1007/978-3-031-69766-1_19},
  url = {https://doi.org/10.1007/978-3-031-69766-1_19}
}`
  };

  function getPublicationCitation(item) {
    const title = normalizeText(item.querySelector(".pub-title")?.textContent || "");
    return publicationBibtex[title] || "";
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
