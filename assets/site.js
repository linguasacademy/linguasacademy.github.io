/* site.js · Lingua's Academy: menú del teléfono, sección activa del menú y errores de formulario.
   El idioma de la página (textos, selector ES · EN · PT y enlaces con ?lang=) lo lleva assets/i18n.js. */

/* ═══════════ SUSCRIPCIÓN · el único lugar que hay que tocar cuando haya pasarela de pago ═══════════
   pago      Enlace de la página de pago (Mercado Pago, Stripe, Hotmart…), con https://.
             Vacío: el botón dice «Solicitar suscripción» y lleva a entrar.html (cuenta de profesor que se aprueba a mano).
             Con enlace: el botón dice «Suscribirme» y lleva a ese enlace.
   precio    Cómo se ve el precio en cada idioma, tal cual. Ejemplo:
               precio: { es: 'USD 12 al mes', en: 'USD 12 a month', pt: 'US$ 12 por mês' }
             Vacío: la página dice «Escríbenos para conocer los planes» (no se muestra ninguna cifra).
   contacto  Adónde lleva «Escríbenos» (mailto:correo@… o https://wa.me/…). Vacío: a entrar.html.
   La usan suscripcion.html y, a través de ella, todos los botones «Desbloquear». */
window.LA_SUSCRIPCION = window.LA_SUSCRIPCION || {
  pago: '',
  precio: { es: '', en: '', pt: '' },
  contacto: ''
};

(() => {
  'use strict';
  document.documentElement.classList.add('js');

  /* Menú a pantalla completa en el teléfono.
     Abierto: el fondo queda inerte, el foco entra a la hoja y Escape la cierra devolviendo el foco. */
  const btn = document.querySelector('.menu-btn');
  const sheet = document.getElementById('menu');
  if (btn && sheet) {
    sheet.hidden = false; // la oculta el CSS (visibility), así se puede animar la salida
    const fondo = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
    let abierto = false;
    /* Los textos del botón vienen de data-txt-*; i18n.js los cambia con el idioma de la página */
    const rotular = () => {
      const si = abierto;
      btn.setAttribute('aria-label', si ? (btn.dataset.txtCerrarAria || 'Cerrar el menú') : (btn.dataset.txtAbrirAria || 'Abrir el menú'));
      const span = btn.querySelector('span');
      if (span) span.textContent = si ? (btn.dataset.txtCerrar || 'Cerrar') : (btn.dataset.txtAbrir || 'Menú');
    };
    document.addEventListener('la:idioma', rotular);
    const poner = (si, devolverFoco) => {
      abierto = si;
      btn.setAttribute('aria-expanded', String(si));
      rotular();
      sheet.toggleAttribute('data-abierto', si);
      fondo.forEach(el => { el.inert = si; });
      document.body.style.overflow = si ? 'hidden' : '';
      if (si) { const primero = sheet.querySelector('a, button'); if (primero) primero.focus({ preventScroll: true }); }
      else if (devolverFoco) btn.focus();
    };
    btn.addEventListener('click', () => poner(!abierto));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) poner(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && abierto) poner(false, true); });
    /* Con la hoja abierta, Tab no se escapa a la página inerte: desde el último elemento vuelve al botón «Cerrar» */
    sheet.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || e.shiftKey || !abierto) return;
      const todos = [...sheet.querySelectorAll('a[href], button:not([disabled])')].filter(el => !el.hidden && el.offsetParent !== null);
      if (todos.length && e.target === todos[todos.length - 1]) { e.preventDefault(); btn.focus(); }
    });
    const ancho = document.querySelector('.nav--larga') ? '(min-width: 1200px)' : '(min-width: 1024px)';
    matchMedia(ancho).addEventListener('change', e => { if (e.matches && abierto) poner(false); });
  }

  /* Sección activa: al bajar, el menú marca con aria-current la sección que se está leyendo */
  const enlaces = [...document.querySelectorAll('.nav__links a[href^="#"], .sheet a[href^="#"]')];
  const secciones = [...new Set(enlaces.map(a => a.getAttribute('href')))]
    .map(h => document.getElementById(h.slice(1))).filter(Boolean);
  if (secciones.length && 'IntersectionObserver' in window) {
    const marcar = id => enlaces.forEach(a => {
      if (a.classList.contains('btn')) return;
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) marcar(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(s => io.observe(s));
  }

  /* Ayudas para formularios: un error bajo cada campo, el foco en el primero */
  window.Forma = {
    limpiar(form) {
      if (!form || typeof form.querySelectorAll !== 'function') return;
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      form.querySelectorAll('.field__error').forEach(el => { el.textContent = ''; });
    },
    error(form, nombre, texto) {
      if (!form || !form.elements) return;
      const el = form.elements[nombre];
      if (!el || typeof el.setAttribute !== 'function') return;
      const err = el.id ? document.getElementById(el.id + '-error') : null;
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = texto;
    },
    estado(form, texto, tono) {
      if (!form || typeof form.querySelector !== 'function') return;
      const s = form.querySelector('[data-form-status]');
      if (!s) return;
      s.textContent = texto; if (tono) s.dataset.tone = tono; else delete s.dataset.tone;
    },
    enfocarPrimero(form) {
      if (!form || typeof form.querySelector !== 'function') return 0;
      const el = form.querySelector('[aria-invalid="true"]'); if (el) el.focus();
      return form.querySelectorAll('[aria-invalid="true"]').length;
    },
    correoValido: v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  };
})();
