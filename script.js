/* ==========================================================
   AL3M ENDRIX — script.js
   ========================================================== */

/* ---------- إعدادات قابلة للتعديل ----------
   الأرقام أدناه فارغة عمداً. اكتب أرقامك الحقيقية فقط عندما تريد إظهارها،
   وإذا تركتها كلها فارغة يختفي شريط الأرقام تلقائياً.
   مثال: { label: "مشترك", value: "10K" }
*/
const CONFIG = {
  stats: [
    { label: "مشترك على يوتيوب", value: "" },
    { label: "فيديو", value: "" },
    { label: "عضو في ديسكورد", value: "" }
  ],
  particleCount: 46 // قلّل الرقم لأداء أخف
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- شاشة التحميل ---------- */
(function loader() {
  const el = document.getElementById("loader");
  if (!el) return;
  const hide = () => el.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(hide, 350));
  setTimeout(hide, 2500); // احتياطي حتى لا تعلق الشاشة
})();

/* ---------- شريط الأرقام الاختياري ---------- */
(function stats() {
  const list = document.getElementById("stats");
  if (!list) return;
  const filled = CONFIG.stats.filter(s => String(s.value).trim() !== "");
  if (!filled.length) return;
  filled.forEach(s => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    const span = document.createElement("span");
    strong.textContent = s.value;
    span.textContent = s.label;
    li.append(strong, span);
    list.append(li);
  });
  list.hidden = false;
})();

/* ---------- السنة في الفوتر ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- القائمة والنافبار ---------- */
(function nav() {
  const header = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = open => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 820) setOpen(false); });

  // تمييز القسم الحالي
  const sections = [...links.querySelectorAll("a")].map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.querySelectorAll("a").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => io.observe(s));
  }
})();

/* ---------- ظهور العناصر عند التمرير ---------- */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach(i => i.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(i => io.observe(i));
})();

/* ---------- إمالة الأفاتار مع حركة الماوس ---------- */
(function tilt() {
  const avatar = document.getElementById("avatar");
  if (!avatar || reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
  const hero = avatar.closest(".hero");
  hero.addEventListener("pointermove", e => {
    const r = avatar.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    avatar.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  hero.addEventListener("pointerleave", () => { avatar.style.transform = ""; });
})();

/* ---------- جزيئات بنفسجية ---------- */
(function particles() {
  const canvas = document.getElementById("particles");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, parts = [], raf = null;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
  };

  const make = () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: (Math.random() * 1.6 + 0.4) * dpr,
    vx: (Math.random() - 0.5) * 0.25 * dpr,
    vy: (-Math.random() * 0.35 - 0.08) * dpr,
    a: Math.random() * 0.5 + 0.2
  });

  const init = () => {
    resize();
    const count = window.innerWidth < 700 ? Math.round(CONFIG.particleCount * 0.55) : CONFIG.particleCount;
    parts = Array.from({ length: count }, make);
  };

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(155, 53, 255, ${p.a})`;
      ctx.shadowColor = "#9B35FF";
      ctx.shadowBlur = 10 * dpr;
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = null; };

  init();
  start();
  window.addEventListener("resize", init);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();
