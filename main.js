/* ═══════════════════════════════════════════════════════════════
   ZKTokenOpt — Main.js v3
   Custom cursor, scroll reveals, ROI calculator, FAQ
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Custom Cursor ─────────────────────────────────────────
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  let cx = -20, cy = -20;
  document.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });
  (function moveDot() {
    dot.style.left = cx - 4 + 'px';
    dot.style.top = cy - 4 + 'px';
    requestAnimationFrame(moveDot);
  })();

  document.querySelectorAll('a, button, .mechanism-card, .faq-q, input, select').forEach((el) => {
    el.addEventListener('mouseenter', () => dot.classList.add('hovering'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hovering'));
  });

  if ('ontouchstart' in window) dot.style.display = 'none';

  // ── Topbar Pin ────────────────────────────────────────────
  const topbar = document.querySelector('.topbar');
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('pinned', window.scrollY > 40);
  }, { passive: true });

  // ── Scroll Reveal ─────────────────────────────────────────
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revObs.observe(el));

  // ── ROI Calculator ────────────────────────────────────────
  const costSlider = document.getElementById('calc-cost');
  const volSlider = document.getElementById('calc-vol');
  const modelSel = document.getElementById('calc-model');
  const costVal = document.getElementById('calc-cost-val');
  const volVal = document.getElementById('calc-vol-val');

  const rMonthUSD = document.getElementById('r-month-usd');
  const rMonthINR = document.getElementById('r-month-inr');
  const rYearUSD = document.getElementById('r-year-usd');
  const rYearINR = document.getElementById('r-year-inr');
  const rROI = document.getElementById('r-roi');

  const prices = { gpt4o: 2.5, gpt4turbo: 10, gpt35: 0.5, claude35: 3, claude3opus: 15, gemini15: 1.25 };

  function calc() {
    if (!costSlider) return;
    const vol = +volSlider.value;
    const ppm = prices[modelSel ? modelSel.value : 'gpt4o'] || 2.5;
    const monthCost = (vol * 1e6 * 55 / 1e6) * ppm;
    const save = monthCost * 0.11;
    const yearUSD = save * 12;

    if (costVal) costVal.textContent = '$' + (+costSlider.value).toLocaleString();
    if (volVal) volVal.textContent = vol.toLocaleString() + 'M';
    if (rMonthUSD) rMonthUSD.textContent = '$' + Math.round(save).toLocaleString();
    if (rMonthINR) rMonthINR.textContent = '₹' + Math.round(save * 83).toLocaleString();
    if (rYearUSD) rYearUSD.textContent = '$' + Math.round(yearUSD).toLocaleString();
    if (rYearINR) rYearINR.textContent = '₹' + Math.round(yearUSD * 83).toLocaleString();
    if (rROI) rROI.textContent = Math.round(Math.max(((yearUSD - 1800) / 1800) * 100, 0)) + '%';
  }

  if (costSlider) costSlider.addEventListener('input', calc);
  if (volSlider) volSlider.addEventListener('input', calc);
  if (modelSel) modelSel.addEventListener('change', calc);
  calc();

  // ── FAQ ───────────────────────────────────────────────────
  document.querySelectorAll('.faq-row').forEach((row) => {
    row.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = row.classList.contains('open');
      document.querySelectorAll('.faq-row').forEach((r) => r.classList.remove('open'));
      if (!wasOpen) row.classList.add('open');
    });
  });

  // ── Smooth Scroll ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', function (e) {
      const el = document.querySelector(this.getAttribute('href'));
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });

})();
