/* ============================================================
   CONFIG — edit everything here. No need to touch layout code.
   ============================================================ */
const CONFIG = {
  name: "Anurag Patole",
  tagline: "I manage cloud infrastructure by day and ship AI products by night.",

  stats: [
    { value: 3, suffix: "", label: "AI products shipped" },
    { value: 8, suffix: "+", label: "enterprise clients managed" },
    { value: 3, suffix: "", label: "data centres" },
    { value: 1, suffix: "", label: "published book" },
  ],

  products: [
    {
      name: "mYsAathi.ai",
      problem: "An AI assistant that helps Indian families navigate arranged-marriage decisions with clarity instead of gut-feel.",
      stack: ["HTML/CSS/JS", "Netlify Functions", "Supabase Auth", "Claude API"],
      link: "https://mysaathi.online",
    },
    {
      name: "Kumbh Acharya",
      problem: "An AI spiritual counsellor PWA guiding Sinhastha Kumbh Mela pilgrims in 5 languages.",
      stack: ["React 18", "Vite", "Claude API", "PWA"],
      link: "https://kumbh-acharya.vercel.app",
    },
    {
      name: "PM Toolkit",
      problem: "A SaaS that generates project management documents — Project Charter, Risk Register, RAID Log, Status Report and more — from standard templates.",
      stack: ["HTML/CSS/JS", "Supabase", "Razorpay", "docxtemplater", "Claude API"],
      link: "#",
    },
  ],

  caseStudies: [
    {
      title: "Smart City DR Infrastructure",
      desc: "Disaster recovery governance and standard operating procedures for large-scale smart city cloud workloads.",
    },
    {
      title: "Power Sector Cloud Delivery",
      desc: "Escalation management and root-cause analysis for mission-critical power sector infrastructure delivery.",
    },
    {
      title: "BFSI & Regulated Workloads",
      desc: "Risk registers and compliance documentation for banking, financial services and other regulated cloud workloads.",
    },
  ],

  timeline: [
    { role: "Senior Project Management Associate", company: "ESDS Software Solutions", meta: "Nashik · Current" },
    { role: "Project Co-ordinator, Technical", company: "Winjit Technologies", meta: "2021 – 2023" },
    { role: "Earlier roles", company: "Aress Software · Eluminous Technologies · Mphasis", meta: "Prior experience" },
  ],

  books: [
    {
      title: "Samundar Chup Raha",
      subtitle: "Kindle · Hinglish Mumbai crime thriller",
      author: "by Anurag Patole",
      description: "A Mumbai crime thriller written in Hinglish — available on Kindle.",
      link: "#",
    },
    {
      title: "Wo Ruki Rahi",
      subtitle: "Hindi Upanyaas",
      author: "by Anurag Patole",
      description: "",
      link: "#",
    },
    {
      title: "Swapnawanshi",
      subtitle: "Ek Hindi Upanyaas",
      author: "by Anurag Patole",
      description: "",
      link: "#",
    },
    {
      title: "Agli Manzil Ki Taraf",
      subtitle: "Hindi Upanyaas",
      author: "by Anurag Patole",
      description: "",
      link: "#",
    },
  ],

  contact: {
    linkedin: "https://www.linkedin.com/in/anurag-r-98518aa2/",
    github: "https://github.com/apatole98",
    email: "apatole98@gmail.com",
  },
};

/* ============================================================
   State
   ============================================================ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

/* ============================================================
   Content rendering
   ============================================================ */
function renderHeroTitle() {
  const el = document.getElementById("heroTitle");
  const text = CONFIG.name;
  el.innerHTML = "";
  text.split(" ").forEach((word, i, arr) => {
    const wrap = document.createElement("span");
    wrap.className = "word";
    const inner = document.createElement("span");
    inner.textContent = word + (i < arr.length - 1 ? " " : "");
    wrap.appendChild(inner);
    el.appendChild(wrap);
  });
}

function renderTagline() {
  const el = document.querySelector(".hero-tagline");
  el.textContent = CONFIG.tagline;
}

