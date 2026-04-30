/* =========================================================
   EXPERIA — Landing Page JS
   Controls: Scroll Reveal, Nav Glass, Active Section, Counters
   ========================================================= */

'use strict';

// ─── Scroll Reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll(
  '.executor-card, .comparison-row:not(.header), .pricing-card, .status-box, .manifesto-grid .text-content, .hero-content'
).forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 4 === 1) el.classList.add('reveal-delay-1');
  if (i % 4 === 2) el.classList.add('reveal-delay-2');
  if (i % 4 === 3) el.classList.add('reveal-delay-3');
  revealObserver.observe(el);
});

// ─── Sticky Nav Glassmorphism ───────────────────────────────
const nav = document.querySelector('.alpha-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Active Section Tracking ───────────────────────────────
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((s) => sectionObserver.observe(s));

// ─── Hero Badge Typing Effect ───────────────────────────────
const badge = document.querySelector('.badge');
if (badge) {
  const messages = ['SISTEMA KAIROX ONLINE', 'GOVERNANÇA ATIVA 24/7', 'SOBERANIA DIGITAL'];
  let mi = 0, ci = 0, deleting = false;

  function type() {
    const current = messages[mi];
    badge.textContent = deleting
      ? current.slice(0, ci--)
      : current.slice(0, ci++);

    if (!deleting && ci > current.length) {
      deleting = true;
      setTimeout(type, 2200);
      return;
    }
    if (deleting && ci < 0) {
      deleting = false;
      mi = (mi + 1) % messages.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, deleting ? 40 : 80);
  }
  type();
}

// ─── Counter Animation (Comparison Numbers) ─────────────────
function animateValue(el, start, end, duration, suffix = '') {
  let startTs = null;
  const step = (ts) => {
    if (!startTs) startTs = ts;
    const progress = Math.min((ts - startTs) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * (end - start) + start) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const end = parseInt(el.dataset.end, 10);
        const suffix = el.dataset.suffix || '';
        animateValue(el, 0, end, 1400, suffix);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-end]').forEach((el) => counterObserver.observe(el));

// ─── Calculator Logic ──────────────────────────────────────
const calcFunc = document.getElementById('calc-func');
const calcHoras = document.getElementById('calc-horas');
const calcTotal = document.getElementById('calc-total');

function updateCalculator() {
    if (!calcFunc || !calcHoras || !calcTotal) return;
    const f = parseInt(calcFunc.value) || 0;
    const h = parseInt(calcHoras.value) || 0;
    // Assuming Cost per hour effectively average R$ 20.
    const roi = f * h * 20; 
    calcTotal.textContent = `R$ ${roi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

if(calcFunc && calcHoras) {
    calcFunc.addEventListener('input', updateCalculator);
    calcHoras.addEventListener('input', updateCalculator);
    updateCalculator();
}

// ─── Grid Dot Parallax (subtle) ────────────────────────────
const overlay = document.querySelector('.matrix-overlay');
window.addEventListener('mousemove', (e) => {
  if (!overlay) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 12;
  const y = (e.clientY / window.innerHeight - 0.5) * 12;
  overlay.style.transform = `translate(${x}px, ${y}px)`;
}, { passive: true });
