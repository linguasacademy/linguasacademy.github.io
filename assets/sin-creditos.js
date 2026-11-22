/* Lingua's Academy · sin créditos de fotos
   Las fotos de los tableros son de uso libre: no se muestra «Foto: Autor · Unsplash».
   Oculta cualquier línea corta cuyo texto completo sea un crédito de foto, también
   las que el tablero dibuja después (por eso el observador). No toca nada más. */
(function () {
  var RE = /^\s*(fotos?|photos?)\s*:[\s\S]*\b(unsplash|pexels|pixabay)\s*$/i;
  function limpiar(raiz) {
    if (!raiz || !raiz.querySelectorAll) return;
    var els = raiz.querySelectorAll('p, figcaption, small, span, div');
    for (var i = 0; i < els.length; i++) {
      var e = els[i], t = e.textContent;
      if (t && t.length < 240 && RE.test(t)) e.style.setProperty('display', 'none', 'important');
    }
  }
  function arrancar() {
    limpiar(document.body);
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var n = ms[i].target;
        if (n.nodeType === 1) limpiar(n); else if (n.parentElement) limpiar(n.parentElement);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
})();
