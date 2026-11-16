/* site.js · Lingua's Academy: menú del teléfono y errores de formulario */
(() => {
  'use strict';

  /* Menú a pantalla completa en el teléfono */
  const btn = document.querySelector('.menu-btn');
  const sheet = document.getElementById('menu');
  if (btn && sheet) {
    const poner = abierto => {
      btn.setAttribute('aria-expanded', String(abierto));
      btn.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
      btn.querySelector('span').textContent = abierto ? 'Cerrar' : 'Menú';
      sheet.hidden = !abierto;
      document.body.style.overflow = abierto ? 'hidden' : '';
    };
    btn.addEventListener('click', () => poner(sheet.hidden));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) poner(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { poner(false); btn.focus(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) poner(false); });
  }

  /* Ayudas para formularios: un error bajo cada campo, el foco en el primero */
  window.Forma = {
    limpiar(form) {
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      form.querySelectorAll('.field__error').forEach(el => { el.textContent = ''; });
    },
    error(form, nombre, texto) {
      const el = form.elements[nombre];
      const err = document.getElementById(el.id + '-error');
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = texto;
    },
    estado(form, texto, tono) {
      const s = form.querySelector('[data-form-status]');
      s.textContent = texto; if (tono) s.dataset.tone = tono; else delete s.dataset.tone;
    },
    enfocarPrimero(form) {
      const el = form.querySelector('[aria-invalid="true"]'); if (el) el.focus();
      return form.querySelectorAll('[aria-invalid="true"]').length;
    },
    correoValido: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  };
})();
