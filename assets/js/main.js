/* L’OcéaNails — mouvement & réservation (site statique, aucune dépendance de service) */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  const PHONE = '+33779629291';
  const PHONE_LABEL = '07 79 62 92 91';
  const IG_DM = 'https://ig.me/m/loceanails13';
  const ADDRESS = 'Rue des Michelons, 13770 Venelles';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (reduce) root.classList.add('static-layout');

  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (!hasGsap) { root.classList.add('static-layout'); }

  /* ---------------------------------------------------------
     Découpage de texte (lettres / mots)
  --------------------------------------------------------- */
  function walkText(node, fn) {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) fn(n);
      else if (n.nodeType === 1) walkText(n, fn);
    });
  }
  function splitChars(el) {
    walkText(el, (n) => {
      const frag = document.createDocumentFragment();
      for (const c of n.textContent) {
        const m = document.createElement('span'); m.className = 'ch-mask';
        const s = document.createElement('span'); s.className = 'ch';
        s.textContent = c === ' ' ? '\u00a0' : c;
        m.appendChild(s); frag.appendChild(m);
      }
      n.replaceWith(frag);
    });
    el.setAttribute('aria-hidden', 'true');
  }
  function splitWords(el) {
    walkText(el, (n) => {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        const m = document.createElement('span'); m.className = 'w-mask';
        const w = document.createElement('span'); w.className = 'w'; w.textContent = p;
        m.appendChild(w); frag.appendChild(m);
      });
      n.replaceWith(frag);
    });
  }
  if (hasGsap) {
    $$('[data-split="chars"]').forEach(splitChars);
    $$('[data-split="words"]').forEach(splitWords);
    splitChars($('.foot__word span'));
  }

  /* ---------------------------------------------------------
     Smooth scroll (Lenis) + GSAP
  --------------------------------------------------------- */
  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduce && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  function scrollToTarget(t, instant) {
    if (lenis) lenis.scrollTo(t, { offset: 0, duration: instant ? 0 : 1.7, easing: (x) => 1 - Math.pow(1 - x, 4), force: true });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------------------------------------------------------
     Menu mobile
  --------------------------------------------------------- */
  const burger = $('#burger'), menu = $('#menu'), nav = $('#nav');
  let menuOpen = false;
  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (!hasGsap) { menu.style.visibility = open ? 'visible' : 'hidden'; return; }
    if (open) {
      menu.style.visibility = 'visible';
      if (lenis) lenis.stop();
      gsap.fromTo('.menu__bg', { clipPath: 'circle(0% at 90% 4%)' }, { clipPath: 'circle(150% at 90% 4%)', duration: reduce ? 0 : 1, ease: 'expo.inOut', overwrite: true });
      gsap.fromTo('.menu__links a', { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0 : 1, stagger: .06, delay: .25, ease: 'expo.out', overwrite: true });
      gsap.fromTo('.menu__foot', { opacity: 0 }, { opacity: 1, duration: .6, delay: .6, overwrite: true });
    } else {
      if (lenis) lenis.start();
      gsap.to('.menu__bg', { clipPath: 'circle(0% at 90% 4%)', duration: reduce ? 0 : .8, ease: 'expo.inOut', overwrite: true, onComplete: () => { menu.style.visibility = 'hidden'; } });
    }
  }
  burger.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    const wasOpen = menuOpen;
    setMenu(false);
    setTimeout(() => scrollToTarget(t), wasOpen ? 350 : 0);
  });

  /* ---------------------------------------------------------
     Curseur
  --------------------------------------------------------- */
  if (hasGsap && fine && !reduce) {
    const cur = $('#cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, label, .tilt');
      cur.classList.toggle('is-label', !!lab);
      cur.classList.toggle('is-link', !!link && !lab);
      if (lab) label.textContent = lab.dataset.cursor;
    });
    window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    window.addEventListener('pointerup', () => cur.classList.remove('is-down'));
  }

  /* ---------------------------------------------------------
     Inclinaison 3D + reflet (cartes, galerie)
  --------------------------------------------------------- */
  if (fine && !reduce) {
    $$('.tilt').forEach((el) => {
      const max = el.classList.contains('card') ? 9 : 7;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - .5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------------------------------------------------------
     Boutons magnétiques
  --------------------------------------------------------- */
  if (hasGsap && fine && !reduce) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * .28, y: y * .4, duration: .5, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)', overwrite: 'auto' }));
    });
  }

  /* ---------------------------------------------------------
     Toast
  --------------------------------------------------------- */
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3400);
  }

  /* ---------------------------------------------------------
     Loader + intro du hero
  --------------------------------------------------------- */
  const loader = $('#loader');
  const hero = $('.hero');
  const heroVideo = $('.hero__video');
  if (reduce && heroVideo) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(heroVideo, { scale: 1.4 }, { scale: 1.1, duration: 2.6 }, 0)
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 1.1 }, .15)
      .from('.hero__title .ch', { yPercent: 118, duration: 1.4, stagger: .05 }, .1)
      .from('.hero__lead', { y: 34, opacity: 0, duration: 1.1 }, .55)
      .from('.hero__cta > *', { y: 34, opacity: 0, duration: 1.1, stagger: .1 }, .7)
      .from('.hero__chips li', { x: 50, opacity: 0, duration: 1.1, stagger: .1 }, .85)
      .from('.drop', { scale: 0, opacity: 0, duration: 1.6, stagger: .12, ease: 'back.out(2)' }, .6)
      .from('.hero__scroll', { opacity: 0, y: 20, duration: 1 }, 1.1)
      .from('.nav', { opacity: 0, duration: 1, clearProps: 'opacity' }, .9)
      .add(() => {
        gsap.to(heroVideo, { scale: 1.2, duration: 22, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }, 2.4);
  }

  function runLoader() {
    return new Promise((resolve) => {
      if (!hasGsap || reduce || !loader) { if (loader) loader.classList.add('is-done'); return resolve(false); }
      if (lenis) lenis.stop();
      const num = $('#loadNum'), gel = $('.loader__gel'), shine = $('.loader__shine');
      const st = { v: 0 };
      gsap.set(gel, { y: 150 });
      gsap.set(shine, { opacity: 0 });
      const pageReady = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
      const minTime = new Promise((r) => setTimeout(r, 1900));
      const tl = gsap.timeline();
      tl.from('.loader__brand', { yPercent: 50, opacity: 0, duration: .9, ease: 'expo.out' }, .1)
        .from('.loader__nail', { scale: .85, opacity: 0, duration: .9, ease: 'expo.out' }, 0)
        .to(st, { v: 100, duration: 1.9, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(st.v); } }, 0)
        .to(gel, { y: 0, duration: 1.9, ease: 'power2.inOut' }, 0)
        .to(shine, { opacity: 1, duration: .6 }, 1.5);
      Promise.all([minTime, Promise.race([pageReady, new Promise((r) => setTimeout(r, 4500))])]).then(() => {
        const out = gsap.timeline({ onComplete: () => { loader.classList.add('is-done'); if (lenis) lenis.start(); ScrollTrigger.refresh(); } });
        out.to('.loader__center', { opacity: 0, y: -40, duration: .55, ease: 'power3.in' })
          .to('.loader__panel', { yPercent: -112, duration: 1.2, ease: 'expo.inOut' }, '<.15')
          .add(() => { resolve(true); }, '<.35');
      });
    });
  }

  /* ---------------------------------------------------------
     Animations de défilement
  --------------------------------------------------------- */
  function initScroll() {
    // Barre de progression de lecture
    gsap.to('#progressBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .2 } });

    // Navigation : se cache en descendant, revient en remontant
    const fab = $('#fab');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        nav.classList.toggle('is-solid', y > 60);
        nav.classList.toggle('is-hidden', self.direction === 1 && y > 500 && !menuOpen);
      }
    });
    if (fab) {
      fab.classList.add('is-hidden');
      ScrollTrigger.create({ trigger: hero, start: 'bottom 60%', onEnter: () => fab.classList.remove('is-hidden'), onLeaveBack: () => fab.classList.add('is-hidden') });
      ScrollTrigger.create({ trigger: '.booking', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { if (s.isActive) fab.classList.add('is-hidden'); else if (window.scrollY > innerHeight) fab.classList.remove('is-hidden'); } });
    }

    // Mouvement réduit : tout reste visible et fixe, aucune révélation au scroll
    if (reduce) return;

    // Titres en mots, révélations génériques
    $$('[data-split="words"]').forEach((el) => {
      gsap.from($$('.w', el), { yPercent: 118, duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.eyebrow').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, { opacity: 0, x: -24, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    ['.shade__lead', '.shade__name', '.swatches', '.booking__lead', '.booking__how li', '.booking__direct', '.find__addr', '.find__note', '.open', '.find__links > *', '.gallery__insta', '.reviews__score', '.ba__title'].forEach((sel) => {
      $$(sel).forEach((el, i) => {
        gsap.from(el, { opacity: 0, y: 34, duration: 1.1, ease: 'expo.out', delay: (i % 4) * .05, scrollTrigger: { trigger: el, start: 'top 92%' } });
      });
    });

    // Hero : parallax multicouche
    gsap.to('.hero__media', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__drops', { yPercent: -70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -20, opacity: .15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '85% top', scrub: true } });
    gsap.to('.hero__chips', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true } });
    if (fine) {
      const drops = $$('.drop'), speeds = [46, -78, 100, -34];
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        drops.forEach((d, i) => gsap.to(d, { x: nx * speeds[i], y: ny * speeds[i] * .8, duration: 1.4, ease: 'power3.out', overwrite: 'auto' }));
        gsap.to('.hero__video', { x: -nx * 26, duration: 1.6, ease: 'power3.out', overwrite: 'auto' });
      });
    }

    // Marquee : vitesse et sens réagissent au scroll
    const tweens = $$('.marquee__row').map((row) => {
      const track = $('.marquee__track', row), dir = Number(row.dataset.dir);
      return gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, ease: 'none', duration: 34, repeat: -1 });
    });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const d = self.direction, boost = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 7);
        tweens.forEach((tw) => gsap.to(tw, { timeScale: d * boost, duration: .25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: d, duration: 1.4 }) }));
      }
    });
    gsap.from('.marquee__row', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.marquee', start: 'top 90%' } });

    const mm = gsap.matchMedia();

    // Desktop : storytelling pinné + défilement horizontal + zoom dans le texte
    mm.add(reduce ? '(min-width: 99999px)' : '(min-width: 900px)', () => {
      // --- Savoir-faire pinné
      const steps = $$('.step'), imgs = $$('.story__img'), wordTrack = $('.story__word-track');
      const bar = $('.story__meter-bar'), num = $('.story__meter-num');
      let cur = 0;
      const wordH = () => wordTrack.children[0].offsetHeight;
      const go = (i) => {
        if (i === cur) return;
        const prev = cur; cur = i;
        gsap.to(steps[prev], { opacity: 0, y: -34, duration: .45, ease: 'power3.in', overwrite: true, onComplete: () => steps[prev].classList.remove('is-active') });
        steps[i].classList.add('is-active');
        gsap.fromTo(steps[i], { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', delay: .3, overwrite: true });
        gsap.to(imgs[prev], { opacity: 0, scale: 1.12, duration: 1, ease: 'power2.inOut', overwrite: true });
        gsap.fromTo(imgs[i], { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', overwrite: true });
        gsap.to(wordTrack, { y: -i * wordH(), duration: 1.1, ease: 'expo.inOut', overwrite: true });
        num.textContent = '0' + (i + 1) + ' / 04';
      };
      ScrollTrigger.create({
        trigger: '.story', start: 'top top', end: '+=320%', pin: '.story__pin', anticipatePin: 1,
        onUpdate: (self) => {
          go(Math.min(3, Math.floor(self.progress * 4)));
          bar.style.setProperty('--p', Math.max(.04, self.progress).toFixed(3));
        }
      });
      // --- Prestations : défilement horizontal piloté par le scroll vertical
      const track = $('.services__track');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const move = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.services', start: 'top top', end: () => '+=' + dist(), pin: '.services__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$('.card').forEach((c) => {
        gsap.from(c, { opacity: .15, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: move, start: 'left 98%', end: 'left 70%', scrub: true } });
      });
      // --- Rituel : on zoome dans le mot, la vidéo se révèle
      const vid = $('.rituel__video');
      const play = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.rituel', start: 'top top', end: '+=230%', pin: '.rituel__pin', scrub: .6, anticipatePin: 1,
          onEnter: play, onEnterBack: play, onLeave: () => vid.pause(), onLeaveBack: () => vid.pause()
        }
      });
      tl.to('.rituel__cut span', { scale: 16, ease: 'power2.in', duration: 1 }, 0)
        .to('.rituel__cut', { opacity: 0, ease: 'none', duration: .3 }, .68)
        .to('.rituel__veil', { opacity: 1, duration: .35 }, .85)
        .fromTo('.rituel__copy', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .45 }, 1)
        .to({}, { duration: .5 });
    });

    // Mobile / tablette : révélations simples
    mm.add(reduce ? '(min-width: 99999px)' : '(max-width: 899px)', () => {
      $$('.step').forEach((s) => gsap.from(s, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%' } }));
      gsap.from('.story__frame', { scale: .85, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.story__frame', start: 'top 88%' } });
      gsap.from('.services__track > *', { opacity: 0, x: 70, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.services__track', start: 'top 85%' } });
      const vid = $('.rituel__video');
      ScrollTrigger.create({ trigger: '.rituel', start: 'top 85%', end: 'bottom 15%', onToggle: (s) => { if (s.isActive) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); } else vid.pause(); } });
    });

    // Chiffres clés (compteurs)
    if (!reduce) {
      $$('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count), dec = Number(el.dataset.dec || 0), o = { v: 0 };
        const fmt = (v) => v.toFixed(dec).replace('.', ',');
        el.textContent = fmt(0);
        ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } }) });
      });
      gsap.from('.stat', { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.stats__inner', start: 'top 85%' } });
    }
    gsap.fromTo('.stats__bg img', { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Teinte
    gsap.from('.shade__stage', { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.shade__stage', start: 'top 85%' } });
    gsap.from('#shadeNails .nail-in', { y: 90, opacity: 0, duration: 1.5, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.shade__stage', start: 'top 80%' } });

    // Galerie : masque qui s’ouvre + image qui bouge dans son cadre
    $$('.g .g__frame').forEach((frame) => {
      gsap.fromTo(frame, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(142% at 50% 100%)', duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: frame, start: 'top 88%' } });
      const img = $('img', frame);
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.g--quote', { opacity: 0, y: 50, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.g--quote', start: 'top 90%' } });
    gsap.from('.ba__card', { y: 90, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, clearProps: 'transform', scrollTrigger: { trigger: '.ba__row', start: 'top 88%' } });

    // Avis
    gsap.from('.rv__card', { x: 140, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.rv', start: 'top 85%' } });

    // Réservation
    gsap.from('.bform', { y: 90, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.bform', start: 'top 90%' } });
    gsap.fromTo('.booking__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.booking', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Venir
    gsap.fromTo('.find__mapframe', { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(142% at 50% 100%)', duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.find__mapframe', start: 'top 85%' } });
    gsap.from('.hours tr', { x: -40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.hours', start: 'top 88%' } });

    // Pied de page
    gsap.from('.foot__word .ch', { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: '.foot__word', start: 'top 98%' } });
    gsap.from('.foot__cta, .foot__cols > div', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.foot__top', start: 'top 88%' } });
  }

  /* ---------------------------------------------------------
     Sélecteur de teinte
  --------------------------------------------------------- */
  const SHADES = [
    { n: 'Prune Abyssale', c: '#5c1d4c' },
    { n: 'Chocolat Écume', c: '#6b4538' },
    { n: 'Nude Sable', c: '#c79f8b' },
    { n: 'Mauve Brume', c: '#9a6b7a' },
    { n: 'Rouge Corail', c: '#c21f3a' },
    { n: 'Bordeaux Marée', c: '#7a1230' },
    { n: 'Rose Coquillage', c: '#e9b5be' },
    { n: 'Perle Lagon', c: '#9ccfca' }
  ];
  let shade = SHADES[0];
  (function buildShade() {
    const sec = $('#teinte'), sw = $('#swatches'), name = $('#shadeName'), g = $('#shadeNails');
    sw.innerHTML = SHADES.map((s, i) => `<button type="button" class="sw" role="radio" aria-checked="${i === 0}" aria-label="${s.n}" title="${s.n}" style="--sw:${s.c}" data-i="${i}"></button>`).join('');
    const fan = [{ x: 92, y: 306, r: -38, s: .78 }, { x: 177, y: 326, r: -19, s: 1 }, { x: 260, y: 334, r: 0, s: 1.12 }, { x: 343, y: 326, r: 19, s: 1 }, { x: 428, y: 306, r: 38, s: .76 }];
    g.innerHTML = fan.map((f) => `<g class="nail" transform="translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})"><g class="nail-in"><g transform="translate(-50 -134)"><use href="#i-nail" class="n" width="100" height="140"/><path class="gl" d="M37 34c-6 18-10 38-9 58" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></g></g></g>`).join('');
    const setShade = (i) => {
      shade = SHADES[i];
      sec.style.setProperty('--shade', shade.c);
      name.textContent = shade.n;
      $$('.sw', sw).forEach((b, k) => b.setAttribute('aria-checked', String(k === i)));
      if (hasGsap && !reduce) gsap.fromTo('.shade__halo', { scale: .8, opacity: .12 }, { scale: 1, opacity: .45, duration: 1.3, ease: 'expo.out', overwrite: true });
    };
    sw.addEventListener('click', (e) => { const b = e.target.closest('.sw'); if (b) setShade(Number(b.dataset.i)); });
    sw.addEventListener('keydown', (e) => {
      if (!/Arrow/.test(e.key)) return;
      e.preventDefault();
      const cur = SHADES.indexOf(shade), n = (cur + (/Right|Down/.test(e.key) ? 1 : -1) + SHADES.length) % SHADES.length;
      setShade(n); $$('.sw', sw)[n].focus();
    });
    sec.style.setProperty('--shade', shade.c);
    if (hasGsap && fine && !reduce) {
      const stage = $('#shadeStage');
      stage.parentElement.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5;
        gsap.to('#shadeNails', { rotation: nx * 7, transformOrigin: '50% 100%', duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      });
      gsap.to('#shadeNails .nail', { y: -8, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: .35, from: 'center' } });
    }
    $('#keepShade').addEventListener('click', () => {
      const ta = $('#fMsg');
      ta.value = ta.value.replace(/Teinte envisagée : [^.]*\.\s*/, '');
      ta.value = ('Teinte envisagée : ' + shade.n + '. ' + ta.value).trim();
      toast('Teinte « ' + shade.n + ' » ajoutée à votre demande');
      scrollToTarget($('#reserver'));
    });
  })();

  /* ---------------------------------------------------------
     Carrousel d’avis
  --------------------------------------------------------- */
  (function reviews() {
    const rv = $('#rv'), viewport = $('.rv__viewport', rv), track = $('#rvTrack'), cards = $$('.rv__card', track);
    const dots = $('#rvDots'), prev = $('#rvPrev'), next = $('#rvNext');
    let idx = 0, x = 0, auto, dragging = false;
    dots.innerHTML = cards.map((_, i) => `<i${i === 0 ? ' class="is-on"' : ''}></i>`).join('');
    viewport.setAttribute('tabindex', '0'); viewport.setAttribute('role', 'group'); viewport.setAttribute('aria-label', 'Avis, utilisez les flèches gauche et droite');
    const minX = () => Math.min(0, viewport.clientWidth - track.scrollWidth);
    const offsetFor = (i) => -(cards[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft));
    const clamp = (v) => Math.max(minX(), Math.min(0, v));
    const apply = (v, d) => { x = v; if (hasGsap) gsap.to(track, { x: v, duration: reduce ? 0 : d, ease: 'expo.out', overwrite: 'auto' }); else track.style.transform = `translateX(${v}px)`; };
    const show = (i, d = 1.1) => {
      idx = (i + cards.length) % cards.length;
      apply(clamp(offsetFor(idx)), d);
      $$('i', dots).forEach((el, k) => el.classList.toggle('is-on', k === idx));
    };
    const stopAuto = () => clearInterval(auto);
    const startAuto = () => { if (reduce) return; stopAuto(); auto = setInterval(() => { if (!dragging) show(idx + 1); }, 6500); };
    prev.addEventListener('click', () => { show(idx - 1); startAuto(); });
    next.addEventListener('click', () => { show(idx + 1); startAuto(); });
    viewport.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { show(idx + 1); startAuto(); } if (e.key === 'ArrowLeft') { show(idx - 1); startAuto(); } });
    rv.addEventListener('pointerenter', stopAuto); rv.addEventListener('pointerleave', startAuto);
    rv.addEventListener('focusin', stopAuto); rv.addEventListener('focusout', startAuto);

    let sx = 0, sxv = 0, lastX = 0, lastT = 0, vel = 0, moved = false;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; moved = false; sx = e.clientX; sxv = x; lastX = e.clientX; lastT = performance.now(); vel = 0;
      viewport.classList.add('is-drag');
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      let v = sxv + dx; const lo = minX();
      if (v > 0) v *= .35; if (v < lo) v = lo + (v - lo) * .35;
      const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      x = v; if (hasGsap) gsap.set(track, { x: v }); else track.style.transform = `translateX(${v}px)`;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false; viewport.classList.remove('is-drag');
      const target = clamp(x + vel * 380);
      let best = 0, bd = Infinity;
      cards.forEach((_, i) => { const d = Math.abs(clamp(offsetFor(i)) - target); if (d < bd) { bd = d; best = i; } });
      show(best, 1);
      startAuto();
    });
    viewport.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    window.addEventListener('resize', () => show(idx, 0));
    startAuto();
  })();

  /* ---------------------------------------------------------
     Réservation : formulaire autonome (SMS / Instagram / agenda)
  --------------------------------------------------------- */
  (function booking() {
    const form = $('#bform');
    const steps = $$('.bstep', form), stepLis = $$('#bSteps li'), bar = $('#bBar');
    const back = $('#bBack'), nextBtn = $('#bNext');
    const state = { step: 1, service: '', date: null, time: '', place: 'chez Océane, à Venelles', addr: '', prenom: '', tel: '', msg: '', depose: false };
    const isHome = () => state.place.startsWith('à mon domicile');
    const placeText = () => (isHome() ? 'à mon domicile : ' + state.addr : state.place);

    const fmtDay = (d) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    const fmtFull = (d) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const hh = (t) => t.replace(':', 'h');

    /* --- Calendrier --- */
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 90);
    let view = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const calGrid = $('#calGrid'), calTitle = $('#calTitle'), calPrev = $('#calPrev'), calNext = $('#calNext');
    function renderCal() {
      const y = view.getFullYear(), m = view.getMonth();
      calTitle.textContent = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(view);
      const offset = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      let html = '';
      for (let i = 0; i < offset; i++) html += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, m, d), dow = dt.getDay();
        const off = dt < minDate || dt > maxDate || dow === 0 || dow === 6;
        const sel = state.date && +state.date === +dt;
        html += `<button type="button" class="day${sel ? ' is-sel' : ''}${+dt === +today ? ' is-today' : ''}" data-ts="${+dt}" ${off ? 'disabled' : ''} aria-pressed="${!!sel}" aria-label="${fmtFull(dt)}">${d}</button>`;
      }
      calGrid.innerHTML = html;
      calPrev.disabled = y === minDate.getFullYear() && m === minDate.getMonth();
      calNext.disabled = y === maxDate.getFullYear() && m === maxDate.getMonth();
    }
    calPrev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
    calNext.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });
    calGrid.addEventListener('click', (e) => {
      const b = e.target.closest('.day');
      if (!b || b.disabled) return;
      state.date = new Date(Number(b.dataset.ts));
      renderCal(); renderTimes();
      $('#err2').hidden = true;
    });

    const SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const timesEl = $('#times');
    function renderTimes() {
      if (!state.date) { timesEl.innerHTML = '<p class="times__empty">Choisissez d’abord un jour.</p>'; return; }
      timesEl.innerHTML = SLOTS.map((h) => {
        const v = String(h).padStart(2, '0') + ':00';
        return `<label class="time"><input type="radio" name="time" value="${v}"${state.time === v ? ' checked' : ''}><span>${h}h00</span></label>`;
      }).join('');
    }
    timesEl.addEventListener('change', (e) => { state.time = e.target.value; $('#err2').hidden = true; });
    renderCal();

    /* --- Champs --- */
    form.addEventListener('change', (e) => {
      if (e.target.name === 'service') { state.service = e.target.value; $('#err1').hidden = true; }
      if (e.target.name === 'place') {
        state.place = e.target.value;
        $('#addrWrap').hidden = !isHome();
        $('#err2b').hidden = true;
      }
      if (e.target.id === 'fDepose') state.depose = e.target.checked;
    });

    /* --- Navigation d'étapes --- */
    const telOk = (t) => /^(\+33|0033|0)[1-9]\d{8}$/.test(t.replace(/[\s.\-]/g, ''));
    function validate(n) {
      if (n === 1) { const ok = !!state.service; $('#err1').hidden = ok; return ok; }
      if (n === 2) {
        const okDT = !!(state.date && state.time);
        state.addr = $('#fAddr').value.trim();
        const okA = !isHome() || state.addr.length >= 8;
        $('#err2').hidden = okDT;
        $('#err2b').hidden = okA || !okDT;
        $('#fAddr').classList.toggle('is-bad', !okA);
        if (okDT && !okA) $('#fAddr').focus();
        return okDT && okA;
      }
      if (n === 3) {
        state.prenom = $('#fPrenom').value.trim(); state.tel = $('#fTel').value.trim(); state.msg = $('#fMsg').value.trim();
        const okP = state.prenom.length > 1, okT = telOk(state.tel);
        $('#fPrenom').classList.toggle('is-bad', !okP); $('#fTel').classList.toggle('is-bad', !okT);
        $('#err3').hidden = okP && okT;
        return okP && okT;
      }
      return true;
    }
    function goStep(n) {
      state.step = n;
      steps.forEach((s, i) => s.classList.toggle('is-active', i + 1 === n));
      stepLis.forEach((li, i) => { li.classList.toggle('is-active', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
      bar.style.transform = `scaleX(${n / 4})`;
      back.hidden = n === 1;
      nextBtn.hidden = n === 4;
      $('span', nextBtn).textContent = n === 3 ? 'Voir le récapitulatif' : 'Continuer';
      if (n === 4) renderRecap();
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * .5) scrollToTarget(form);
    }
    nextBtn.addEventListener('click', () => { if (validate(state.step)) goStep(state.step + 1); });
    back.addEventListener('click', () => goStep(Math.max(1, state.step - 1)));
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio' && e.target.type !== 'checkbox') { e.preventDefault(); nextBtn.click(); } });

    /* --- Cartes « prestations » → préremplissage --- */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-pick]');
      if (!a) return;
      const input = $$('input[name="service"]', form).find((i) => i.value === a.dataset.pick);
      if (input) { input.checked = true; state.service = input.value; }
      goStepSilent(2);
    });
    function goStepSilent(n) {
      state.step = n;
      steps.forEach((s, i) => s.classList.toggle('is-active', i + 1 === n));
      stepLis.forEach((li, i) => { li.classList.toggle('is-active', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
      bar.style.transform = `scaleX(${n / 4})`;
      back.hidden = n === 1; nextBtn.hidden = n === 4;
      $('span', nextBtn).textContent = 'Continuer';
    }

    /* --- Message, récap, envois --- */
    function message() {
      let m = `Bonjour Océane, c’est ${state.prenom}. Je souhaiterais réserver : ${state.service}, le ${fmtDay(state.date)} à ${hh(state.time)} (${placeText()}).`;
      if (state.depose) m += ' J’ai une pose à retirer.';
      if (state.msg) m += ` ${state.msg}${/[.!?]$/.test(state.msg) ? '' : '.'}`;
      m += ` Mon numéro : ${state.tel}. Merci !`;
      return m;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    function renderRecap() {
      $('#recap').innerHTML = `<p class="recap__big">${esc(state.service)}<br>${esc(fmtDay(state.date))} · ${esc(hh(state.time))}</p><dl>
        <dt>Lieu</dt><dd>${isHome() ? 'À mon domicile (déplacement)' : esc(state.place)}</dd>
        ${isHome() ? `<dt>Adresse</dt><dd>${esc(state.addr)}</dd>` : ''}
        <dt>Prénom</dt><dd>${esc(state.prenom)}</dd>
        <dt>Téléphone</dt><dd>${esc(state.tel)}</dd>
        ${state.depose ? '<dt>Dépose</dt><dd>À prévoir</dd>' : ''}
        ${state.msg ? `<dt>Précisions</dt><dd>${esc(state.msg)}</dd>` : ''}
      </dl>`;
      $('#sendSms').href = `sms:${PHONE}${isIOS ? '&' : '?'}body=${encodeURIComponent(message())}`;
    }
    async function copyText(t) {
      try { await navigator.clipboard.writeText(t); return true; }
      catch (_) {
        const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (__) {} ta.remove(); return ok;
      }
    }
    $('#copyMsg').addEventListener('click', async () => { toast((await copyText(message())) ? 'Message copié. Envoyez-le au ' + PHONE_LABEL : 'Copie impossible : sélectionnez le message à la main'); });
    $('#sendIg').addEventListener('click', async () => { if (await copyText(message())) toast('Message copié : collez-le dans la conversation Instagram'); });
    $('#sendSms').addEventListener('click', () => { if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) { copyText(message()); toast('Message copié. Sur ordinateur, envoyez-le au ' + PHONE_LABEL); } });

    $('#dlIcs').addEventListener('click', () => {
      const pad = (n) => String(n).padStart(2, '0');
      const [h, mi] = state.time.split(':').map(Number);
      const d = state.date, loc = (hr) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(hr)}${pad(mi)}00`;
      const now = new Date(), stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
      const t = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//L OceaNails//Reservation//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
        `UID:${Date.now()}@loceanails`, `DTSTAMP:${stamp}`, `DTSTART:${loc(h)}`, `DTEND:${loc(h + 2)}`,
        `SUMMARY:${t('RDV L’OcéaNails (à confirmer)')}`, `LOCATION:${t(isHome() ? state.addr : ADDRESS)}`,
        `DESCRIPTION:${t(state.service + '\nDemande à confirmer par Océane : ' + PHONE_LABEL)}`, 'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'rdv-loceanails.ics'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast('Rendez-vous ajouté à votre agenda (à confirmer)');
    });
  })();

  /* ---------------------------------------------------------
     Horaires : état « ouvert maintenant »
  --------------------------------------------------------- */
  (function hours() {
    const badge = $('#openBadge');
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    const h = Number(get('hour')) % 24, mi = Number(get('minute')), mins = h * 60 + mi;
    const row = $(`#hoursBody tr[data-d="${dow}"]`); if (row) row.classList.add('is-today');
    const openNow = dow >= 1 && dow <= 5 && mins >= 480 && mins < 1260;
    badge.classList.toggle('is-open', openNow);
    let txt;
    if (openNow) txt = 'Ouvert · jusqu’à 21h';
    else if (dow >= 1 && dow <= 4 && mins >= 1260) txt = 'Fermé · rouvre demain à 8h';
    else if (dow >= 1 && dow <= 5 && mins < 480) txt = 'Fermé · ouvre aujourd’hui à 8h';
    else txt = 'Fermé · rouvre lundi à 8h';
    $('span', badge).textContent = txt;
  })();

  /* ---------------------------------------------------------
     Divers
  --------------------------------------------------------- */
  // Vidéo « rituel » : lecture seulement quand elle est visible (mobile / sans pin)
  if (!hasGsap || reduce) { const v = $('.rituel__video'); if (v) v.pause(); }

  /* ---------------------------------------------------------
     Démarrage
  --------------------------------------------------------- */
  if (hasGsap) {
    window.scrollTo(0, 0);
    // Certains navigateurs restaurent la position après le chargement : on repart du haut, sauf lien d’ancre
    window.addEventListener('pageshow', () => { if (!location.hash) { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); } });
    initScroll();
    runLoader().then((animated) => { if (animated) heroIntro(); else if (!reduce) heroIntro(); });
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