function renderStats() {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = CONFIG.stats
    .map(
      (s) => `
    <div class="stat-item">
      <div class="stat-number" data-value="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
    )
    .join("");
}

function renderProducts() {
  const track = document.getElementById("productsTrack");
  track.innerHTML = CONFIG.products
    .map(
      (p, i) => `
    <article class="product-card glass-card reveal-up" data-tilt>
      <span class="product-index">0${i + 1}</span>
      <h3>${p.name}</h3>
      <p class="product-problem">${p.problem}</p>
      <div class="product-chips">
        ${p.stack.map((s) => `<span class="chip">${s}</span>`).join("")}
      </div>
      <a class="product-link" href="${p.link}" target="_blank" rel="noopener noreferrer">Live ↗</a>
    </article>`
    )
    .join("");
}

function renderCaseStudies() {
  const grid = document.getElementById("caseGrid");
  grid.innerHTML = CONFIG.caseStudies
    .map(
      (c) => `
    <div class="case-card glass-card reveal-up">
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
    </div>`
    )
    .join("");
}

function renderTimeline() {
  const el = document.getElementById("timeline");
  el.innerHTML = CONFIG.timeline
    .map(
      (t) => `
    <div class="timeline-item reveal-up">
      <div class="timeline-role">${t.role}</div>
      <div class="timeline-meta">${t.company} — ${t.meta}</div>
    </div>`
    )
    .join("");
}

function renderWriting() {
  const el = document.getElementById("writingGrid");
  el.innerHTML = CONFIG.books
    .map(
      (w) => `
    <div class="writing-card glass-card reveal-up">
      <div class="writing-cover">${w.title}</div>
      <div class="writing-body">
        <h3>${w.title}</h3>
        <p class="writing-meta">${w.subtitle} · ${w.author}</p>
        ${w.description ? `<p>${w.description}</p>` : ""}
        <a class="btn btn-ghost" href="${w.link}" target="_blank" rel="noopener noreferrer">View on Amazon</a>
      </div>
    </div>`
    )
    .join("");
}

function renderContact() {
  const el = document.getElementById("contactActions");
  const c = CONFIG.contact;
  el.innerHTML = `
    <a class="contact-btn" href="${c.linkedin}" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
    <a class="contact-btn" href="${c.github}" target="_blank" rel="noopener noreferrer">🐙 GitHub</a>
    <a class="contact-btn" href="mailto:${c.email}">✉️ Email</a>`;
}

/* ============================================================
   Loader
   ============================================================ */
function runLoader() {
  const loader = document.getElementById("loader");
  const done = () => {
    loader.style.transition = "opacity .5s ease, visibility .5s ease";
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    document.body.classList.add("loaded");
    startHeroReveal();
  };
  window.setTimeout(done, prefersReducedMotion ? 0 : 1200);
}

/* ============================================================
   Custom cursor
   ============================================================ */
function initCursor() {
  if (isTouch) return;
  document.body.classList.add("has-cursor");
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let dx = 0, dy = 0, rx = 0, ry = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      dx = e.clientX;
      dy = e.clientY;
      dot.style.left = dx + "px";
      dot.style.top = dy + "px";
    },
    { passive: true }
  );

  function raf() {
    rx += (dx - rx) * 0.18;
    ry += (dy - ry) * 0.18;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(raf);
  }
  raf();

  document.querySelectorAll("a, button, [data-tilt]").forEach((elm) => {
    elm.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    elm.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });
}

/* ============================================================
   Scroll progress bar
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  function update() {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
    if (window.HeroScene && window.HeroScene.setScrollProgress) {
      const heroHeight = window.innerHeight;
      const t = Math.min(Math.max(scrollTop / heroHeight, 0), 1);
      window.HeroScene.setScrollProgress(t);
    }
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ============================================================
   Smooth in-page scroll for [data-scroll] links
   ============================================================ */
function initSmoothLinks() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.charAt(0) !== "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}

/* ============================================================
   Hero reveal (split-text stagger)
   ============================================================ */
function startHeroReveal() {
  if (typeof gsap === "undefined") {
    document.querySelectorAll(".reveal-fade, .reveal-up").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  if (prefersReducedMotion) {
    gsap.set(".hero-title .word > span, .reveal-fade", { opacity: 1, y: 0 });
    return;
  }

  tl.fromTo(
    ".hero-title .word > span",
    { yPercent: 120, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 }
  ).fromTo(
    ".hero-eyebrow, .hero-tagline, .hero-actions",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
    "-=0.5"
  );
}

/* ============================================================
   Animated stat counters
   ============================================================ */
function initCounters() {
  const items = document.querySelectorAll(".stat-number");
  if (!items.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.value);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion || typeof gsap === "undefined") {
      el.textContent = target + suffix;
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(obj.val) + suffix;
      },
    });
  };

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    items.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => animate(el),
      });
    });
  } else {
    items.forEach(animate);
  }
}

/* ============================================================
   ScrollTrigger reveals for sections
   ============================================================ */
function initScrollReveals() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const groups = [
    [".about-bio", ".about-glass"],
    [".case-card"],
    [".timeline-item"],
    [".writing-card"],
    [".contact-actions"],
  ];

  document.querySelectorAll(".section-tag, .section-title").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });

  groups.forEach((selectors) => {
    selectors.forEach((sel) => {
      const els = document.querySelectorAll(sel);
      if (!els.length) return;
      gsap.fromTo(
        els,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: els[0].closest(".section") || els[0], start: "top 82%" },
        }
      );
    });
  });
}

/* ============================================================
   Product cards: 3D tilt on hover + pinned horizontal scroll (desktop)
   ============================================================ */
function initProductTilt() {
  if (isTouch || typeof gsap === "undefined") return;
  document.querySelectorAll(".product-card").forEach((card) => {
    const bounds = () => card.getBoundingClientRect();
    card.addEventListener("mousemove", (e) => {
      const b = bounds();
      const px = (e.clientX - b.left) / b.width - 0.5;
      const py = (e.clientY - b.top) / b.height - 0.5;
      gsap.to(card, {
        rotateY: px * 14,
        rotateX: -py * 14,
        transformPerspective: 700,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    });
  });
}

function initProductsHorizontalScroll() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.matchMedia().add("(min-width: 861px)", () => {
    const track = document.getElementById("productsTrack");
    const wrap = document.getElementById("productsTrackWrap");
    if (!track || !wrap) return;

    const getScrollAmount = () => track.scrollWidth - wrap.clientWidth;

    const tween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top+=80",
        end: () => "+=" + getScrollAmount(),
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderHeroTitle();
  renderTagline();
  renderStats();
  renderProducts();
  renderCaseStudies();
  renderTimeline();
  renderWriting();
  renderContact();

  initCursor();
  initScrollProgress();
  initSmoothLinks();
  initCounters();
  initScrollReveals();
  initProductTilt();
  initProductsHorizontalScroll();

  runLoader();
});
