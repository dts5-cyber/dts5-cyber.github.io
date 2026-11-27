// Карьера — анимации. Включаются только при html.motion (см. inline-скрипт в career.astro).
const root = document.documentElement;
(window as any).__careerMotion = true;

if (root.classList.contains('motion')) {
  const hoverable = matchMedia('(hover:hover)').matches;
  const isMobile = () => innerWidth < 768;

  // ---------- разбивка заголовков на слова ----------
  function split(el: HTMLElement, delay = 0) {
    if (el.classList.contains('split')) return;
    let i = 0;
    const wrap = (node: Node) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.style.setProperty('--i', String(i++));
      if (delay) w.style.setProperty('--d', `${delay}ms`);
      return w;
    };
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = (node.textContent || '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = wrap(node); w.textContent = part; frag.append(w);
        });
        node.replaceWith(frag);
      } else if (node instanceof HTMLElement && node.tagName !== 'BR') {
        const w = wrap(node); node.replaceWith(w); w.append(node);
      }
    });
    el.classList.add('split');
  }

  const mark = (selector: string, opts: { stagger?: boolean; mod?: number; kind?: string } = {}) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el, idx) => {
      el.dataset.r = opts.kind || '';
      if (opts.stagger) el.style.setProperty('--i', String(opts.mod ? idx % opts.mod : idx));
    });
  };
  // по окончании анимации снимаем её, чтобы вернуть hover-эффекты
  document.addEventListener('animationend', e => {
    const t = e.target as HTMLElement;
    if (t.dataset && 'r' in t.dataset && t.classList.contains('in')) t.classList.add('done');
  });

  // ---------- первый экран ----------
  const hero = document.querySelector<HTMLElement>('.career-hero')!;
  const h1 = hero.querySelector<HTMLElement>('h1')!;
  split(h1, 150);
  const cta = hero.querySelector<HTMLElement>('.hero-cta')!;
  const demo = hero.querySelector<HTMLElement>('.hero-demo')!;
  cta.dataset.r = ''; cta.style.setProperty('--d', '650ms');
  demo.dataset.r = ''; demo.style.setProperty('--d', '1500ms');
  hero.querySelectorAll<HTMLElement>('.hero-gallery-group').forEach(group => {
    [...group.children].forEach((li, i) => {
      const el = li as HTMLElement;
      el.dataset.r = 'card';
      el.style.setProperty('--d', `${700 + Math.min(i, 6) * 95}ms`);
    });
  });
  hero.querySelectorAll('img').forEach(img => (img.draggable = false));
  requestAnimationFrame(() => {
    h1.classList.add('in');
    hero.querySelectorAll('[data-r]').forEach(el => el.classList.add('in'));
    hero.classList.add('ready');
  });

  // ---------- появление блоков при скролле ----------
  document.querySelectorAll<HTMLElement>('main .h2, .care-heading h3, .growth-card h3').forEach(h => split(h));
  mark('.section-note, .care-heading>p, .benefits-note, .vacancy-source-note, .resume-intro>p');
  mark('.direction-filter', { stagger: true });
  mark('.growth-card li', { stagger: true });
  mark('.benefit-card', { stagger: true, mod: 4 });
  mark('.vacancy-grid>#vacancy-list>.vacancy-card, .vacancy-all-card', { stagger: true });
  mark('.story', { stagger: true });
  mark('.resume-form-wrap>.demo-label, .resume-form-wrap>.fine-print, .resume-fields>.fld, .resume-consent, .resume-form-wrap .btnF', { stagger: true });
  document.querySelectorAll<HTMLElement>('.hiring-steps li').forEach((li, i) => li.style.setProperty('--i', String(i)));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.classList.add('in');
      if (el.classList.contains('rating')) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('main [data-r]:not(.career-hero [data-r]), main .split:not(h1), #career-directions, .federal-card, .resume-intro, .rating, .hiring-steps')
    .forEach(el => io.observe(el));

  // рейтинг 0,0 → 4,5
  function countUp(el: HTMLElement) {
    const score = el.querySelector('.rating-score');
    const node = score?.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const final = node.textContent || '';
    const target = parseFloat(final.replace(',', '.'));
    if (!isFinite(target)) return;
    const start = performance.now(), dur = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const v = target * (1 - Math.pow(1 - p, 3));
      node.textContent = p < 1 ? `${v.toFixed(1).replace('.', ',')} ` : final;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- подсветка карточек под курсором ----------
  if (hoverable) {
    const spotSel = '.benefit-card,.vacancy-card,.growth-card,.story,.direction-task-card';
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const card = (e.target as Element).closest<HTMLElement>(spotSel);
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  // ---------- фотолента: живой маркиз ----------
  const gallery = hero.querySelector<HTMLElement>('.hero-gallery')!;
  const track = gallery.querySelector<HTMLElement>('.hero-gallery-track')!;
  const firstGroup = track.querySelector<HTMLElement>('.hero-gallery-group')!;
  let x = 0, v = 0, boost = 0, hovering = false, dragging = false, heroVisible = true;
  let groupW = 0;
  const measure = () => { groupW = firstGroup.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || '0'); };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  const baseSpeed = () => (isMobile() ? 26 : 38); // px/с

  gallery.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  gallery.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hovering = false; });
  gallery.addEventListener('focusin', () => (hovering = true));
  gallery.addEventListener('focusout', () => (hovering = false));
  gallery.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { boost = 900; e.preventDefault(); }
    if (e.key === 'ArrowLeft') { boost = -900; e.preventDefault(); }
  });

  let lastPX = 0, lastPT = 0, dragVel = 0, moved = 0;
  gallery.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; dragVel = 0; boost = 0;
    lastPX = e.clientX; lastPT = performance.now();
    gallery.setPointerCapture(e.pointerId);
    gallery.classList.add('dragging');
  });
  gallery.addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastPX;
    x += dx; moved += Math.abs(dx);
    dragVel = dx / Math.max(1, now - lastPT) * 1000;
    lastPX = e.clientX; lastPT = now;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    gallery.classList.remove('dragging');
    boost = Math.max(-2400, Math.min(2400, -dragVel)); // бросок по инерции
  };
  gallery.addEventListener('pointerup', endDrag);
  gallery.addEventListener('pointercancel', endDrag);
  gallery.addEventListener('click', e => { if (moved > 6) e.preventDefault(); }, true);

  new IntersectionObserver(([en]) => (heroVisible = en.isIntersecting)).observe(hero);

  // ---------- параллакс и курсорное свечение ----------
  const glow = hero.querySelector<HTMLElement>('.hero-glow');
  const heroContent = hero.querySelector<HTMLElement>('.hero-content')!;
  let gx = 0, gy = 0, tgx = 0, tgy = 0;
  if (hoverable && glow) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tgx = (e.clientX - r.left - r.width / 2) * .08;
      tgy = (e.clientY - r.top - r.height / 2) * .08;
    }, { passive: true });
  }
  const parallax = [...document.querySelectorAll<HTMLElement>('.federal-card>img, .resume-intro>img')];

  let lastY = scrollY, scrolled = true;
  addEventListener('scroll', () => {
    const dy = scrollY - lastY; lastY = scrollY; scrolled = true;
    if (heroVisible && !dragging) boost = Math.max(-700, Math.min(1200, boost + dy * 7));
  }, { passive: true });

  let last = performance.now();
  const frame = (t: number) => {
    const dt = Math.min(.05, (t - last) / 1000); last = t;

    if (heroVisible) {
      if (!dragging) {
        const target = hovering ? 0 : baseSpeed();
        v += (target - v) * Math.min(1, dt * 2.5);
        x -= (v + boost) * dt;
        boost *= Math.pow(.06, dt);
      }
      if (groupW > 0) { while (x <= -groupW) x += groupW; while (x > 0) x -= groupW; }
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;

      if (glow) {
        gx += (tgx - gx) * Math.min(1, dt * 3); gy += (tgy - gy) * Math.min(1, dt * 3);
        glow.style.setProperty('--gx', `${gx.toFixed(1)}px`);
        glow.style.setProperty('--gy', `${gy.toFixed(1)}px`);
      }
    }

    if (scrolled) {
      scrolled = false;
      const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
      heroContent.style.translate = `0 ${(p * 90).toFixed(1)}px`;
      heroContent.style.opacity = String(Math.max(0, 1 - p * 1.3));
      const vh = innerHeight;
      parallax.forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) / vh; // −1…1
        img.style.setProperty('--py', `${(-off * 18).toFixed(1)}px`);
      });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
